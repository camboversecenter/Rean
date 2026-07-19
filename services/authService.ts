import { supabase } from './supabaseClient';
import { UserRole } from '../types';

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // Redirects back to the app after Google login
    },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Gets the user profile from public.profiles table.
 * If it doesn't exist (trigger failed), it creates it on the fly.
 */
export const getCurrentUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      // Fallback: Client-side profile creation if DB trigger failed or didn't run
      console.log('Profile missing, creating default on client...');

      const INITIAL_POINTS = 100; // Hardcoded Welcome Bonus

      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        lifetime_xp: 0,
        spendable_points: INITIAL_POINTS,
        level: 1,
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Failed to create profile on client', createError);
        // Return basic user info even if DB save fails, so UI doesn't crash
        return { ...newProfile, role: null };
      }

      const logData = {
        amount: INITIAL_POINTS,
        type: 'earn',
        reason: 'Welcome Bonus (កាដូស្វាគមន៍)',
        user_id: user.id,
      };
      // Log the Welcome Bonus Transaction so it shows in history
      await supabase.from('point_transactions').insert([logData]);

      return createdProfile;
    }

    return profile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
};

/**
 * Fetches a specific user profile by ID (Public View)
 */
export const getUserProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, lifetime_xp')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
};

/**
 * Updates the role in public.profiles table (not auth.users)
 */
export const updateUserRole = async (newRole: UserRole) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('No user logged in');

  // Use the shared Supabase client so this works with either the
  // publishable key or the legacy anon key (the old raw-fetch version
  // required VITE_SUPABASE_ANON_KEY specifically and broke onboarding
  // for deployments that only set the publishable key).
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', session.user.id)
    .select()
    .maybeSingle();

  if (error) throw new Error(`Failed to update role: ${error.message}`);
  return data;
};

export const hasRole = (profile: { role?: string } | null | unknown): boolean => {
  if (profile && typeof profile === 'object' && 'role' in profile) {
    return !!(profile as { role?: string }).role;
  }
  return false;
};
