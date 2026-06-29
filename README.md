
# REAN - Educational Marketplace (Cambodia)

REAN is a comprehensive educational platform connecting students with schools, tutors, and AI-driven learning missions. It features a gamified community, real-time AI tutoring, and a marketplace for short courses.

## Tech Stack

*   **Frontend**: React (v18+), TypeScript, Tailwind CSS, Lucide React.
*   **Backend / Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
*   **AI**: Google Gemini API (@google/genai).
*   **Build Tool**: Vite.

---

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Key (Get from aistudio.google.com)
API_KEY=your_google_gemini_api_key

# Supabase Configuration (Get from Supabase Dashboard)
VITE_SUPABASE_URL=your_supabase_url
# Use the Publishable Key (Recommended)
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_fbkyJlwt7bcGtiVexvq39w_m6n4_Vxf
# Legacy Support (Optional if Publishable Key is set)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Database Setup

Run the following SQL scripts in the **Supabase SQL Editor** to set up the schema, security, and functions.

#### A. Core Tables & Auth Trigger

```sql
-- 1. PROFILES (Extends Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text check (role in ('student', 'tutor', 'school', 'business', 'admin')),
  lifetime_xp bigint default 0,
  spendable_points bigint default 100, -- Hardcoded Sign up bonus
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create profile on signup AND award points
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Create Profile with 100 points
  insert into public.profiles (id, email, full_name, avatar_url, spendable_points)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 100);
  
  -- 2. Log Transaction for History
  insert into public.point_transactions (user_id, amount, type, reason)
  values (new.id, 100, 'earn', 'Welcome Bonus (កាដូស្វាគមន៍)');

  return new;
end;
$$ language plpgsql security definer;

-- Ensure trigger is bound (if not already)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SCHOOLS
create table public.schools (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id),
  name text not null,
  logo text,
  cover_image text,
  location text,
  type text,
  tuition_range text,
  description text,
  majors text[],
  gallery text[],
  verified boolean default false,
  is_published boolean default false, -- Visibility Toggle
  created_at timestamp with time zone default now()
);

-- 3. ADMISSIONS
create table public.admissions (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  description text,
  majors text[],
  start_date text,
  end_date text,
  status text default 'Open',
  created_at timestamp with time zone default now()
);

-- 4. SCHOLARSHIPS
create table public.scholarships (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade,
  admission_id uuid references public.admissions(id) on delete cascade,
  title text not null,
  deadline text,
  discount text,
  created_at timestamp with time zone default now()
);

-- 5. SHORT COURSES
create table public.short_courses (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  start_date text,
  duration text,
  schedule text,
  price numeric,
  format text,
  description text,
  cover_image text,
  category text,
  instructor_name text,
  max_seats int default 20,
  enrolled_count int default 0,
  deadline text,
  syllabus jsonb default '[]',
  is_listed boolean default true, -- Visibility Toggle
  created_at timestamp with time zone default now()
);

-- 6. COURSE ENROLLMENTS
create table public.course_enrollments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.short_courses(id),
  student_id uuid references public.profiles(id),
  student_name text,
  student_phone text,
  status text default 'Pending',
  created_at timestamp with time zone default now()
);

-- 7. SCHOOL INQUIRIES
create table public.school_inquiries (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id),
  admission_id uuid references public.admissions(id),
  student_id uuid references public.profiles(id),
  student_name text,
  student_phone text,
  message text,
  status text default 'Pending',
  created_at timestamp with time zone default now()
);
```

#### B. Tutor Market Schema

```sql
-- 8. TUTORS
create table public.tutors (
  id uuid references public.profiles(id) primary key,
  hourly_rate numeric,
  bio text,
  subjects text[],
  grades text[],
  teaching_mode text,
  location text,
  experience text,
  phone_contact text,
  is_verified boolean default false,
  is_listed boolean default true, -- Visibility Toggle
  cover_image text,
  created_at timestamp with time zone default now()
);

-- 9. TUTOR BOOKINGS
create table public.tutor_bookings (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id),
  tutor_id uuid references public.profiles(id),
  subject text,
  status text default 'Pending',
  scheduled_time timestamp with time zone,
  location_notes text,
  created_at timestamp with time zone default now()
);

-- 10. STUDENT REQUESTS (Job Board)
create table public.student_requests (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id),
  subject text,
  grade text,
  location text,
  budget_range text,
  description text,
  status text default 'Open',
  created_at timestamp with time zone default now()
);

-- 11. CLASSROOM LOGS & HOMEWORK
create table public.classroom_logs (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.tutor_bookings(id),
  action_type text, -- 'Session Start', 'Note', 'Session Report'
  note text,
  created_at timestamp with time zone default now()
);

create table public.tutor_homeworks (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.tutor_bookings(id),
  title text,
  description text,
  status text default 'Pending',
  student_attachment text,
  created_at timestamp with time zone default now()
);
```

