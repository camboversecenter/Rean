import { supabase } from './supabaseClient';
import { getCurrentUser } from './authService';
import { MysteryBox, MysteryBoxItem, RewardClaim, PointTransaction } from '../types';

// --- CONFIGURATION ---
export const GAME_RULES = {
  // Action: { XP (Reputation), Points (Currency), Daily Limit }

  // 1. Asking Questions: Encouraged, awards XP only.
  POST_QUESTION: { xp: 5, points: 0, dailyLimit: 5, label: 'Daily Question Bonus' },

  // 2. Replying: Small subsidy to encourage participation. Strict daily limit to prevent spam.
  REPLY: { xp: 2, points: 1, dailyLimit: 5, label: 'Helpful Reply' },

  // 3. Likes: Social proof, awards XP only.
  RECEIVE_LIKE: { xp: 1, points: 0, dailyLimit: 20, label: 'Received Like' },

  // 4. Accepted Answer (The Big One):
  SOLUTION_ACCEPTED: { xp: 20, points: 0, dailyLimit: -1, label: 'Solution Accepted' },

  // 5. Lucky Drop (Random Reward)
  // XP 0 because it's luck, Points 0 placeholder (calculated dynamically), Limit 3 per day
  LUCKY_DROP: { xp: 0, points: 0, dailyLimit: 3, label: 'Lucky Drop' },
};

export type GameAction = keyof typeof GAME_RULES;

// --- HELPERS ---

const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const notifyPointsUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('rean-points-updated'));
  }
};

// --- CORE ACTIONS ---

export const canAfford = async (amount: number): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('spendable_points')
    .eq('id', user.id)
    .single();

  if (error || !data) return false;
  return (data.spendable_points || 0) >= amount;
};

// New Helper to check limits without awarding
export const checkCanEarn = async (targetId: string, action: GameAction): Promise<boolean> => {
  const rule = GAME_RULES[action];
  if (!rule) return false;
  if (rule.dailyLimit === -1) return true;

  const startOfDay = getStartOfDay();
  const { count, error } = await supabase
    .from('point_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', targetId)
    .eq('reason', rule.label)
    .gte('created_at', startOfDay);

  if (error) {
    console.error('Error checking limits', error);
    return false;
  }
  return (count || 0) < rule.dailyLimit;
};

export const spendPoints = async (amount: number, reason: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  // Preferred path: atomic server-side RPC (created by SUPABASE_HARDENING.sql).
  // It checks and deducts in a single UPDATE, so concurrent spends cannot
  // overdraw and clients cannot forge balances.
  const { data: rpcResult, error: rpcError } = await supabase.rpc('spend_points', {
    p_amount: amount,
    p_reason: reason,
  });
  if (!rpcError) {
    if (rpcResult === true) notifyPointsUpdate();
    return rpcResult === true;
  }

  // Legacy fallback for databases where SUPABASE_HARDENING.sql has not been
  // applied yet (RPC missing). Non-atomic; remove once the SQL is applied.
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('spendable_points')
    .eq('id', user.id)
    .single();

  if (fetchError || !profile) return false;

  if ((profile.spendable_points || 0) < amount) {
    return false; // Insufficient funds
  }

  const newBalance = (profile.spendable_points || 0) - amount;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ spendable_points: newBalance })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to deduct points', updateError);
    return false;
  }

  const spendLog = {
    amount: -amount,
    type: 'spend',
    reason: reason,
    user_id: user.id,
  };

  await supabase.from('point_transactions').insert([spendLog]);

  notifyPointsUpdate();
  return true;
};

