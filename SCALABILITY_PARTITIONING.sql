
-- Enable pg_partman extension for automatic partition management
CREATE EXTENSION IF NOT EXISTS pg_partman WITH SCHEMA public;

-- =======================================================
-- 1. PARTITION: point_transactions (The Ledger)
-- =======================================================

-- A. Rename existing table to backup
ALTER TABLE point_transactions RENAME TO point_transactions_old;

-- B. Create new PARTITIONED table
-- Note: Partition key (created_at) MUST be part of the Primary Key
CREATE TABLE point_transactions (
  id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  amount int NOT NULL,
  type text,
  reason text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- C. Create Partitions (Current Month + Next Month)
-- Adjust dates as needed for your launch
CREATE TABLE point_transactions_p2025_01 PARTITION OF point_transactions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE point_transactions_p2025_02 PARTITION OF point_transactions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
    
CREATE TABLE point_transactions_default PARTITION OF point_transactions DEFAULT;

-- D. Migrate Data
INSERT INTO point_transactions (id, user_id, amount, type, reason, created_at)
SELECT id, user_id, amount, type, reason, created_at FROM point_transactions_old;

-- E. Setup Partman to auto-create future partitions
SELECT partman.create_parent( 
    p_parent_table => 'public.point_transactions',
    p_control => 'created_at',
    p_type => 'native',
    p_interval => '1 month',
    p_premake => 1
);

-- =======================================================
-- 2. PARTITION: student_posts (The Feed)
-- =======================================================

-- A. Rename
ALTER TABLE student_posts RENAME TO student_posts_old;

-- B. Create Partitioned Table
CREATE TABLE student_posts (
  id uuid DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  tags text[],
  likes int DEFAULT 0,
  reaction_heart int DEFAULT 0,
  reaction_bulb int DEFAULT 0,
  reaction_thumb int DEFAULT 0,
  bounty_points int DEFAULT 0,
  is_anonymous boolean DEFAULT false,
  ai_quality_score int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- C. Create Initial Partitions
CREATE TABLE student_posts_p2025_01 PARTITION OF student_posts
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE student_posts_p2025_02 PARTITION OF student_posts
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE student_posts_default PARTITION OF student_posts DEFAULT;

-- D. Migrate Data
INSERT INTO student_posts (id, author_id, content, tags, likes, reaction_heart, reaction_bulb, reaction_thumb, bounty_points, is_anonymous, ai_quality_score, created_at)
SELECT id, author_id, content, tags, likes, reaction_heart, reaction_bulb, reaction_thumb, bounty_points, is_anonymous, ai_quality_score, created_at FROM student_posts_old;

-- E. Setup Partman
SELECT partman.create_parent( 
    p_parent_table => 'public.student_posts',
    p_control => 'created_at',
    p_type => 'native',
    p_interval => '1 month',
    p_premake => 1
);

-- =======================================================
-- 3. CLEANUP & REFERENCES
-- =======================================================

-- Re-apply Foreign Keys on dependent tables 
-- (You might need to drop old FKs on community_replies/saved_posts first if they reference student_posts_old)

-- Example for community_replies:
-- ALTER TABLE community_replies DROP CONSTRAINT community_replies_post_id_fkey;
-- ALTER TABLE community_replies ADD CONSTRAINT community_replies_post_id_fkey 
--    FOREIGN KEY (post_id) REFERENCES student_posts(id) ON DELETE CASCADE; 
-- Note: FKs to partitioned tables are supported in Postgres 12+ but require care.
-- The Partitioned table PK includes (id, created_at), so referencing table ideally includes created_at too, 
-- BUT Supabase/Postgres allows referencing just ID if there is a unique index on ID.
-- However, unique index on partitioned table MUST include the partition key.
-- Workaround: We rely on application logic or triggers for strict integrity if complex FKs fail.

-- For now, keep student_posts_old as archive until migration is verified.
