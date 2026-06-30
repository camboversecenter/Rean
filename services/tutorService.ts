import { supabase } from './supabaseClient';
import { TutorProfile, TutorBooking, TutorRequest } from '../types';

// --- MAPPERS ---

const mapTutorProfileFromDB = (data: Record<string, any>, profileMap?: Record<string, any>): TutorProfile => {
  // Try to find profile in the joined data OR the lookup map
  let profile = null;

  if (data.profiles) {
    profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  } else if (profileMap && data.id) {
    profile = profileMap[data.id];
  }

  return {
    id: data.id,
    hourlyRate: data.hourly_rate,
    bio: data.bio,
    subjects: data.subjects || [],
    grades: data.grades || [],
    teachingMode: data.teaching_mode,
    location: data.location,
    experience: data.experience,
    isVerified: data.is_verified,
    is_listed: data.is_listed ?? true, // Default to true if null
    phoneContact: data.phone_contact,
    coverImage: data.cover_image, // Map new column
    fullName: profile?.full_name || 'Tutor',
    avatarUrl: profile?.avatar_url,
  };
};

const mapBookingFromDB = (data: Record<string, any>, profileMap?: Record<string, any>): TutorBooking => {
  // Handle joins or manual map
  let tutorName = 'Tutor';
  let studentName = 'Unknown Student';
  let studentAvatar = '';

  // Tutor Details
  if (data.tutor_profile?.full_name) {
    tutorName = data.tutor_profile.full_name;
  } else if (data.tutors?.profiles?.full_name) {
    tutorName = data.tutors.profiles.full_name;
  } else if (profileMap && data.tutor_id && profileMap[data.tutor_id]) {
    tutorName = profileMap[data.tutor_id].full_name;
  }

  // Student Details
  const student = Array.isArray(data.student) ? data.student[0] : data.student;
  if (student) {
    studentName = student.full_name;
    studentAvatar = student.avatar_url;
  } else if (profileMap && data.student_id && profileMap[data.student_id]) {
    studentName = profileMap[data.student_id].full_name;
    studentAvatar = profileMap[data.student_id].avatar_url;
  }

  return {
    id: data.id,
    studentId: data.student_id,
    tutorId: data.tutor_id,
    subject: data.subject,
    status: data.status,
    scheduledTime: new Date(data.scheduled_time).toLocaleString(),
    locationNotes: data.location_notes,
    createdAt: data.created_at,
    studentName,
    studentAvatar,
    tutorName,
  };
};

const mapRequestFromDB = (data: Record<string, any>, profileMap?: Record<string, any>): TutorRequest => {
  let profile = null;
  if (data.profiles) {
    profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  } else if (profileMap && data.student_id) {
    profile = profileMap[data.student_id];
  }

  return {
    id: data.id,
    studentId: data.student_id,
    name: profile?.full_name || 'Anonymous',
    avatar: profile?.avatar_url,
    subject: data.subject,
    grade: data.grade,
    budget: data.budget_range,
    description: data.description,
    location: data.location,
    status: data.status,
    timestamp: new Date(data.created_at).toLocaleDateString(),
  };
};

// --- HELPER: Manual Profile Fetch ---
const fetchProfilesManual = async (userIds: string[]) => {
  if (userIds.length === 0) return {};
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const map: Record<string, any> = {};
  data?.forEach((p: { id: string; full_name?: string; avatar_url?: string }) => (map[p.id] = p));
  return map;
};

// --- TUTOR PROFILE MANAGEMENT ---

export const getMyTutorProfile = async (): Promise<TutorProfile | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tutors')
    .select(`*, profiles (full_name, avatar_url)`)
    .eq('id', user.id)
    .maybeSingle();

  if (data) return mapTutorProfileFromDB(data);

  const { data: tutorData } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (!tutorData) return null;

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return mapTutorProfileFromDB(tutorData, { [user.id]: profileData });
};

export const getTutorById = async (id: string): Promise<TutorProfile | null> => {
  const { data } = await supabase
    .from('tutors')
    .select(`*, profiles (full_name, avatar_url)`)
    .eq('id', id)
    .single();

  if (data) return mapTutorProfileFromDB(data);

  const { data: tutorData } = await supabase.from('tutors').select('*').eq('id', id).single();
  if (!tutorData) return null;
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single();
  return mapTutorProfileFromDB(tutorData, { [id]: profileData });
};

export const updateTutorProfile = async (profile: Partial<TutorProfile>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');

  const payload = Object.fromEntries(
    Object.entries({
      hourly_rate: profile.hourlyRate,
      bio: profile.bio,
      subjects: profile.subjects,
      grades: profile.grades,
      teaching_mode: profile.teachingMode,
      location: profile.location,
      experience: profile.experience,
      phone_contact: profile.phoneContact,
      is_listed: profile.is_listed,
      cover_image: profile.coverImage,
    }).filter(([_, v]) => v !== undefined)
  );

  const { error } = await supabase.from('tutors').upsert({ id: user.id, ...payload });

  if (error) throw error;
};

// --- READ OPERATIONS (PUBLIC) ---