export const awardAction = async (targetId: string, action: GameAction, customPoints?: number) => {
  const rule = GAME_RULES[action];
  if (!rule) return;

  // Preferred path: atomic server-side RPC (created by SUPABASE_HARDENING.sql).
  // The daily limit and the wallet update run inside one database function,
  // so clients cannot bypass limits or write arbitrary balances.
  const { error: rpcError } = await supabase.rpc('award_action', {
    p_target: targetId,
    p_action: action,
    p_custom_points: customPoints ?? null,
  });
  if (!rpcError) {
    notifyPointsUpdate();
    return;
  }

  // Legacy fallback for databases where SUPABASE_HARDENING.sql has not been
  // applied yet (RPC missing). Remove once the SQL is applied.
  if (rule.dailyLimit !== -1) {
    const startOfDay = getStartOfDay();
    const { count, error } = await supabase
      .from('point_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetId)
      .eq('reason', rule.label)
      .gte('created_at', startOfDay);

    if (error) console.error('Error checking limits', error);
    if (count !== null && count >= rule.dailyLimit) return;
  }

  const xpToAdd = rule.xp;
  const pointsToAdd = customPoints !== undefined ? customPoints : rule.points;

  const { data: profile } = await supabase
    .from('profiles')
    .select('lifetime_xp, spendable_points')
    .eq('id', targetId)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        lifetime_xp: (profile.lifetime_xp || 0) + xpToAdd,
        spendable_points: (profile.spendable_points || 0) + pointsToAdd,
      })
      .eq('id', targetId);
  }

  const earnLog = {
    amount: pointsToAdd,
    type: 'earn',
    reason: rule.label,
    user_id: targetId,
  };

  // Only log transaction if points are involved or for XP tracking purposes if needed
  await supabase.from('point_transactions').insert([earnLog]);

  notifyPointsUpdate();
};

export const transferBountyReward = async (recipientId: string, amount: number) => {
  if (amount <= 0) return;
  const { data: profile } = await supabase
    .from('profiles')
    .select('spendable_points')
    .eq('id', recipientId)
    .single();
  if (profile) {
    await supabase
      .from('profiles')
      .update({ spendable_points: (profile.spendable_points || 0) + amount })
      .eq('id', recipientId);
    const bountyLog = {
      amount: amount,
      type: 'earn',
      reason: 'Bounty Reward Claimed',
      user_id: recipientId,
    };
    await supabase.from('point_transactions').insert([bountyLog]);
    notifyPointsUpdate();
  }
};

export const fetchPointHistory = async (
  page: number = 1,
  limit: number = 20
): Promise<PointTransaction[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching point history', error);
    return [];
  }
  return data as PointTransaction[];
};

// --- MYSTERY BOX MANAGEMENT ---

export const fetchMysteryBoxes = async (): Promise<MysteryBox[]> => {
  // Fetch boxes AND their items
  const { data, error } = await supabase
    .from('mystery_boxes')
    .select(
      `
            *,
            items:mystery_box_items(*)
        `
    )
    .order('price_points', { ascending: true });

  if (error) {
    console.error('Error fetching boxes', error);
    return [];
  }
  return data;
};

export const createMysteryBox = async (box: Partial<MysteryBox>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const newBox = {
    title: box.title,
    description: box.description,
    price_points: box.price_points,
    cover_image: box.cover_image,
    owner_id: user.id,
  };

  const { data, error } = await supabase.from('mystery_boxes').insert([newBox]).select().single();

  if (error) throw error;
  return data;
};

export const addMysteryBoxItems = async (boxId: string, items: Partial<MysteryBoxItem>[]) => {
  if (!items.length) return;
  const { error } = await supabase.from('mystery_box_items').insert(
    items.map((item) => ({
      box_id: boxId,
      name: item.name,
      probability: item.probability,
    }))
  );
  if (error) throw error;
};

export const deleteMysteryBox = async (id: string) => {
  const { error } = await supabase.from('mystery_boxes').delete().eq('id', id);
  if (error) throw error;
};

export const getMyMysteryBoxes = async (): Promise<MysteryBox[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('mystery_boxes')
    .select(`*, items:mystery_box_items(*)`)
    .eq('owner_id', user.id);

  if (error) return [];
  return data;
};

// --- CLAIMS MANAGEMENT (WINNERS) ---

