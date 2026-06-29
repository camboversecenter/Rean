
import { supabase } from './supabaseClient';
import { StudentPost, CommunityReply } from '../types';

// Map DB snake_case to Client type (Partial Duplication from communityService to avoid circular dependency or messy exports, keeping this clean)
const mapPostFromDB = (data: any): StudentPost => {
    const postReactions = {
        heart: data.reaction_heart || 0,
        bulb: data.reaction_bulb || 0,
        thumb: data.reaction_thumb || 0
    };
    if (data.likes && !data.reaction_heart && !data.reaction_bulb && !data.reaction_thumb) {
        postReactions.heart = data.likes;
    }

    return {
        id: data.id,
        author_id: data.author_id,
        authorName: data.profiles?.full_name || 'Unknown Student',
        authorAvatar: data.profiles?.avatar_url || '',
        content: data.content,
        timestamp: new Date(data.created_at).toLocaleDateString() + ' ' + new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: data.likes || 0,
        reactions: postReactions,
        attachmentType: 'text',
        tags: data.tags || [],
        bounty_points: data.bounty_points || 0,
        ai_quality_score: data.ai_quality_score || 0,
        isAnonymous: data.is_anonymous,
        isBookmarked: true, // When fetching from Saved Posts, it's always bookmarked
        replies: (data.community_replies || [])
            .map((r: any) => {
                const replyReactions = {
                    heart: r.reaction_heart || 0,
                    bulb: r.reaction_bulb || 0,
                    thumb: r.reaction_thumb || 0
                };
                if (r.likes && !r.reaction_heart && !r.reaction_bulb && !r.reaction_thumb) {
                    replyReactions.heart = r.likes;
                }
                return {
                    id: r.id,
                    post_id: r.post_id,
                    author_id: r.author_id,
                    authorName: r.author_id && r.profiles ? r.profiles.full_name : 'Kru REAN',
                    authorAvatar: r.author_id && r.profiles ? r.profiles.avatar_url : '',
                    content: r.content,
                    isAI: r.is_ai,
                    timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    likes: r.likes || 0,
                    reactions: replyReactions,
                    accepted: r.is_accepted,
                    ai_quality_score: r.ai_quality_score,
                    recommendedLinks: r.recommended_links
                };
            })
            .sort((a: CommunityReply, b: CommunityReply) => {
                if (a.accepted === b.accepted) return 0;
                return a.accepted ? -1 : 1;
            })
    };
};

/**
 * Toggle bookmark status for a post.
 * If saved -> remove. If not saved -> insert.
 */
export const toggleBookmark = async (postId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    // Check if exists
    const { data: existing } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

    if (existing) {
        // Remove
        await supabase
            .from('saved_posts')
            .delete()
            .eq('id', existing.id);
        return false; // Now NOT bookmarked
    } else {
        // Add
        await supabase
            .from('saved_posts')
            .insert([{ user_id: user.id, post_id: postId }]);
        return true; // Now IS bookmarked
    }
};

/**
 * Fetch all IDs of posts bookmarked by the current user.
 * Used to hydrate the main feed icons.
 */
export const fetchBookmarkedPostIds = async (): Promise<Set<string>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return new Set();
    }

    return new Set(data.map((row: any) => row.post_id));
};

/**
 * Fetch the actual list of saved posts for the "Saved" tab.
 */
export const fetchSavedPosts = async (page: number = 1, limit: number = 10): Promise<StudentPost[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Join saved_posts -> student_posts
    const { data, error } = await supabase
        .from('saved_posts')
        .select(`
            post_id,
            student_posts (
                *,
                profiles(full_name, avatar_url),
                community_replies(
                    *,
                    profiles(full_name, avatar_url)
                )
            )
        `)
        .eq('user_id', user.id)
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching saved posts:", error);
        return [];
    }

    // Map the nested student_posts structure back to our standard StudentPost type
    return data
        .map((row: any) => row.student_posts) // Extract the post object
        .filter((post: any) => post !== null) // Safety filter
        .map(mapPostFromDB);
};