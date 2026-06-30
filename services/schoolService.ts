import { supabase } from './supabaseClient';
import {
  School,
  ShortCourse,
  Scholarship,
  Admission,
  SchoolInquiry,
  CourseEnrollment,
} from '../types';

// --- Mappers to convert DB snake_case to App camelCase ---

const mapSchoolFromDB = (data: any): School => {
  const admissions: Admission[] = (data.admissions || []).map((adm: any) => {
    const linkedScholarships = (data.scholarships || [])
      .filter((s: any) => s.admission_id === adm.id)
      .map((s: any) => mapScholarshipFromDB(s));

    return {
      id: adm.id,
      title: adm.title,
      description: adm.description,
      majors: adm.majors || [],
      startDate: adm.start_date,
      endDate: adm.end_date,
      status: adm.status,
      scholarships: linkedScholarships,
    };
  });

  return {
    id: data.id,
    name: data.name,
    logo: data.logo,
    coverImage: data.cover_image,
    location: data.location || '',
    type: data.type || 'University',
    tuitionRange: data.tuition_range || '',
    description: data.description || '',
    majors: data.majors || [],
    gallery: data.gallery || [],
    verified: data.verified || false,
    isPublished: data.is_published, // Map visibility
    admissions: admissions,
    shortCourses: data.short_courses ? data.short_courses.map((c: any) => mapCourseFromDB(c)) : [],
  };
};

const mapCourseFromDB = (data: any): ShortCourse => ({
  id: data.id,
  title: data.title,
  startDate: data.start_date,
  duration: data.duration,
  schedule: data.schedule,
  price: data.price,
  format: data.format,
  description: data.description,
  coverImage: data.cover_image,
  category: data.category,
  instructorName: data.instructor_name,
  maxSeats: data.max_seats,
  enrolledCount: data.enrolled_count,
  deadline: data.deadline,
  syllabus: data.syllabus || [],
  isListed: data.is_listed, // Map visibility
});

const mapScholarshipFromDB = (data: any): Scholarship => ({
  id: data.id,
  admissionId: data.admission_id,
  title: data.title,
  deadline: data.deadline,
  discount: data.discount,
});

const mapInquiryFromDB = (data: any): SchoolInquiry => ({
  id: data.id,
  studentName: data.student_name,
  studentPhone: data.student_phone,
  message: data.message,
  status: data.status,
  createdAt: new Date(data.created_at).toLocaleDateString(),
  admissionTitle: data.admissions?.title,
});

const mapEnrollmentFromDB = (data: any): CourseEnrollment & { courseTitle: string } => ({
  id: data.id,
  courseId: data.course_id,
  courseTitle: data.short_courses?.title || 'Unknown Course',
  studentId: data.student_id,
  studentName: data.student_name,
  studentPhone: data.student_phone,
  status: data.status,
  createdAt: new Date(data.created_at).toLocaleDateString(),
});

// --- Public Fetching ---

export const fetchAllSchools = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = '',
  typeFilter: string = 'All'
): Promise<School[]> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  // IMPORTANT: Filter by is_published = true for public list
  let query = supabase
    .from('schools')
    .select(`*, admissions(*), scholarships(*), short_courses(*)`)
    .eq('is_published', true)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
  if (typeFilter && typeFilter !== 'All') query = query.eq('type', typeFilter);
  const { data, error } = await query;
  if (error) return [];
  return data.map((item: any) => mapSchoolFromDB(item));
};

export const fetchSchoolById = async (id: string): Promise<School | null> => {
  // Single school fetch might still be allowed if linked directly, but generally good practice to check publish status unless owner
  // For now we allow fetching by ID even if unpublished (so owner can preview), UI can handle "Not Published" banner if needed
  const { data, error } = await supabase
    .from('schools')
    .select(`*, admissions(*), scholarships(*), short_courses(*)`)
    .eq('id', id)
    .single();
  if (error) return null;
  return mapSchoolFromDB(data);
};