export const fetchAllTutors = async (
  page: number = 1,
  limit: number = 10,
  subjectFilter?: string
): Promise<TutorProfile[]> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // IMPORTANT: Only fetch tutors who are explicitly listed
  let query = supabase.from('tutors').select('*').eq('is_listed', true).range(from, to);

  if (subjectFilter && subjectFilter !== 'All') {
    query = query.contains('subjects', [subjectFilter]);
  }

  const { data: tutors, error } = await query;

  if (error || !tutors) return [];

  const userIds = tutors.map((t: { id: string }) => t.id);
  const profileMap = await fetchProfilesManual(userIds);

  return tutors.map((t: Record<string, any>) => mapTutorProfileFromDB(t, profileMap));
};

// --- BOOKINGS (SHARED) ---

export const createBooking = async (booking: {
  tutorId: string;
  subject: string;
  scheduledTime: string;
  notes?: string;
}) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to book');

  const { error } = await supabase.from('tutor_bookings').insert([
    {
      student_id: user.id,
      tutor_id: booking.tutorId,
      subject: booking.subject,
      scheduled_time: booking.scheduledTime,
      location_notes: booking.notes,
      status: 'Pending',
    },
  ]);

  if (error) throw error;
};

// Creates a booking initiated by the Tutor (Application to a Request)
export const applyToRequest = async (request: TutorRequest, message: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to apply');
  if (!request.studentId) throw new Error('Invalid request');

  // We reuse the tutor_bookings table.
  // tutor_id = current user
  // student_id = request owner
  const { error } = await supabase.from('tutor_bookings').insert([
    {
      student_id: request.studentId,
      tutor_id: user.id,
      subject: request.subject,
      scheduled_time: new Date().toISOString(), // Use current time as application timestamp
      location_notes: `[Job Application] ${message}\n\nBudget: ${request.budget}`,
      status: 'Pending',
    },
  ]);

  if (error) throw error;
};

export const getTutorBookings = async (): Promise<TutorBooking[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: bookings, error } = await supabase
    .from('tutor_bookings')
    .select('*')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !bookings) return [];

  const studentIds = bookings.map((b: { student_id: string }) => b.student_id);
  const profileMap = await fetchProfilesManual(studentIds);

  return bookings.map((b: Record<string, any>) => mapBookingFromDB(b, profileMap));
};

export const getStudentBookings = async (): Promise<TutorBooking[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: bookings, error } = await supabase
    .from('tutor_bookings')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !bookings) return [];

  const tutorIds = bookings.map((b: { tutor_id: string }) => b.tutor_id);
  const profileMap = await fetchProfilesManual(tutorIds);

  return bookings.map((b: Record<string, any>) => mapBookingFromDB(b, profileMap));
};

export const getBookingById = async (id: string): Promise<TutorBooking | null> => {
  const { data, error } = await supabase.from('tutor_bookings').select('*').eq('id', id).single();

  if (error || !data) return null;

  const profileMap = await fetchProfilesManual([data.student_id, data.tutor_id]);
  return mapBookingFromDB(data, profileMap);
};

export const updateBookingStatus = async (
  id: string,
  status: 'Accepted' | 'Rejected' | 'Completed'
) => {
  const { error } = await supabase.from('tutor_bookings').update({ status }).eq('id', id);
  if (error) throw error;
};

// --- CLASSROOM & HOMEWORK ---

export const fetchClassroomLogs = async (bookingId: string) => {
  const { data } = await supabase
    .from('classroom_logs')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  return data || [];
};

export const createClassroomLog = async (bookingId: string, actionType: string, note?: string) => {
  await supabase.from('classroom_logs').insert([
    {
      booking_id: bookingId,
      action_type: actionType,
      note: note,
    },
  ]);
};

export const fetchHomeworks = async (bookingId: string) => {
  const { data } = await supabase
    .from('tutor_homeworks')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });
  return data || [];
};

export const assignHomework = async (bookingId: string, title: string, description: string) => {
  await supabase.from('tutor_homeworks').insert([
    {
      booking_id: bookingId,
      title,
      description,
      status: 'Pending',
    },
  ]);
};

export const submitHomework = async (homeworkId: string, text: string) => {
  await supabase
    .from('tutor_homeworks')
    .update({
      status: 'Submitted',
      student_attachment: text,
    })
    .eq('id', homeworkId);
};

// --- REQUESTS (JOB BOARD) ---

export const fetchStudentRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<TutorRequest[]> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: requests, error } = await supabase
    .from('student_requests')
    .select('*')
    .eq('status', 'Open')
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error || !requests) return [];

  const studentIds = requests.map((r: { student_id: string }) => r.student_id);
  const profileMap = await fetchProfilesManual(studentIds);

  return requests.map((r: Record<string, any>) => mapRequestFromDB(r, profileMap));
};

export const createStudentRequest = async (request: Partial<TutorRequest>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { error } = await supabase.from('student_requests').insert([
    {
      student_id: user.id,
      subject: request.subject,
      grade: request.grade,
      budget_range: request.budget,
      description: request.description,
      location: request.location,
      status: 'Open',
    },
  ]);

  if (error) throw error;
};

export const deleteStudentRequest = async (id: string) => {
  const { error } = await supabase.from('student_requests').delete().eq('id', id);
  if (error) throw error;
};