#### C. Mission & Community Schema

```sql
-- 12. MISSIONS (Project Based Learning)
create table public.missions (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id),
  mentor_id uuid references public.profiles(id), -- Assigned Human Teacher
  mentor text, -- Display Name
  title text not null,
  price numeric default 0,
  level text,
  squad_size int default 3,
  squad_creation text default 'auto',
  enrollment_type text default 'open',
  category text,
  thumbnail text,
  description text,
  modules jsonb default '[]', -- Array of module objects
  payment_qr_url text,
  payment_instruction text,
  telegram_group_link text,
  enable_plagiarism_check boolean default false, -- New: Toggle Check
  created_at timestamp with time zone default now()
);

-- 13. MISSION ENROLLMENTS
create table public.mission_enrollments (
  id uuid default gen_random_uuid() primary key,
  mission_id uuid references public.missions(id) on delete cascade,
  student_id uuid references public.profiles(id),
  status text default 'Pending',
  squad_id int,
  squad_note text,
  class_id uuid, -- For Cohorts
  payment_receipt_url text,
  payment_status text default 'none',
  created_at timestamp with time zone default now()
);

-- 14. MISSION PROGRESS
create table public.mission_progress (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.mission_enrollments(id) on delete cascade,
  module_id text not null,
  status text default 'locked',
  submission_text text,
  ai_feedback text,
  created_at timestamp with time zone default now()
);

-- 15. STUDENT POSTS (Community)
create table public.student_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id),
  content text not null,
  tags text[],
  likes int default 0, -- Legacy
  reaction_heart int default 0,
  reaction_bulb int default 0,
  reaction_thumb int default 0,
  bounty_points int default 0,
  is_anonymous boolean default false,
  ai_quality_score int default 0,
  created_at timestamp with time zone default now()
);

-- 16. COMMUNITY REPLIES
create table public.community_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.student_posts(id) on delete cascade,
  author_id uuid references public.profiles(id), -- Null if AI
  content text,
  is_ai boolean default false,
  is_accepted boolean default false,
  ai_quality_score int default 0,
  recommended_links jsonb,
  reaction_heart int default 0,
  reaction_bulb int default 0,
  reaction_thumb int default 0,
  created_at timestamp with time zone default now()
);

-- 17. SAVED POSTS (Bookmarks)
create table public.saved_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.student_posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 18. USER REACTIONS (New)
create table public.user_reactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.student_posts(id) on delete cascade,
  reply_id uuid references public.community_replies(id) on delete cascade,
  reaction text not null, -- 'heart', 'bulb', 'thumb'
  created_at timestamp with time zone default now(),
  CONSTRAINT one_reaction_per_target UNIQUE (user_id, post_id, reply_id)
);
```

#### D. Gamification & Economy Schema

```sql
-- 19. POINT TRANSACTIONS
create table public.point_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  amount int not null,
  type text, -- 'earn' or 'spend'
  reason text,
  created_at timestamp with time zone default now()
);

-- 20. MYSTERY BOXES
create table public.mystery_boxes (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id),
  title text,
  description text,
  price_points int,
  cover_image text,
  created_at timestamp with time zone default now()
);

-- 21. MYSTERY BOX ITEMS
create table public.mystery_box_items (
  id uuid default gen_random_uuid() primary key,
  box_id uuid references public.mystery_boxes(id) on delete cascade,
  name text,
  type text default 'coupon',
  probability int default 10,
  created_at timestamp with time zone default now()
);

-- 22. REWARD CLAIMS
create table public.reward_claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  box_id uuid references public.mystery_boxes(id),
  reward_detail text,
  status text default 'Pending', -- 'Pending', 'Fulfilled'
  created_at timestamp with time zone default now()
);
```

#### E. AI & Vector Search (Plagiarism Check)

