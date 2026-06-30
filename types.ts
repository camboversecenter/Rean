import React from 'react';

// Renamed from Course to Mission to reflect active learning
export interface Mission {
  id: string;
  ownerId?: string; // The creator (School/Admin)
  mentorId?: string; // The assigned teacher's User ID
  title: string;
  mentor: string; // The lead human mentor display name (virtual or real)
  price: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  squadSize: number; // e.g., 3 students per squad
  squadCreation: 'auto' | 'manual'; // Strategy for forming squads
  enrollmentType: 'open' | 'invite_only'; // New: Public vs Private
  category: MissionCategory;
  thumbnail: string;
  description: string;
  modules: MissionModule[]; // The "Living Syllabus"
  enablePlagiarismCheck?: boolean; // New: Optional Plagiarism Check
  // Payment & Community
  paymentQrUrl?: string;
  paymentInstruction?: string;
  telegramGroupLink?: string;
  enrolledCount?: number; // Total students joined/pending
}

export interface MissionModule {
  id: string;
  title: string;
  task: string; // The specific goal (e.g. "Create a SWOT analysis")
  aiPersona: string; // The system instruction for the AI for this specific module
  initialPrompt: string; // What the AI says to start the conversation
  theoryPrompt?: string; // New: The topic for the AI to teach (e.g. "Explain SWOT Analysis")
  simulationConfig?: {
    type: 'phet' | 'wokwi' | 'other';
    url: string; // For Wokwi, this is the project URL
    instructions?: string;
  };
}

// NEW: Class / Cohort Definition
export interface MissionClass {
  id: string;
  missionId: string;
  title: string; // e.g. "Semester 1 - 2025" or "Weekend Group"
  startDate?: string;
  endDate?: string;
  code?: string; // Join Code
}

export type MissionModuleStatus = 'locked' | 'active' | 'review' | 'completed';

export interface SquadMember {
  studentId: string;
  fullName: string;
  avatarUrl: string;
}

export interface ShortCourse {
  id: string;
  title: string;
  startDate: string;
  duration: string; // e.g. "3 Months"
  schedule: string; // e.g. "Sat-Sun 2pm-5pm"
  price: number;
  format: 'Online' | 'On-Campus' | 'Hybrid';
  description?: string;
  // New Fields
  coverImage?: string;
  category?: string;
  instructorName?: string;
  maxSeats?: number;
  enrolledCount?: number;
  deadline?: string;
  syllabus?: { title: string; content: string }[];
  isListed?: boolean; // Visibility Toggle
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdAt: string;
}

// Display Tutor (Public View)
export interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  grades: string[];
  pricePerHour: number;
  location: string;
  teachingMode: 'Home' | 'Online' | 'Both';
  experience: string;
  bio: string;
  verified: boolean;
}

// Tutor Profile (Database View)
export interface TutorProfile {
  id: string; // auth.user id
  hourlyRate: number;
  bio: string;
  subjects: string[];
  grades: string[];
  teachingMode: 'Online' | 'Home' | 'Both';
  location: string;
  experience: string;
  isVerified: boolean;
  is_listed: boolean; // Added for marketplace visibility control
  phoneContact?: string;
  coverImage?: string; // Added Cover Image
  // Joined fields for display
  fullName?: string;
  avatarUrl?: string;
}

// Tutor Booking
export interface TutorBooking {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  scheduledTime: string;
  locationNotes?: string;
  createdAt: string;
  // Joined
  studentName?: string;
  studentAvatar?: string;
  tutorName?: string;
}

// Student Request (Job Board)
export interface TutorRequest {
  id: string;
  studentId?: string; // Optional for mocks
  name: string;
  subject: string;
  grade: string;
  location: string;
  budget: string;
  description: string;
  timestamp: string;
  status?: 'Open' | 'Closed';
  avatar?: string; // Joined
}

