
-- 1. Create/Update the Ranked Feed Algorithm
-- This function handles sorting for Latest, Trending, and Bounty.
-- CRITICAL: It treats the bounty as 0 if the post already has an accepted answer.

DROP FUNCTION IF EXISTS get_trending_posts; -- Clean up old version if exists
DROP FUNCTION IF EXISTS get_ranked_posts;

CREATE OR REPLACE FUNCTION get_ranked_posts(
  p_limit int,
  p_offset int,
  p_sort_type text, -- 'latest', 'trending', 'bounty'
  p_search_query text DEFAULT ''
)
RETURNS SETOF student_posts
LANGUAGE sql
STABLE
AS $$
  SELECT p.*
  FROM student_posts p
  -- Check if solved (has ANY accepted reply)
  LEFT JOIN (
    SELECT post_id, bool_or(is_accepted) as is_solved
    FROM community_replies
    GROUP BY post_id
  ) solved ON p.id = solved.post_id
  -- Counts for trending score
  LEFT JOIN (
    SELECT post_id, count(*) as reply_count
    FROM community_replies
    GROUP BY post_id
  ) r ON p.id = r.post_id
  LEFT JOIN (
    SELECT post_id, count(*) as total_reactions
    FROM user_reactions
    GROUP BY post_id
  ) ur ON p.id = ur.post_id
  WHERE 
    (p_search_query = '' OR p.content ILIKE '%' || p_search_query || '%')
  ORDER BY
    -- SORT: High Bounty
    CASE WHEN p_sort_type = 'bounty' THEN
        -- If solved, treat bounty as 0 so it drops to bottom.
        (CASE WHEN COALESCE(solved.is_solved, false) THEN 0 ELSE p.bounty_points END)
    END DESC NULLS LAST,
    
    -- SORT: Trending
    CASE WHEN p_sort_type = 'trending' THEN
        (
            (COALESCE(r.reply_count, 0) * 3) + 
            (COALESCE(ur.total_reactions, 0) * 1) + 
            -- Bounty only boosts trend score if it's still active
            (CASE WHEN COALESCE(solved.is_solved, false) THEN 0 ELSE p.bounty_points END * 0.5)
        )
    END DESC NULLS LAST,
    
    -- Default / Tie-breaker: Newest First
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- 2. Performance Triggers (Keep existing logic)
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE student_posts
    SET 
      reaction_heart = reaction_heart + (CASE WHEN NEW.reaction = 'heart' THEN 1 ELSE 0 END),
      reaction_bulb = reaction_bulb + (CASE WHEN NEW.reaction = 'bulb' THEN 1 ELSE 0 END),
      reaction_thumb = reaction_thumb + (CASE WHEN NEW.reaction = 'thumb' THEN 1 ELSE 0 END)
    WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE student_posts
    SET 
      reaction_heart = reaction_heart - (CASE WHEN OLD.reaction = 'heart' THEN 1 ELSE 0 END),
      reaction_bulb = reaction_bulb - (CASE WHEN OLD.reaction = 'bulb' THEN 1 ELSE 0 END),
      reaction_thumb = reaction_thumb - (CASE WHEN OLD.reaction = 'thumb' THEN 1 ELSE 0 END)
    WHERE id = OLD.post_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE student_posts
    SET 
      reaction_heart = reaction_heart - (CASE WHEN OLD.reaction = 'heart' THEN 1 ELSE 0 END),
      reaction_bulb = reaction_bulb - (CASE WHEN OLD.reaction = 'bulb' THEN 1 ELSE 0 END),
      reaction_thumb = reaction_thumb - (CASE WHEN OLD.reaction = 'thumb' THEN 1 ELSE 0 END)
    WHERE id = OLD.post_id;
    
    UPDATE student_posts
    SET 
      reaction_heart = reaction_heart + (CASE WHEN NEW.reaction = 'heart' THEN 1 ELSE 0 END),
      reaction_bulb = reaction_bulb + (CASE WHEN NEW.reaction = 'bulb' THEN 1 ELSE 0 END),
      reaction_thumb = reaction_thumb + (CASE WHEN NEW.reaction = 'thumb' THEN 1 ELSE 0 END)
    WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reaction_change ON user_reactions;
CREATE TRIGGER on_reaction_change
AFTER INSERT OR UPDATE OR DELETE ON user_reactions
FOR EACH ROW EXECUTE FUNCTION update_post_reaction_counts();
