import { supabase } from './supabaseClient';
import { UserProfile, PointTransaction } from '../types';

export const fetchLeaderboard = async (): Promise<UserProfile[]> => {
    // Note: In a real app, you might limit this query or use a materialized view for performance
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('lifetime_xp', { ascending: false })
        .limit(50);
    
    if (error) {
        console.error("Leaderboard fetch error", error);
        return [];
    }
    return data;
};

export const fetchRecentActivity = async (): Promise<PointTransaction[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch Point Transactions (Earnings/Spendings)
    const { data: transactions } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
    return transactions || [];
};

export const calculateLevel = (xp: number) => {
    // Simple formula: Level 1 starts at 0. Each 100 XP is a level.
    // Level = floor(XP / 100) + 1
    return Math.floor(xp / 100) + 1;
};

export const calculateNextLevelProgress = (xp: number) => {
    const currentLevelXp = Math.floor(xp / 100) * 100;
    const nextLevelXp = currentLevelXp + 100;
    const progress = xp - currentLevelXp;
    return {
        currentLevelXp,
        nextLevelXp,
        progress, // 0 to 99
        percent: progress // Since it's out of 100
    };
};