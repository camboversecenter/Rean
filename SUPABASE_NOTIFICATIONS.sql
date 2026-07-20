-- ============================================================
-- REAN NOTIFICATION CENTER
-- Run this in the Supabase SQL Editor (after SUPABASE_SETUP.sql
-- and SUPABASE_HARDENING.sql).
--
-- What it does:
--   1. Creates the notifications table with RLS: users can read,
--      mark-as-read, and delete ONLY their own notifications, and
--      can never insert rows directly.
--   2. Creates SECURITY DEFINER triggers that write notifications
--      for the events users care about:
--        - new reply on your question (incl. Kru REAN AI replies)
--        - your answer was accepted
--        - someone reacted to your post/reply
--        - course / mission enrollment status changes
--        - tutor booking requests and status changes
--   3. Adds the table to the supabase_realtime publication so the
--      app receives new notifications live (the bell updates
--      without a refresh).
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE + RLS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  type text NOT NULL, -- 'reply' | 'accepted' | 'reaction' | 'enrollment' | 'booking'
  title text NOT NULL,
  body text,
  link text, -- in-app route, e.g. /community/question/<id>
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id) WHERE NOT is_read;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;
CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Clients may only flip is_read; rows are created by the triggers
-- below (SECURITY DEFINER) or the service role.
REVOKE INSERT, UPDATE ON public.notifications FROM authenticated;
GRANT SELECT, DELETE ON public.notifications TO authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;
REVOKE ALL ON public.notifications FROM anon;

-- ------------------------------------------------------------
-- 2. SHARED HELPER
-- Inserts a notification, skipping self-notifications and null
-- targets. All trigger functions below go through this.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.push_notification(
  p_user uuid,
  p_actor uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user IS NULL OR p_user = p_actor THEN
    RETURN;
  END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, title, body, link)
  VALUES (p_user, p_actor, p_type, p_title, LEFT(p_body, 200), p_link);
END;
$$;

REVOKE ALL ON FUNCTION public.push_notification(uuid, uuid, text, text, text, text) FROM public;