export const fetchCourseById = async (
  id: string
): Promise<(ShortCourse & { school: { id: string; name: string; logo: string } }) | null> => {
  const { data, error } = await supabase
    .from('short_courses')
    .select(`*, schools(id, name, logo)`)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return {
    ...mapCourseFromDB(data),
    school: { id: data.schools.id, name: data.schools.name, logo: data.schools.logo },
  };
};

export const fetchAllShortCourses = async (
  page: number = 1,
  limit: number = 12,
  category?: string,
  format?: string
): Promise<(ShortCourse & { schoolName: string; schoolId: string })[]> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  // IMPORTANT: Filter by is_listed = true for public list
  let query = supabase
    .from('short_courses')
    .select(`*, schools(id, name)`)
    .eq('is_listed', true)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (category && category !== 'All') query = query.eq('category', category);
  if (format && format !== 'All') query = query.eq('format', format);
  const { data, error } = await query;
  if (error) return [];
  return data.map((item: any) => ({
    ...mapCourseFromDB(item),
    schoolName: item.schools?.name,
    schoolId: item.schools?.id,
  }));
};

// --- Owner Management ---

export const getMySchool = async (): Promise<School | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // Owner sees everything, regardless of published status
  const { data, error } = await supabase
    .from('schools')
    .select(`*, admissions(*), scholarships(*), short_courses(*)`)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return mapSchoolFromDB(data);
};

export const createMySchool = async (name: string): Promise<School> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
  if (!profile) throw new Error('Profile not found.');
  // Default is_published to false (Draft mode)
  const { data, error } = await supabase
    .from('schools')
    .insert([{ owner_id: user.id, name: name, is_published: false }])
    .select()
    .single();
  if (error) throw error;
  return mapSchoolFromDB({ ...data, admissions: [], scholarships: [], short_courses: [] });
};

export const updateSchoolProfile = async (schoolId: string, updates: Partial<School>) => {
  const dbUpdates: any = {
    name: updates.name,
    logo: updates.logo,
    cover_image: updates.coverImage,
    location: updates.location,
    type: updates.type,
    tuition_range: updates.tuitionRange,
    description: updates.description,
    majors: updates.majors,
    gallery: updates.gallery,
    is_published: updates.isPublished, // Add visibility update
  };
  Object.keys(dbUpdates).forEach((key) => dbUpdates[key] === undefined && delete dbUpdates[key]);
  const { error } = await supabase.from('schools').update(dbUpdates).eq('id', schoolId);
  if (error) throw error;
};

// --- CRUD Admissions ---

export const addAdmission = async (
  schoolId: string,
  admission: Omit<Admission, 'id' | 'scholarships'>
) => {
  const { error } = await supabase
    .from('admissions')
    .insert([
      {
        school_id: schoolId,
        title: admission.title,
        description: admission.description,
        majors: admission.majors,
        start_date: admission.startDate,
        end_date: admission.endDate,
        status: admission.status,
      },
    ]);
  if (error) throw error;
};

export const updateAdmission = async (id: string, updates: Partial<Admission>) => {
  const dbUpdates: any = {
    title: updates.title,
    description: updates.description,
    majors: updates.majors,
    start_date: updates.startDate,
    end_date: updates.endDate,
    status: updates.status,
  };
  const { error } = await supabase.from('admissions').update(dbUpdates).eq('id', id);
  if (error) throw error;
};

export const deleteAdmission = async (id: string) => {
  const { error } = await supabase.from('admissions').delete().eq('id', id);
  if (error) throw error;
};

// --- CRUD Short Courses ---

export const addShortCourse = async (schoolId: string, course: Omit<ShortCourse, 'id'>) => {
  const { error } = await supabase.from('short_courses').insert([
    {
      school_id: schoolId,
      title: course.title,
      start_date: course.startDate,
      duration: course.duration,
      schedule: course.schedule,
      price: course.price,
      format: course.format,
      description: course.description,
      cover_image: course.coverImage,
      category: course.category,
      instructor_name: course.instructorName,
      max_seats: course.maxSeats,
      deadline: course.deadline,
      syllabus: course.syllabus,
      is_listed: course.isListed !== undefined ? course.isListed : true, // Default true
    },
  ]);
  if (error) throw error;
};