```sql
-- 23. ENABLE PGVECTOR
create extension if not exists vector;

-- 24. SUBMISSION EMBEDDINGS
create table public.submission_embeddings (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references public.mission_enrollments(id) on delete cascade,
  module_id text not null,
  content text,
  embedding vector(768), -- Gemini text-embedding-004 dimensions
  created_at timestamp with time zone default now()
);

-- 25. MATCHING FUNCTION (RPC)
create or replace function match_submissions (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_mission_id uuid,
  filter_module_id text,
  exclude_enrollment_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    se.id,
    se.content,
    1 - (se.embedding <=> query_embedding) as similarity
  from
    submission_embeddings se
  join
    mission_enrollments me on se.enrollment_id = me.id
  where
    me.mission_id = filter_mission_id
    and se.module_id = filter_module_id
    and se.enrollment_id != exclude_enrollment_id
    and 1 - (se.embedding <=> query_embedding) > match_threshold
  order by
    se.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 3. Row Level Security (RLS) Policies

**IMPORTANT**: Run these commands to secure your database.

```sql
-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_embeddings ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies

-- Profiles
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Self update profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Schools
CREATE POLICY "Public schools" ON schools FOR SELECT USING (is_published = true OR owner_id = auth.uid());
CREATE POLICY "Owners create schools" ON schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners update schools" ON schools FOR UPDATE USING (owner_id = auth.uid());

-- Short Courses
CREATE POLICY "Public courses" ON short_courses FOR SELECT USING (is_listed = true OR EXISTS (SELECT 1 FROM schools WHERE id = school_id AND owner_id = auth.uid()));
CREATE POLICY "Owners manage courses" ON short_courses FOR ALL USING (EXISTS (SELECT 1 FROM schools WHERE id = school_id AND owner_id = auth.uid()));

-- Tutors
CREATE POLICY "Public tutors" ON tutors FOR SELECT USING (is_listed = true OR id = auth.uid());
CREATE POLICY "Self update tutor" ON tutors FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Self insert tutor" ON tutors FOR INSERT WITH CHECK (id = auth.uid());

-- Community
CREATE POLICY "Public view posts" ON student_posts FOR SELECT USING (true);
CREATE POLICY "Auth create posts" ON student_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Public view replies" ON community_replies FOR SELECT USING (true);
CREATE POLICY "Auth create replies" ON community_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Mission Enrollments
CREATE POLICY "Users can view own enrollments" ON mission_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can update own enrollments" ON mission_enrollments FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can insert enrollments" ON mission_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Mission Progress
CREATE POLICY "Users can view own progress" ON mission_progress FOR SELECT USING (EXISTS (SELECT 1 FROM mission_enrollments WHERE id = enrollment_id AND student_id = auth.uid()));
CREATE POLICY "Users can update own progress" ON mission_progress FOR UPDATE USING (EXISTS (SELECT 1 FROM mission_enrollments WHERE id = enrollment_id AND student_id = auth.uid()));
CREATE POLICY "Users can insert progress" ON mission_progress FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM mission_enrollments WHERE id = enrollment_id AND student_id = auth.uid()));

-- Submission Embeddings (Plagiarism Check)
CREATE POLICY "Students can insert own embeddings" ON submission_embeddings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM mission_enrollments WHERE id = enrollment_id AND student_id = auth.uid()));
CREATE POLICY "Students can view own embeddings" ON submission_embeddings FOR SELECT USING (EXISTS (SELECT 1 FROM mission_enrollments WHERE id = enrollment_id AND student_id = auth.uid()));
```

### 4. Storage Buckets

In Supabase Storage, create a public bucket named **`Rean`**.
Create the following folders inside: `avatars`, `school-logos`, `school-covers`, `course-covers`, `missions`, `rewards`.

**Storage Policy**: Ensure the `Rean` bucket has policies allowing:
*   **Select**: Public (give access to `anon` role).
*   **Insert/Update/Delete**: Authenticated users only.

### 5. Edge Functions

To enable the server-side AI processing and secure point deduction:

1.  Make sure you have the Supabase CLI installed.
2.  Deploy the functions:
```bash
supabase functions deploy ai-assistant --no-verify-jwt
supabase functions deploy og --no-verify-jwt
supabase functions deploy og-school --no-verify-jwt
supabase functions deploy og-mission --no-verify-jwt
```

3.  Set the secrets for the function:

```bash
supabase secrets set GOOGLE_API_KEY=your_gemini_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set APP_PUBLISHABLE_KEY=sb_publishable_fbkyJlwt7bcGtiVexvq39w_m6n4_Vxf
supabase secrets set APP_SECRET_KEY=your_service_role_key
```

### 6. Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to start learning!