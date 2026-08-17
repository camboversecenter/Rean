-- ============================================================
-- REAN PLAGIARISM CHECK (AI)
-- Run this in the Supabase SQL Editor.
--
-- The app already ships the UI (the "Enable Plagiarism Check (AI)"
-- toggle in the mission form), the client service
-- (services/missionProgressService.ts) and the embedding endpoint
-- (supabase/functions/ai-assistant, action 'embed'). This file adds
-- the database objects those depend on. Without it the toggle has
-- nothing to save into and the similarity search silently returns
-- nothing, so no submission is ever flagged.
--
-- What it does:
--   1. Enables pgvector.
--   2. Adds missions.enable_plagiarism_check (the toggle).
--   3. Creates submission_embeddings: one 768-dim vector per
--      (enrollment, module), i.e. per student per lesson.
--   4. Locks the table down with RLS so a student can only write
--      their own rows and nobody can read another student's text.
--   5. Adds match_submissions(), the SECURITY DEFINER RPC the client
--      calls. It returns similarity scores only - never the matched
--      text - and only to someone enrolled in (or running) the
--      mission being checked.
--
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 0. EXTENSION
-- Supabase installs extensions into the "extensions" schema. If a
-- previous install put pgvector in "public", the IF NOT EXISTS below
-- is a no-op and the search_path still finds the type.
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Applies to the rest of this script so the unqualified vector type
-- resolves no matter which schema holds the extension.
SET search_path = public, extensions;

-- ------------------------------------------------------------
-- 1. THE TOGGLE
-- Mirrors Mission.enablePlagiarismCheck in types.ts. Missions created
-- before this migration default to off, which is the old behaviour.
-- ------------------------------------------------------------
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS enable_plagiarism_check boolean NOT NULL DEFAULT false;

-- ------------------------------------------------------------
-- 2. THE CORPUS
-- One row per student per module. module_id is the text id generated
-- by the mission form ("mod-1735...") and lives inside the missions
-- JSONB, so it is text and cannot carry a foreign key.
--
-- mission_id is denormalised from the enrollment so the similarity
-- search can filter without a join.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submission_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.missions (id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.mission_enrollments (id) ON DELETE CASCADE,
  module_id text NOT NULL,
  content text NOT NULL,
  embedding vector(768) NOT NULL, -- Gemini text-embedding-004
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- A student resubmitting a lesson replaces their own vector instead of
-- piling up near-duplicates that would flag them against themselves.
-- The client upserts on this constraint.
CREATE UNIQUE INDEX IF NOT EXISTS submission_embeddings_enrollment_module_key
  ON public.submission_embeddings (enrollment_id, module_id);

-- The search always filters on this pair before ranking by distance.
CREATE INDEX IF NOT EXISTS submission_embeddings_mission_module_idx
  ON public.submission_embeddings (mission_id, module_id);

-- Approximate nearest neighbour on cosine distance. HNSW needs
-- pgvector >= 0.5; on older versions swap in:
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
CREATE INDEX IF NOT EXISTS submission_embeddings_embedding_idx
  ON public.submission_embeddings USING hnsw (embedding vector_cosine_ops);

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- Submissions are other students' work. The table is readable only by
-- its author and by the people running the mission; the similarity
-- search itself goes through the SECURITY DEFINER function below,
-- which returns scores rather than text.
-- ------------------------------------------------------------
ALTER TABLE public.submission_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students write their own submission vectors" ON public.submission_embeddings;
CREATE POLICY "Students write their own submission vectors"
  ON public.submission_embeddings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mission_enrollments e
      WHERE e.id = submission_embeddings.enrollment_id
        AND e.student_id = auth.uid()
        AND e.mission_id = submission_embeddings.mission_id
    )
  );

-- Needed as well as INSERT: an upsert that hits the unique index
-- becomes an UPDATE.
DROP POLICY IF EXISTS "Students update their own submission vectors" ON public.submission_embeddings;
CREATE POLICY "Students update their own submission vectors"
  ON public.submission_embeddings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mission_enrollments e
      WHERE e.id = submission_embeddings.enrollment_id
        AND e.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mission_enrollments e
      WHERE e.id = submission_embeddings.enrollment_id
        AND e.student_id = auth.uid()
        AND e.mission_id = submission_embeddings.mission_id
    )
  );

DROP POLICY IF EXISTS "Authors and mission staff read submission vectors" ON public.submission_embeddings;
CREATE POLICY "Authors and mission staff read submission vectors"
  ON public.submission_embeddings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mission_enrollments e
      WHERE e.id = submission_embeddings.enrollment_id
        AND e.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.missions m
      WHERE m.id = submission_embeddings.mission_id
        AND (m.owner_id = auth.uid() OR m.mentor_id = auth.uid())
    )
  );

-- No DELETE policy: rows disappear with the enrollment or the mission.

-- ------------------------------------------------------------
-- 4. THE SIMILARITY SEARCH
-- Called from checkPlagiarism() in services/missionProgressService.ts.
-- SECURITY DEFINER so it can rank against classmates' rows that RLS
-- hides from the caller - hence the explicit authorisation check and
-- the deliberately narrow return type (id + score, no content).
--
-- Cosine similarity: 1 = identical, 0 = unrelated. The client uses a
-- 0.85 threshold.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.match_submissions(vector, double precision, int, uuid, text, uuid);

CREATE OR REPLACE FUNCTION public.match_submissions(
  query_embedding vector(768),
  match_threshold double precision DEFAULT 0.85,
  match_count int DEFAULT 1,
  filter_mission_id uuid DEFAULT NULL,
  filter_module_id text DEFAULT NULL,
  exclude_enrollment_id uuid DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF filter_mission_id IS NULL THEN
    RAISE EXCEPTION 'filter_mission_id is required';
  END IF;

  -- Only people inside the mission may probe it. Without this, any
  -- signed-in user could test arbitrary text against any cohort.
  IF NOT EXISTS (
    SELECT 1 FROM public.mission_enrollments e
    WHERE e.mission_id = filter_mission_id
      AND e.student_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM public.missions m
    WHERE m.id = filter_mission_id
      AND (m.owner_id = auth.uid() OR m.mentor_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorised to search submissions for this mission';
  END IF;

  RETURN QUERY
  SELECT se.id,
         1 - (se.embedding <=> query_embedding) AS similarity
  FROM public.submission_embeddings se
  WHERE se.mission_id = filter_mission_id
    AND (filter_module_id IS NULL OR se.module_id = filter_module_id)
    AND (exclude_enrollment_id IS NULL OR se.enrollment_id <> exclude_enrollment_id)
    AND 1 - (se.embedding <=> query_embedding) >= match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
END;
$$;

REVOKE ALL ON FUNCTION public.match_submissions(vector, double precision, int, uuid, text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.match_submissions(vector, double precision, int, uuid, text, uuid) TO authenticated;