export enum MissionCategory {
  TECH = 'បច្ចេកវិទ្យា',
  BUSINESS = 'អាជីវកម្ម',
  CREATIVE = 'ការបង្កើតថ្មី',
  SOCIAL = 'សង្គម',
  STEM = 'វិទ្យាសាស្ត្រ (STEM)',
}

// --- NEW ADMISSION TYPES ---

export interface Admission {
  id: string;
  title: string; // e.g. "Bachelor of Computer Science - Gen 15"
  description: string;
  majors: string[];
  startDate: string;
  endDate: string; // Deadline
  status: 'Open' | 'Closing Soon' | 'Closed' | 'Upcoming';
  scholarships: Scholarship[];
}

export interface SchoolInquiry {
  id: string;
  studentName: string;
  studentPhone: string;
  message: string;
  admissionTitle?: string; // Joined from admission
  status: 'Pending' | 'Contacted' | 'Closed';
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  location: string;
  type: 'University' | 'High School' | 'Vocational' | 'Center';
  tuitionRange: string;
  description: string;
  majors: string[]; // General majors list for the school
  admissions: Admission[]; // Replaces the old recruitment object
  shortCourses: ShortCourse[];
  verified: boolean;
  gallery: string[];
  isPublished?: boolean; // Visibility Toggle
}

export interface Scholarship {
  id: string;
  admissionId?: string; // Optional link to specific admission
  title: string;
  deadline: string;
  discount: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

// New Types for Lazy Learning / Community
export type ReactionType = 'heart' | 'bulb' | 'thumb';

export interface ReactionCounts {
  heart: number;
  bulb: number;
  thumb: number;
}

export interface StudentPost {
  id: string;
  author_id?: string; // Optional for mocks, required for DB
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number; // Legacy total count
  reactions: ReactionCounts; // Breakdown
  userReaction?: ReactionType | null; // Current user state
  attachmentType?: 'text' | 'voice' | 'image';
  tags?: string[];
  bounty_points?: number; // Phase 1: Bounty system
  ai_quality_score?: number; // Phase 3: AI filtering
  isAnonymous?: boolean; // New: Anonymous posting
  replies: CommunityReply[];
  isBookmarked?: boolean; // New: For UI State
}

export interface CommunityReply {
  id: string;
  post_id?: string;
  author_id?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  likes?: number;
  reactions: ReactionCounts;
  userReaction?: ReactionType | null;
  accepted?: boolean; // Phase 3: Bounty claim
  ai_quality_score?: number; // Phase 3: AI Quality Score (0-100)
  recommendedLinks?: {
    type: 'school' | 'mission' | 'tutor';
    id: string;
    title: string;
  }[];
}

// Auth Types - Updated to reflect the 4 Proposed Roles + Admin
export type UserRole = 'student' | 'tutor' | 'school' | 'business' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  // Phase 1: Economy
  lifetime_xp?: number;
  spendable_points?: number;
  level?: number;
}

// Phase 1: Economy Types
export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend' | 'penalty';
  reason: string;
  created_at: string;
}

export interface MysteryBox {
  id: string;
  title: string;
  description: string;
  price_points: number;
  cover_image: string;
  items?: MysteryBoxItem[];
  owner_id?: string;
}

export interface MysteryBoxItem {
  id: string;
  name: string;
  type: 'coupon' | 'xp' | 'collectible';
  value?: string; // e.g. "50% Off"
  probability: number; // 0-100
}

export interface RewardClaim {
  id: string;
  box_id: string;
  user_id: string;
  reward_detail: string;
  status: 'Pending' | 'Fulfilled';
  created_at: string;
  // Joins
  box_title?: string;
  user_name?: string;
  user_avatar?: string;
  user_email?: string;
}

// --- ACHIEVEMENT TYPE ---
export interface Achievement {
  id: string;
  title: string;
  type: 'Mission' | 'Course' | 'Tutor Session';
  providerName: string; // School Name, Tutor Name, or Mission Creator
  completedDate: string;
  score?: number; // Optional score if available
  icon?: string; // Optional icon url
}
