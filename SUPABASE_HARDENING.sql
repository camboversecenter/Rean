-- ============================================================
-- REAN SUPABASE HARDENING
-- Run this in the Supabase SQL Editor.
--
-- What it does:
--   1. Blocks browsers from writing wallet columns directly
--      (spendable_points, lifetime_xp). Before this, any user
--      could set their own balance from the console.
--   2. Adds atomic SECURITY DEFINER functions the app calls via
--      RPC: spend_points() and award_action(). The client code
--      already prefers these RPCs and falls back to the legacy
--      direct writes only when the functions do not exist.
--   3. Keeps the ai-assistant Edge Function unaffected: it uses
--      the service-role key, which bypasses these restrictions.
--
-- Apply AFTER deploying the app version that calls the RPCs.
-- ============================================================

-- ------------------------------------------------------------
-- 1. COLUMN-LEVEL LOCKDOWN
-- Authenticated users may update only their profile fields, never
-- their wallet. (RLS row policies still apply on top of this.)
-- ------------------------------------------------------------
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, role) ON public.profiles TO authenticated;

-- Clients must not write transactions directly either; the functions
-- below (and the service-role Edge Function) do the logging.
REVOKE INSERT, UPDATE, DELETE ON public.point_transactions FROM authenticated;
GRANT SELECT ON public.point_transactions TO authenticated;

-- ------------------------------------------------------------
-- 2. ATOMIC SPEND
-- Deducts points from the CALLING user only. The balance check and
-- the deduction happen in one UPDATE, so concurrent requests cannot
-- overdraw the wallet.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.spend_points(p_amount integer, p_reason text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_updated integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN false;
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET spendable_points = spendable_points - p_amount
  WHERE id = v_user
    AND COALESCE(spendable_points, 0) >= p_amount;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN false; -- insufficient funds
  END IF;

  INSERT INTO public.point_transactions (user_id, amount, type, reason)
  VALUES (v_user, -p_amount, 'spend', LEFT(COALESCE(p_reason, 'Spend'), 200));

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_points(integer, text) FROM public;
GRANT EXECUTE ON FUNCTION public.spend_points(integer, text) TO authenticated;

-- ------------------------------------------------------------
-- 3. ATOMIC AWARD WITH SERVER-SIDE RULES AND DAILY LIMITS
-- Mirrors GAME_RULES in services/gamificationService.ts. Keep the
-- two in sync when you change the rules.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_action(
  p_target uuid,
  p_action text,
  p_custom_points integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_xp integer;
  v_points integer;
  v_limit integer;
  v_label text;
  v_today_count integer;
BEGIN
  IF v_caller IS NULL OR p_target IS NULL THEN
    RETURN false;
  END IF;

  -- Server-side copy of GAME_RULES
  CASE p_action
    WHEN 'POST_QUESTION'     THEN v_xp := 5;  v_points := 0; v_limit := 5;  v_label := 'Daily Question Bonus';
    WHEN 'REPLY'             THEN v_xp := 2;  v_points := 1; v_limit := 5;  v_label := 'Helpful Reply';
    WHEN 'RECEIVE_LIKE'      THEN v_xp := 1;  v_points := 0; v_limit := 20; v_label := 'Received Like';
    WHEN 'SOLUTION_ACCEPTED' THEN v_xp := 20; v_points := 0; v_limit := -1; v_label := 'Solution Accepted';
    WHEN 'LUCKY_DROP'        THEN v_xp := 0;  v_points := 0; v_limit := 3;  v_label := 'Lucky Drop';
    ELSE RETURN false;
  END CASE;

  -- Lucky drops carry a dynamic point amount, capped server-side.
  IF p_custom_points IS NOT NULL THEN
    IF p_action <> 'LUCKY_DROP' OR p_custom_points < 0 OR p_custom_points > 50 THEN
      RETURN false;
    END IF;
    v_points := p_custom_points;
  END IF;

  -- Self-award only, except likes and accepted solutions, which are
  -- granted TO another user by the person reacting or accepting.
  IF p_action NOT IN ('RECEIVE_LIKE', 'SOLUTION_ACCEPTED') AND p_target <> v_caller THEN
    RETURN false;
  END IF;
  -- Nobody can like or accept their own content into rewards.
  IF p_action IN ('RECEIVE_LIKE', 'SOLUTION_ACCEPTED') AND p_target = v_caller THEN
    RETURN false;
  END IF;

  -- Daily limit, evaluated on the server clock (UTC), immune to
  -- client clock tampering.
  IF v_limit <> -1 THEN
    SELECT COUNT(*) INTO v_today_count
    FROM public.point_transactions
    WHERE user_id = p_target
      AND reason = v_label
      AND created_at >= date_trunc('day', now());
    IF v_today_count >= v_limit THEN
      RETURN false;
    END IF;
  END IF;

  UPDATE public.profiles
  SET lifetime_xp = COALESCE(lifetime_xp, 0) + v_xp,
      spendable_points = COALESCE(spendable_points, 0) + v_points
  WHERE id = p_target;

  INSERT INTO public.point_transactions (user_id, amount, type, reason)
  VALUES (p_target, v_points, 'earn', v_label);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.award_action(uuid, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.award_action(uuid, text, integer) TO authenticated;

-- ------------------------------------------------------------
-- 4. NOTES AND LIMITATIONS
-- ------------------------------------------------------------
-- * award_action still trusts the caller about WHICH event happened
--   (for example that a like really occurred). Full event validation
--   means moving awards into database triggers on the reactions and
--   replies tables; treat that as the next hardening phase.
-- * The bounty transfer for accepted answers already runs through the
--   award-bounty action of the ai-assistant Edge Function with
--   ownership checks; keep using that path.
-- * After applying this file, verify in the browser console that
--   direct writes fail:
--     await supabase.from('profiles').update({ spendable_points: 9999 }).eq('id', '<your-id>')
--   must return a permission error.
