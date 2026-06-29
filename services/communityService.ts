
import { supabase } from './supabaseClient';
import { StudentPost, CommunityReply, ReactionType } from '../types';
import { awardAction, spendPoints, canAfford } from './gamificationService';
import { checkContentQuality } from './geminiService';

// --- MAPPERS ---

const mapReplyFromDB = (data: any): CommunityReply => {
    const reactionCounts = {
        heart: data.reaction_heart || 0,
        bulb: data.reaction_bulb || 0,
        thumb: data.reaction_thumb || 0
    };

    if (data.likes && !data.reaction_heart && !data.reaction_bulb && !data.reaction_thumb) {
        reactionCounts.heart = data.likes;
    }

    return {
        id: data.id,
        post_id: data.post_id,
        author_id: data.author_id,
        authorName: data.author_id && data.profiles ? data.profiles.full_name : 'Kru REAN',
        authorAvatar: data.author_id && data.profiles ? data.profiles.avatar_url : '',
        content: data.content,
        isAI: data.is_ai,
        timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: data.likes || 0,
        reactions: reactionCounts,
        userReaction: data.user_reaction as ReactionType | null,
        accepted: data.is_accepted,
        ai_quality_score: data.ai_quality_score, 
        recommendedLinks: data.recommended_links
    };
};

const mapPostFromDB = (data: any): StudentPost => {
    const reactionCounts = {
        heart: data.reaction_heart || 0,
        bulb: data.reaction_bulb || 0,
        thumb: data.reaction_thumb || 0
    };

    if (data.likes && !data.reaction_heart && !data.reaction_bulb && !data.reaction_thumb) {
        reactionCounts.heart = data.likes;
    }

    return {
        id: data.id,
        author_id: data.author_id,
        authorName: data.profiles?.full_name || 'Unknown Student',
        authorAvatar: data.profiles?.avatar_url || '',
        content: data.content,
        timestamp: new Date(data.created_at).toLocaleDateString() + ' ' + new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: data.likes || 0,
        reactions: reactionCounts,
        userReaction: data.user_reaction as ReactionType | null,
        attachmentType: 'text',
        tags: data.tags || [],
        bounty_points: data.bounty_points || 0,
        ai_quality_score: data.ai_quality_score || 0,
        isAnonymous: data.is_anonymous,
        replies: (data.community_replies || [])
            .map(mapReplyFromDB)
            .sort((a: CommunityReply, b: CommunityReply) => {
                if (a.accepted === b.accepted) return 0;
                return a.accepted ? -1 : 1;
            })
    };
};

// --- API METHODS ---

export type SortOption = 'latest' | 'trending' | 'bounty';

/**
 * Fetches the feed with pagination and sorting via RPC.
 */
export const fetchCommunityFeed = async (
    page: number = 1, 
    limit: number = 10, 
    searchQuery: string = '',
    sortBy: SortOption = 'latest'
): Promise<StudentPost[]> => {
    const from = (page - 1) * limit;
    
    // We use the new unified RPC for all feed fetching to ensure consistent "Active Bounty" logic
    const { data, error } = await supabase
        .rpc('get_ranked_posts', { 
            p_limit: limit, 
            p_offset: from, 
            p_sort_type: sortBy,
            p_search_query: searchQuery
        })
        .select(`
            *,
            profiles(full_name, avatar_url),
            community_replies(
                *,
                profiles(full_name, avatar_url)
            )
        `);

    if (error) {
        console.error("Error fetching feed:", error);
        return [];
    }

    // Manual fetch of user reactions for these posts if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userReactionsMap: Record<string, ReactionType> = {};
    
    if (user && data && data.length > 0) {
        const postIds = data.map((p: any) => p.id);
        const { data: reactions } = await supabase
            .from('user_reactions')
            .select('post_id, reaction')
            .eq('user_id', user.id)
            .in('post_id', postIds);
            
        if (reactions) {
            reactions.forEach((r: any) => {
                userReactionsMap[r.post_id] = r.reaction;
            });
        }
    }

    return (data || []).map((row: any) => {
        const post = mapPostFromDB(row);
        if (userReactionsMap[post.id]) {
            post.userReaction = userReactionsMap[post.id];
        }
        return post;
    });
};

/**
 * Fetches a single post by ID.
 */