-- ------------------------------------------------------------
-- 3. COMMUNITY: new reply on your question
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author uuid;
BEGIN
  SELECT author_id INTO v_post_author FROM public.student_posts WHERE id = NEW.post_id;
  PERFORM public.push_notification(
    v_post_author,
    NEW.author_id,
    'reply',
    CASE WHEN NEW.is_ai
      THEN 'Kru REAN បានឆ្លើយសំណួររបស់អ្នក (Kru REAN answered your question)'
      ELSE 'មានចម្លើយថ្មីលើសំណួររបស់អ្នក (New reply on your question)'
    END,
    NEW.content,
    '/community/question/' || NEW.post_id
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_reply_notify ON public.community_replies;
CREATE TRIGGER on_reply_notify
AFTER INSERT ON public.community_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reply();

-- ------------------------------------------------------------
-- 4. COMMUNITY: your answer was accepted
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author uuid;
BEGIN
  IF COALESCE(OLD.is_accepted, false) = false AND NEW.is_accepted = true THEN
    SELECT author_id INTO v_post_author FROM public.student_posts WHERE id = NEW.post_id;
    PERFORM public.push_notification(
      NEW.author_id,
      v_post_author,
      'accepted',
      'ចម្លើយរបស់អ្នកត្រូវបានទទួលយក (Your answer was accepted) +20 XP',
      NEW.content,
      '/community/question/' || NEW.post_id
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_accept_notify ON public.community_replies;
CREATE TRIGGER on_accept_notify
AFTER UPDATE OF is_accepted ON public.community_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_on_accept();

-- ------------------------------------------------------------
-- 5. COMMUNITY: someone reacted to your post / reply
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
  v_post uuid;
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    SELECT author_id INTO v_author FROM public.student_posts WHERE id = NEW.post_id;
    v_post := NEW.post_id;
    PERFORM public.push_notification(
      v_author,
      NEW.user_id,
      'reaction',
      'មានអ្នកចូលចិត្តការបង្ហោះរបស់អ្នក (Someone reacted to your post)',
      NULL,
      '/community/question/' || v_post
    );
  ELSIF NEW.reply_id IS NOT NULL THEN
    SELECT author_id, post_id INTO v_author, v_post
    FROM public.community_replies WHERE id = NEW.reply_id;
    PERFORM public.push_notification(
      v_author,
      NEW.user_id,
      'reaction',
      'មានអ្នកចូលចិត្តចម្លើយរបស់អ្នក (Someone reacted to your reply)',
      NULL,
      '/community/question/' || v_post
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_reaction_notify ON public.user_reactions;
CREATE TRIGGER on_reaction_notify
AFTER INSERT ON public.user_reactions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_reaction();

-- ------------------------------------------------------------
-- 6. SHORT COURSES: enrollment status changed
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_course_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.push_notification(
      NEW.student_id,
      NULL,
      'enrollment',
      CASE NEW.status
        WHEN 'Approved' THEN 'ការចុះឈ្មោះវគ្គសិក្សាត្រូវបានអនុម័ត (Course enrollment approved)'
        WHEN 'Rejected' THEN 'ការចុះឈ្មោះវគ្គសិក្សាត្រូវបានបដិសេធ (Course enrollment rejected)'
        WHEN 'Completed' THEN 'អបអរសាទរ! អ្នកបានបញ្ចប់វគ្គសិក្សា (Course completed)'
        ELSE 'ស្ថានភាពចុះឈ្មោះវគ្គសិក្សាបានផ្លាស់ប្ដូរ (Enrollment status updated): ' || NEW.status
      END,
      NULL,
      '/course/' || NEW.course_id
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_course_enrollment_notify ON public.course_enrollments;
CREATE TRIGGER on_course_enrollment_notify
AFTER UPDATE OF status ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_course_enrollment();

-- ------------------------------------------------------------
-- 7. MISSIONS: enrollment / payment status changed
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_mission_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.push_notification(
      NEW.student_id,
      NULL,
      'enrollment',
      CASE NEW.status
        WHEN 'In Progress' THEN 'ការចូលរួមបេសកកម្មត្រូវបានអនុម័ត (Mission enrollment approved)'
        WHEN 'Rejected' THEN 'ការទូទាត់បេសកកម្មត្រូវបានបដិសេធ (Mission payment rejected)'
        WHEN 'Completed' THEN 'អបអរសាទរ! អ្នកបានបញ្ចប់បេសកកម្ម (Mission completed)'
        ELSE 'ស្ថានភាពបេសកកម្មបានផ្លាស់ប្ដូរ (Mission status updated): ' || NEW.status
      END,
      NULL,
      CASE WHEN NEW.status = 'In Progress'
        THEN '/classroom/' || NEW.mission_id
        ELSE '/mission/' || NEW.mission_id
      END
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_mission_enrollment_notify ON public.mission_enrollments;
CREATE TRIGGER on_mission_enrollment_notify
AFTER UPDATE OF status ON public.mission_enrollments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_mission_enrollment();

-- ------------------------------------------------------------
-- 8. TUTORS: new booking request + booking status changes
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_booking_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.push_notification(
    NEW.tutor_id,
    NEW.student_id,
    'booking',
    'មានសំណើកក់ម៉ោងសិក្សាថ្មី (New tutoring booking request)',
    NEW.subject,
    '/tutor/dashboard'
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_insert_notify ON public.tutor_bookings;
CREATE TRIGGER on_booking_insert_notify
AFTER INSERT ON public.tutor_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking_insert();

CREATE OR REPLACE FUNCTION public.notify_on_booking_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.push_notification(
      NEW.student_id,
      NEW.tutor_id,
      'booking',
      CASE NEW.status
        WHEN 'Accepted' THEN 'ការកក់របស់អ្នកត្រូវបានទទួលយក (Your booking was accepted)'
        WHEN 'Rejected' THEN 'ការកក់របស់អ្នកត្រូវបានបដិសេធ (Your booking was declined)'
        WHEN 'Completed' THEN 'វគ្គបង្រៀនត្រូវបានបញ្ចប់ (Tutoring session completed)'
        ELSE 'ស្ថានភាពការកក់បានផ្លាស់ប្ដូរ (Booking status updated): ' || NEW.status
      END,
      NEW.subject,
      '/tutor/' || NEW.tutor_id
    );
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_status_notify ON public.tutor_bookings;
CREATE TRIGGER on_booking_status_notify
AFTER UPDATE OF status ON public.tutor_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking_status();

-- ------------------------------------------------------------
-- 9. REALTIME
-- Deliver INSERTs to the app live. RLS still applies: each user
-- only receives their own rows.
-- ------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
