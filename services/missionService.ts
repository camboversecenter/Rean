
import { supabase } from './supabaseClient';
import { Mission, MissionModule, MissionCategory, MissionClass } from '../types';

// Map DB snake_case to CamelCase
export const mapMissionFromDB = (data: any): Mission => ({
    id: data.id,
    ownerId: data.owner_id,
    mentorId: data.mentor_id,
    title: data.title,
    mentor: data.mentor || 'សុភាទន្សាយ',
    price: data.price,
    level: data.level,
    squadSize: data.squad_size,
    squadCreation: data.squad_creation || 'auto', 
    enrollmentType: data.enrollment_type || 'open', // Default to open if column missing or null
    category: data.category as MissionCategory,
    thumbnail: data.thumbnail,
    description: data.description,
    modules: data.modules || [],
    paymentQrUrl: data.payment_qr_url,
    paymentInstruction: data.payment_instruction,
    telegramGroupLink: data.telegram_group_link,
    enablePlagiarismCheck: data.enable_plagiarism_check ?? false,
    enrolledCount: data.mission_enrollments?.[0]?.count || 0
});

// --- PUBLIC FETCHING WITH PAGINATION ---

export const fetchAllMissions = async (
    page: number = 1,
    limit: number = 10,
    category?: string
): Promise<Mission[]> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('missions')
        .select('*, mission_enrollments(count)')
        .range(from, to)
        .order('created_at', { ascending: false });

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching missions:", error);
        return [];
    }
    return data.map(mapMissionFromDB);
};

export const fetchMissionById = async (id: string): Promise<Mission | null> => {
    const { data, error } = await supabase
        .from('missions')
        .select('*, mission_enrollments(count)')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error("Error fetching mission:", error);
        return null;
    }
    return mapMissionFromDB(data);
};

// --- CREATOR / OWNER METHODS ---

export const getMyMissions = async (): Promise<Mission[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Fetch Owned Missions
    const { data: owned, error: ownerError } = await supabase
        .from('missions')
        .select('*, mission_enrollments(count)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    // 2. Fetch Mentored Missions
    const { data: mentored, error: mentorError } = await supabase
        .from('missions')
        .select('*, mission_enrollments(count)')
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

    if (ownerError) console.error("Error fetching owned missions:", ownerError);
    if (mentorError) console.error("Error fetching mentored missions:", mentorError);

    // Merge and Deduplicate based on ID
    const allRaw = [...(owned || []), ...(mentored || [])];
    const uniqueMap = new Map();
    allRaw.forEach(item => uniqueMap.set(item.id, item));
    
    const combined = Array.from(uniqueMap.values());
    
    // Sort combined by created_at desc
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined.map(mapMissionFromDB);
};

export const createMission = async (mission: Partial<Mission>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const payload = {
        owner_id: user.id,
        title: mission.title,
        mentor: mission.mentor,
        mentor_id: mission.mentorId, 
        price: mission.price,
        level: mission.level,
        squad_size: mission.squadSize,
        squad_creation: mission.squadCreation || 'auto',
        enrollment_type: mission.enrollmentType || 'open',
        category: mission.category,
        thumbnail: mission.thumbnail,
        description: mission.description,
        modules: mission.modules, // Storing as JSONB
        payment_qr_url: mission.paymentQrUrl,
        payment_instruction: mission.paymentInstruction,
        telegram_group_link: mission.telegramGroupLink,
        enable_plagiarism_check: mission.enablePlagiarismCheck
    };

    const { data, error } = await supabase
        .from('missions')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;
    return mapMissionFromDB(data);
};

export const updateMission = async (id: string, mission: Partial<Mission>) => {
    const payload: any = {
        title: mission.title,
        mentor: mission.mentor,
        mentor_id: mission.mentorId,
        price: mission.price,
        level: mission.level,
        squad_size: mission.squadSize,
        squad_creation: mission.squadCreation,
        enrollment_type: mission.enrollmentType,
        category: mission.category,
        thumbnail: mission.thumbnail,
        description: mission.description,
        modules: mission.modules,
        payment_qr_url: mission.paymentQrUrl,
        payment_instruction: mission.paymentInstruction,
        telegram_group_link: mission.telegramGroupLink,
        enable_plagiarism_check: mission.enablePlagiarismCheck
    };

    // Clean undefined
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase
        .from('missions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return mapMissionFromDB(data);
};

export const deleteMission = async (id: string) => {
    const { error } = await supabase.from('missions').delete().eq('id', id);
    if (error) throw error;
};

// --- TEAM MANAGEMENT ---

export const assignMissionMentor = async (missionId: string, email: string) => {
    // 1. Find user by email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('email', email.trim())
        .maybeSingle();

    if (profileError || !profile) {
        throw new Error("User not found. Please ensure the teacher has a REAN account.");
    }

    // 2. Update mission with BOTH ID and Name
    const { error } = await supabase
        .from('missions')
        .update({ 
            mentor_id: profile.id, 
            mentor: profile.full_name 
        })
        .eq('id', missionId);

    if (error) throw error;
    return profile;
};

// --- CLASS / COHORT MANAGEMENT ---

export const getMissionClasses = async (missionId: string): Promise<MissionClass[]> => {
    const { data, error } = await supabase
        .from('mission_classes')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching classes", error);
        return [];
    }

    return data.map((c: any) => ({
        id: c.id,
        missionId: c.mission_id,
        title: c.title,
        startDate: c.start_date,
        endDate: c.end_date,
        code: c.code
    }));
};

export const createMissionClass = async (missionId: string, title: string) => {
    const { data, error } = await supabase
        .from('mission_classes')
        .insert([{ mission_id: missionId, title: title }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteMissionClass = async (classId: string) => {
    const { error } = await supabase.from('mission_classes').delete().eq('id', classId);
    if (error) throw error;
};
