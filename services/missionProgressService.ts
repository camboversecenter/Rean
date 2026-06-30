import { supabase } from './supabaseClient';
import { Mission, MissionModuleStatus, SquadMember } from '../types';
import { mapMissionFromDB } from './missionService';
import { uploadFile } from './storageService';
import { generateEmbedding } from './geminiService';

export interface MissionEnrollment {
  id: string;
  missionId: string;
  studentId: string;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Rejected';
  squadId?: number; // The logic squad number (1, 2, 3...)
  classId?: string; // The class cohort ID
  className?: string; // Join field
  progress: Record<string, MissionModuleStatus>; // Map module_id -> status
  progressDetails: Record<
    string,
    { status: MissionModuleStatus; submission: string; feedback: string }
  >; // Detailed data
  squad_note?: string; // New: Shared scratchpad/notes for the squad
  mission?: Mission;
  student?: { full_name: string; avatar_url: string; email: string }; // Populated for creators
  // Payment Fields
  paymentReceiptUrl?: string;
  paymentStatus: 'none' | 'pending' | 'paid' | 'rejected';
}

/**
 * Checks how many students are enrolled in a mission.
 * Used to prevent deletion of active missions.
 */
export const getMissionEnrollmentCount = async (missionId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('mission_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('mission_id', missionId);

  if (error) {
    console.error('Error checking enrollments', error);
    return 0;
  }
  return count || 0;
};

// --- PLAGIARISM CHECKING (PGVECTOR) ---

export const checkPlagiarism = async (
  missionId: string,
  moduleId: string,
  enrollmentId: string,
  text: string
): Promise<{ id: string; similarity: number } | null> => {
  // 1. Generate Embedding via Gemini (Cost: 1 Point handled in service)
  const embedding = await generateEmbedding(text);

  if (!embedding) {
    console.warn('Embedding generation failed, skipping plagiarism check.');
    return null; // Fail open if API down, or fail closed? Let's fail open but log.
  }

  // 2. Call RPC to find neighbors
  // Note: match_threshold 0.85 indicates very high similarity
  const { data, error } = await supabase.rpc('match_submissions', {
    query_embedding: embedding,
    match_threshold: 0.85,
    match_count: 1,
    filter_mission_id: missionId,
    filter_module_id: moduleId,
    exclude_enrollment_id: enrollmentId,
  });

  if (error) {
    console.error('Vector search failed:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
};

export const saveSubmissionVector = async (
  missionId: string,
  enrollmentId: string,
  moduleId: string,
  text: string
) => {
  // We regenerate embedding to save it.
  // Optimization: We could return embedding from checkPlagiarism to reuse, but for clean separation we regen or pass it.
  // Given the cheap cost, regeneration ensures we have the latest.
  const embedding = await generateEmbedding(text);

  if (embedding) {
    // Insert into submission_embeddings table
    // Note: You must ensure this table is created in Supabase with vector extension
    await supabase.from('submission_embeddings').insert({
      enrollment_id: enrollmentId,
      module_id: moduleId,
      content: text,
      embedding: embedding,
    });
  }
};

export const enrollInMission = async (missionId: string, paymentReceipt?: File | null) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  // 1. Check if already enrolled to avoid duplicates
  const { data: existing } = await supabase
    .from('mission_enrollments')
    .select('id, status')
    .eq('mission_id', missionId)
    .eq('student_id', user.id)
    .maybeSingle();

  if (existing) {
    return await getMyMissionEnrollment(missionId);
  }

  // 2. Handle Payment Receipt Upload (if applicable)
  let receiptUrl = null;
  let paymentStatus = 'none';
  let status = 'In Progress'; // Default for free

  if (paymentReceipt) {
    receiptUrl = await uploadFile(paymentReceipt, 'payment-receipts');
    if (!receiptUrl) throw new Error('Failed to upload payment receipt');
    paymentStatus = 'pending';
    status = 'Pending'; // Wait for verification
  } else {
    // If no receipt provided, ensure mission is free (UI should guard this, but double check logic)
    status = 'In Progress';
  }

  // 3. Create new enrollment
  const { data: newEnrollment, error } = await supabase
    .from('mission_enrollments')
    .insert([
      {
        mission_id: missionId,
        student_id: user.id,
        status: status,
        payment_receipt_url: receiptUrl,
        payment_status: paymentStatus,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return await getMyMissionEnrollment(missionId);
};

// --- CREATOR MANAGEMENT FUNCTIONS ---

export const approvePayment = async (enrollmentId: string) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({
      status: 'In Progress',
      payment_status: 'paid',
    })
    .eq('id', enrollmentId);

  if (error) throw error;
};

export const rejectPayment = async (enrollmentId: string) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({
      status: 'Rejected',
      payment_status: 'rejected',
    })
    .eq('id', enrollmentId);

  if (error) throw error;
};

// For viewing receipt securely via Signed URL
export const getReceiptSignedUrl = async (path: string): Promise<string | null> => {
  // Path stored in DB is usually the public URL. We need to extract the path relative to bucket.
  const bucketName = 'payment-receipts';
  if (!path.includes(bucketName)) return null;

  const relativePath = path.split(`${bucketName}/`).pop();
  if (!relativePath) return null;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(relativePath, 60 * 60); // 1 Hour

  if (error || !data) return null;
  return data.signedUrl;
};

export const addStudentByEmail = async (
  missionId: string,
  email: string,
  classId?: string | null
) => {
  // 1. Find user ID by email from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', email.trim())
    .maybeSingle();

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError);
    throw new Error(
      'Student not found. Ask them to login to REAN first so their profile is created.'
    );
  }

  // 2. Check existing
  const { data: existing } = await supabase
    .from('mission_enrollments')
    .select('id')
    .eq('mission_id', missionId)
    .eq('student_id', profile.id)
    .maybeSingle();

  if (existing) {
    // If they exist, ensure active and update class
    await updateEnrollmentStatus(existing.id, 'In Progress');
    if (classId) {
      await updateStudentClass(existing.id, classId);
    }
    return;
  }

  // 3. Insert directly as 'In Progress' (Creator invited them, implies paid/free)
  const { error } = await supabase.from('mission_enrollments').insert([
    {
      mission_id: missionId,
      student_id: profile.id,
      status: 'In Progress',
      payment_status: 'paid', // Assume creator managed payment offline
      class_id: classId || null,
    },
  ]);

  if (error) throw error;
};

export const updateEnrollmentStatus = async (
  enrollmentId: string,
  status: 'In Progress' | 'Rejected' | 'Completed' | 'Pending',
  missionId?: string
) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({ status })
    .eq('id', enrollmentId);

  if (error) throw error;
};