export const updateShortCourse = async (courseId: string, updates: Partial<ShortCourse>) => {
  const dbUpdates: any = {
    title: updates.title,
    start_date: updates.startDate,
    duration: updates.duration,
    schedule: updates.schedule,
    price: updates.price,
    format: updates.format,
    description: updates.description,
    cover_image: updates.coverImage,
    category: updates.category,
    instructor_name: updates.instructorName,
    max_seats: updates.maxSeats,
    deadline: updates.deadline,
    syllabus: updates.syllabus,
    is_listed: updates.isListed,
  };
  // Clean undefined keys
  Object.keys(dbUpdates).forEach((key) => dbUpdates[key] === undefined && delete dbUpdates[key]);

  const { error } = await supabase.from('short_courses').update(dbUpdates).eq('id', courseId);
  if (error) throw error;
};

export const deleteShortCourse = async (id: string) => {
  const { error } = await supabase.from('short_courses').delete().eq('id', id);
  if (error) throw error;
};

// --- CRUD Scholarships ---

export const addScholarship = async (
  schoolId: string,
  admissionId: string | undefined,
  scholarship: Omit<Scholarship, 'id'>
) => {
  const { error } = await supabase
    .from('scholarships')
    .insert([
      {
        school_id: schoolId,
        admission_id: admissionId || null,
        title: scholarship.title,
        deadline: scholarship.deadline,
        discount: scholarship.discount,
      },
    ]);
  if (error) throw error;
};

export const deleteScholarship = async (id: string) => {
  const { error } = await supabase.from('scholarships').delete().eq('id', id);
  if (error) throw error;
};

// --- Leads & Enrollments ---

export const createStudentInquiry = async (inquiry: {
  schoolId: string;
  admissionId?: string;
  message: string;
  studentName: string;
  studentPhone: string;
}) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');
  const { error } = await supabase
    .from('school_inquiries')
    .insert([
      {
        school_id: inquiry.schoolId,
        admission_id: inquiry.admissionId || null,
        student_id: user.id,
        student_name: inquiry.studentName,
        student_phone: inquiry.studentPhone,
        message: inquiry.message,
        status: 'Pending',
      },
    ]);
  if (error) throw error;
};

export const getMyInquiries = async (schoolId: string): Promise<SchoolInquiry[]> => {
  const { data, error } = await supabase
    .from('school_inquiries')
    .select(`*, admissions(title)`)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data.map((item: any) => mapInquiryFromDB(item));
};

export const updateInquiryStatus = async (id: string, status: string) => {
  const { error } = await supabase.from('school_inquiries').update({ status }).eq('id', id);
  if (error) throw error;
};

export const getSchoolEnrollments = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`*, short_courses!inner(id, title, school_id)`)
    .eq('short_courses.school_id', schoolId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data.map((item: any) => mapEnrollmentFromDB(item));
};

export const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
  const { error } = await supabase
    .from('course_enrollments')
    .update({ status })
    .eq('id', enrollmentId);
  if (error) throw error;
};

export const getCourseEnrollmentCount = async (courseId: string): Promise<number> => {
  const { count } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);
  return count || 0;
};

export const enrollInCourse = async (
  courseId: string,
  studentName: string,
  studentPhone: string
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to enroll');

  const { error } = await supabase.from('course_enrollments').insert([
    {
      course_id: courseId,
      student_id: user.id,
      student_name: studentName,
      student_phone: studentPhone,
      status: 'Pending',
    },
  ]);

  if (error) throw error;
};

export const getStudentCourses = async (studentId: string) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
            *,
            short_courses (
                id,
                title,
                cover_image,
                price,
                duration,
                schools (id, name, logo)
            )
        `
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return data
    .map((item: any) => ({
      id: item.short_courses?.id,
      title: item.short_courses?.title,
      coverImage: item.short_courses?.cover_image,
      price: item.short_courses?.price,
      duration: item.short_courses?.duration,
      schoolName: item.short_courses?.schools?.name,
      enrollmentStatus: item.status,
      enrollmentId: item.id,
    }))
    .filter((c: any) => c.id);
};
