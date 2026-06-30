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
        role: null,
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

      // Log the Welcome Bonus Transaction so it shows in history
      await supabase.from('point_transactions').insert([
        {
          user_id: user.id,
          amount: INITIAL_POINTS,
          type: 'earn',
          reason: 'Welcome Bonus (កាដូស្វាគមន៍)',
        },
      ]);

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
export const updateUserRole = async (role: UserRole) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const hasRole = (profile: any): boolean => {
  return !!profile?.role;
};