export const updateStudentSquad = async (enrollmentId: string, squadId: number | null) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({ squad_id: squadId })
    .eq('id', enrollmentId);

  if (error) {
    console.error('Supabase Error updating squad:', error);
    throw error;
  }
};

export const updateStudentClass = async (enrollmentId: string, classId: string | null) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({ class_id: classId })
    .eq('id', enrollmentId);

  if (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const removeStudentFromMission = async (enrollmentId: string) => {
  // Hard delete for removal
  const { error } = await supabase.from('mission_enrollments').delete().eq('id', enrollmentId);

  if (error) throw error;
};

export const reviewSubmission = async (
  enrollmentId: string,
  moduleId: string,
  status: MissionModuleStatus,
  feedback: string
) => {
  // Check if progress row exists
  const { data: existing } = await supabase
    .from('mission_progress')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('module_id', moduleId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('mission_progress')
      .update({ status, ai_feedback: feedback })
      .eq('id', existing.id);
  } else {
    await supabase.from('mission_progress').insert([
      {
        enrollment_id: enrollmentId,
        module_id: moduleId,
        status,
        ai_feedback: feedback,
      },
    ]);
  }
};

// --- EXISTING METHODS ---

export const getMyMissionEnrollment = async (missionId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('mission_enrollments')
    .select(
      `
            *,
            mission_progress(*)
        `
    )
    .eq('mission_id', missionId)
    .eq('student_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  // Transform progress array to object for easy lookup
  const progressMap: Record<string, MissionModuleStatus> = {};
  const progressDetails: Record<string, any> = {};

  if (data.mission_progress) {
    data.mission_progress.forEach((p: any) => {
      progressMap[p.module_id] = p.status;
      progressDetails[p.module_id] = {
        status: p.status,
        submission: p.submission_text,
        feedback: p.ai_feedback,
      };
    });
  }

  return {
    ...data,
    squadId: data.squad_id, // Map DB snake_case
    paymentReceiptUrl: data.payment_receipt_url,
    paymentStatus: data.payment_status,
    progress: progressMap,
    progressDetails: progressDetails,
  };
};

/**
 * Fetches mission enrollments with pagination and filtering.
 */
export const getMissionEnrollments = async (
  missionId: string,
  page: number = 1,
  limit: number = 20,
  classFilter?: string | null
): Promise<{ data: MissionEnrollment[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('mission_enrollments')
    .select(
      `
            *,
            mission_classes(title),
            mission_progress(*)
        `,
      { count: 'exact' }
    )
    .eq('mission_id', missionId);

  // Apply Filter
  if (classFilter === 'unassigned') {
    query = query.is('class_id', null);
  } else if (classFilter) {
    query = query.eq('class_id', classFilter);
  }

  // Apply Pagination & Sorting
  query = query.range(from, to).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching enrollments', error);
    return { data: [], count: 0 };
  }

  // Fetch profiles manually
  const studentIds = data.map((e: any) => e.student_id);
  let profiles: any[] = [];

  if (studentIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', studentIds);
    profiles = profileData || [];
  }

  const mappedData = data.map((row: any) => {
    const progressMap: Record<string, MissionModuleStatus> = {};
    const progressDetails: Record<string, any> = {};

    if (row.mission_progress) {
      row.mission_progress.forEach((p: any) => {
        progressMap[p.module_id] = p.status;
        progressDetails[p.module_id] = {
          status: p.status,
          submission: p.submission_text,
          feedback: p.ai_feedback,
        };
      });
    }

    const student = profiles.find((p) => p.id === row.student_id) || {
      full_name: 'Unknown Student',
      email: '',
      avatar_url: '',
    };

    return {
      ...row,
      squadId: row.squad_id,
      classId: row.class_id,
      className: row.mission_classes?.title,
      student,
      paymentReceiptUrl: row.payment_receipt_url,
      paymentStatus: row.payment_status || 'none',
      progress: progressMap,
      progressDetails: progressDetails,
    };
  });

  return { data: mappedData, count: count || 0 };
};

// --- SQUAD VISIBILITY ---
export const getSquadMembers = async (
  missionId: string,
  squadId: number
): Promise<SquadMember[]> => {
  const { data, error } = await supabase
    .from('mission_enrollments')
    .select('student_id')
    .eq('mission_id', missionId)
    .eq('squad_id', squadId);

  if (error || !data) return [];

  const studentIds = data.map((d: any) => d.student_id);
  if (studentIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', studentIds);

  return (profiles || []).map((p: any) => ({
    studentId: p.id,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
  }));
};

export const updateMissionProgress = async (
  enrollmentId: string,
  moduleId: string,
  status: MissionModuleStatus,
  submissionText?: string,
  aiFeedback?: string
) => {
  const { data: existing } = await supabase
    .from('mission_progress')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('module_id', moduleId)
    .maybeSingle();

  const payload: any = { status };
  if (submissionText !== undefined) payload.submission_text = submissionText;
  if (aiFeedback !== undefined) payload.ai_feedback = aiFeedback;

  if (existing) {
    await supabase.from('mission_progress').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('mission_progress').insert([
      {
        enrollment_id: enrollmentId,
        module_id: moduleId,
        ...payload,
      },
    ]);
  }
};

export const updateMissionSquadNote = async (enrollmentId: string, note: string) => {
  const { error } = await supabase
    .from('mission_enrollments')
    .update({ squad_note: note })
    .eq('id', enrollmentId);

  if (error) throw error;
};

export const getMyActiveMissions = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('mission_enrollments')
    .select(
      `
            *,
            missions(*)
        `
    )
    .eq('student_id', user.id)
    .eq('status', 'In Progress');

  if (error) return [];

  return data
    .map((row: any) => ({
      ...(row.missions ? mapMissionFromDB(row.missions) : null),
      enrollmentId: row.id,
      enrollmentStatus: row.status,
    }))
    .filter((m: any) => m !== null);
};

// --- PUBLIC PROFILE FETCHER ---
export const getStudentMissions = async (studentId: string) => {
  const { data, error } = await supabase
    .from('mission_enrollments')
    .select(
      `
            *,
            missions(
                *,
                mission_enrollments(count)
            )
        `
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return data
    .map((row: any) => ({
      ...(row.missions ? mapMissionFromDB(row.missions) : null),
      enrollmentId: row.id,
      enrollmentStatus: row.status,
    }))
    .filter((m: any) => m !== null);
};