export const recordRewardClaim = async (boxId: string, rewardDetail: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const newClaim = {
    box_id: boxId,
    reward_detail: rewardDetail,
    status: 'Pending',
    user_id: user.id,
  };

  // Record the win
  const { error } = await supabase.from('reward_claims').insert([newClaim]);

  if (error) console.error('Failed to record claim', error);
};

// For Creators to see who won their boxes
// Note: Uses manual fetching to avoid Foreign Key issues if profiles table isn't explicitly linked in schema
export const fetchCreatorClaims = async (): Promise<RewardClaim[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. Fetch boxes owned by user to get IDs and Titles
  const { data: boxes } = await supabase
    .from('mystery_boxes')
    .select('id, title')
    .eq('owner_id', user.id);
  if (!boxes || boxes.length === 0) return [];

  const boxIds = boxes.map((b) => b.id);
  const boxMap = boxes.reduce((acc: Record<string, string>, b: { id: string; title: string }) => {
    acc[b.id] = b.title;
    return acc;
  }, {});

  // 2. Fetch claims for these boxes
  const { data: claims, error } = await supabase
    .from('reward_claims')
    .select('*')
    .in('box_id', boxIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching claims', error);
    return [];
  }

  if (!claims || claims.length === 0) return [];

  // 3. Manually fetch profiles of winners
  const userIds = [...new Set(claims.map((c: { user_id: string }) => c.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, email')
    .in('id', userIds);

  const profileMap = (profiles || []).reduce(
    (
      acc: Record<string, { id: string; full_name?: string; avatar_url?: string; email?: string }>,
      p: { id: string; full_name?: string; avatar_url?: string; email?: string }
    ) => {
      acc[p.id] = p;
      return acc;
    },
    {}
  );

  // 4. Map everything together
  return claims.map(
    (row: {
      id: string;
      box_id: string;
      user_id: string;
      reward_detail: string;
      status: string;
      created_at: string;
    }) => {
      const profile = profileMap[row.user_id];
      return {
        id: row.id,
        box_id: row.box_id,
        user_id: row.user_id,
        reward_detail: row.reward_detail,
        status: row.status as 'Pending' | 'Fulfilled',
        created_at: new Date(row.created_at).toLocaleString(),
        user_name: profile?.full_name || 'Unknown User',
        user_avatar: profile?.avatar_url,
        user_email: profile?.email,
        box_title: boxMap[row.box_id] || 'Unknown Box',
      };
    }
  );
};

// For Users to see what they won
export const getMyRewardClaims = async (): Promise<RewardClaim[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Use Manual fetch for safety as well if join fails
  const { data: claims, error } = await supabase
    .from('reward_claims')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !claims || claims.length === 0) {
    if (error) console.error('Error fetching my claims', error);
    return [];
  }

  // Fetch box details
  const boxIds = [...new Set(claims.map((c: { box_id: string }) => c.box_id))];
  let boxMap: Record<string, { id: string; title: string }> = {};

  if (boxIds.length > 0) {
    const { data: boxes } = await supabase
      .from('mystery_boxes')
      .select('id, title')
      .in('id', boxIds);
    boxMap = (boxes || []).reduce(
      (acc: Record<string, { id: string; title: string }>, b: { id: string; title: string }) => {
        acc[b.id] = b;
        return acc;
      },
      {}
    );
  }

  return claims.map(
    (row: {
      id: string;
      box_id: string;
      user_id: string;
      reward_detail: string;
      status: string;
      created_at: string;
    }) => ({
      id: row.id,
      box_id: row.box_id,
      user_id: row.user_id,
      reward_detail: row.reward_detail,
      status: row.status as 'Pending' | 'Fulfilled',
      created_at: new Date(row.created_at).toLocaleDateString(),
      box_title: boxMap[row.box_id]?.title || 'Unknown Box',
    })
  );
};

export const markClaimFulfilled = async (claimId: string) => {
  const { error } = await supabase
    .from('reward_claims')
    .update({ status: 'Fulfilled' })
    .eq('id', claimId);
  if (error) throw error;
};