export const fetchPostById = async (id: string): Promise<StudentPost | null> => {
    const { data, error } = await supabase
        .from('student_posts')
        .select(`
            *,
            profiles(full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

    if (error || !data) return null;
    
    const post = mapPostFromDB({ ...data, community_replies: [] });

    // Inject User Reaction
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: reaction } = await supabase
            .from('user_reactions')
            .select('reaction')
            .eq('user_id', user.id)
            .eq('post_id', id)
            .maybeSingle();
        if (reaction) post.userReaction = reaction.reaction;
    }

    return post;
};

/**
 * Fetches replies for a post with pagination.
 */
export const fetchReplies = async (postId: string, page: number = 1, limit: number = 20): Promise<CommunityReply[]> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('community_replies')
        .select(`
            *,
            profiles(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('is_accepted', { ascending: false }) // Accepted first
        .order('created_at', { ascending: true })   // Then chronological
        .range(from, to);

    if (error) {
        console.error("Error fetching replies", error);
        return [];
    }

    // Fetch user reactions for replies
    const { data: { user } } = await supabase.auth.getUser();
    let userReactionsMap: Record<string, ReactionType> = {};
    
    if (user && data.length > 0) {
        const replyIds = data.map((r: any) => r.id);
        const { data: reactions } = await supabase
            .from('user_reactions')
            .select('reply_id, reaction')
            .eq('user_id', user.id)
            .in('reply_id', replyIds);
            
        if (reactions) {
            reactions.forEach((r: any) => {
                userReactionsMap[r.reply_id] = r.reaction;
            });
        }
    }

    return data.map((row: any) => {
        const reply = mapReplyFromDB(row);
        if (userReactionsMap[reply.id]) {
            reply.userReaction = userReactionsMap[reply.id];
        }
        return reply;
    });
};

export const createStudentPost = async (content: string, bounty: number = 0, isAnonymous: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to post.");

    if (bounty > 0) {
        const affordable = await canAfford(bounty);
        if (!affordable) throw new Error(`Not enough points for ${bounty} bounty.`);
        
        const success = await spendPoints(bounty, 'Created Question Bounty');
        if (!success) throw new Error("Failed to deduct points.");
    }

    const { data, error } = await supabase
        .from('student_posts')
        .insert([{
            author_id: user.id,
            content: content,
            bounty_points: bounty,
            is_anonymous: isAnonymous,
            tags: ['#LazyLearning']
        }])
        .select(`*, profiles(full_name, avatar_url)`)
        .single();

    if (error) throw error;
    await awardAction(user.id, 'POST_QUESTION');
    
    return {
        ...mapPostFromDB({...data, community_replies: []}),
        replies: []
    };
};

export const createCommunityReply = async (postId: string, content: string, isAi: boolean = false, links: any[] = []) => {
    let authorId = null;
    let aiScore = 0;
    
    if (!isAi) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in to reply.");
        authorId = user.id;

        if (content.length > 5) {
             aiScore = await checkContentQuality(content);
        }
    } else {
        aiScore = 100;
        authorId = null;
    }

    const { data, error } = await supabase
        .from('community_replies')
        .insert([{
            post_id: postId,
            author_id: authorId,
            content: content,
            is_ai: isAi,
            recommended_links: links,
            ai_quality_score: aiScore
        }])
        .select(`*, profiles(full_name, avatar_url)`)
        .single();

    if (error) throw error;

    if (!isAi && authorId) {
        if (aiScore >= 70) {
            await awardAction(authorId, 'REPLY');
        }
    }

    return mapReplyFromDB(data);
};

export const updateCommunityReply = async (replyId: string, content: string) => {
    const { error } = await supabase
        .from('community_replies')
        .update({ content })
        .eq('id', replyId);
    if (error) throw error;
};

export const toggleReaction = async (
    entityId: string, 
    entityType: 'post' | 'reply', 
    reactionType: ReactionType,
    authorId?: string
) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    // 1. Check existing reaction
    const query = supabase
        .from('user_reactions')
        .select('id, reaction')
        .eq('user_id', user.id);
    
    if (entityType === 'post') query.eq('post_id', entityId);
    else query.eq('reply_id', entityId);

    const { data: existing, error: fetchError } = await query.maybeSingle();
    if (fetchError) throw fetchError;

    let operation = 'none';

    if (existing) {
        if (existing.reaction === reactionType) {
            await supabase.from('user_reactions').delete().eq('id', existing.id);
            operation = 'removed';
        } else {
            await supabase.from('user_reactions').update({ reaction: reactionType }).eq('id', existing.id);
            operation = 'switched';
        }
    } else {
        const payload: any = { 
            user_id: user.id, 
            reaction: reactionType 
        };
        if (entityType === 'post') payload.post_id = entityId;
        else payload.reply_id = entityId;

        await supabase.from('user_reactions').insert([payload]);
        operation = 'added';
    }

    if (operation === 'added' && authorId && authorId !== user.id) {
        const points = reactionType === 'bulb' ? 5 : 1; 
        await awardAction(authorId, 'RECEIVE_LIKE', points);
    }
    
    return operation;
};

export const acceptAnswer = async (postId: string, replyId: string, replyAuthorId: string | undefined) => {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
            action: 'award-bounty',
            payload: { postId, replyId }
        }
    });

    if (error || data?.error) {
        throw new Error(data?.error || "Failed to accept answer.");
    }
};
