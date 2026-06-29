
import { supabase } from './supabaseClient';
import { Achievement } from '../types';

export const fetchStudentAchievements = async (userId: string): Promise<Achievement[]> => {
    const achievements: Achievement[] = [];

    try {
        // 1. Fetch Completed Missions
        const { data: missions, error: missionError } = await supabase
            .from('mission_enrollments')
            .select(`
                id,
                created_at,
                missions (title, mentor)
            `)
            .eq('student_id', userId)
            .eq('status', 'Completed');

        if (!missionError && missions) {
            missions.forEach((m: any) => {
                achievements.push({
                    id: m.id,
                    title: m.missions?.title || 'Unknown Mission',
                    type: 'Mission',
                    providerName: m.missions?.mentor || 'REAN Mentor',
                    completedDate: new Date(m.created_at).toLocaleDateString()
                });
            });
        }

        // 2. Fetch Completed Short Courses
        const { data: courses, error: courseError } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                created_at,
                short_courses (
                    title,
                    schools (name)
                )
            `)
            .eq('student_id', userId)
            .eq('status', 'Completed');

        if (!courseError && courses) {
            courses.forEach((c: any) => {
                achievements.push({
                    id: c.id,
                    title: c.short_courses?.title || 'Unknown Course',
                    type: 'Course',
                    providerName: c.short_courses?.schools?.name || 'School',
                    completedDate: new Date(c.created_at).toLocaleDateString()
                });
            });
        }

        // 3. Fetch Completed Tutor Sessions
        const { data: bookings, error: bookingError } = await supabase
            .from('tutor_bookings')
            .select(`
                id,
                created_at,
                subject,
                tutors:tutor_id (
                    profiles (full_name)
                )
            `)
            .eq('student_id', userId)
            .eq('status', 'Completed');

        if (!bookingError && bookings) {
            bookings.forEach((b: any) => {
                // Determine tutor name safely
                let tutorName = 'Tutor';
                if (b.tutors && b.tutors.profiles) {
                    tutorName = b.tutors.profiles.full_name;
                }

                achievements.push({
                    id: b.id,
                    title: `${b.subject} Session`,
                    type: 'Tutor Session',
                    providerName: tutorName,
                    completedDate: new Date(b.created_at).toLocaleDateString()
                });
            });
        }

        // Sort by date descending (newest first)
        return achievements.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());

    } catch (error) {
        console.error("Error fetching achievements:", error);
        return [];
    }
};
