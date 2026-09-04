import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCourseById, enrollInCourse, fetchAllShortCourses } from '../services/schoolService';
import { getCurrentUserProfile } from '../services/authService';
import { ShortCourse } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  CheckCircle,
  User,
  BookOpen,
  AlertCircle,
  X,
  Loader2,
  Share2,
  ChevronLeft,
} from '../components/Icons';
import { formatRiel } from '../utils/formatHelper';
import { placeholderImage } from '../utils/placeholder';
import ShortCourseCard from '../components/ShortCourseCard';
import MarkdownText from '../components/MarkdownText';
import { SUPABASE_URL } from '../services/supabaseClient';
import toast from 'react-hot-toast';

// Helper to construct the Edge Function URL for Short Course SEO
const getCourseShareLink = (courseId: string) => {
  const baseUrl = SUPABASE_URL;
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/functions/v1/og-short-course?id=${courseId}`;
};

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<{
    course:
      | (ShortCourse & {
          school: {
            id: string;
            name: string;
            logo: string;
            description?: string;
            location?: string;
          };
        })
      | null;
    relatedCourses: (ShortCourse & { schoolName: string })[];
    loading: boolean;
  }>({ course: null, relatedCourses: [], loading: true });

  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'school'>('overview');

  const [enrollState, setEnrollState] = useState({
    showModal: false,
    form: { name: '', phone: '' },
    submitting: false,
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setCourseData((prev) => ({ ...prev, loading: true }));
      const data = await fetchCourseById(id);

      // Pre-fill user data
      const user = await getCurrentUserProfile();
      if (user) {
        setEnrollState((prev) => ({ ...prev, form: { ...prev.form, name: user.full_name || '' } }));
      }

      // Fetch Related Courses
      let related: (ShortCourse & { schoolName: string })[] = [];
      if (data) {
        const allCourses = await fetchAllShortCourses();
        related = allCourses
          .filter(
            (c) =>
              c.id !== data.id && (c.category === data.category || c.schoolId === data.school.id)
          )
          .slice(0, 3);
      }

      setCourseData({
        course: data as any,
        relatedCourses: related,
        loading: false,
      });
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    if (!courseData.course || !enrollState.form.phone) {
      toast.error('សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក');
      return;
    }
    setEnrollState((prev) => ({ ...prev, submitting: true }));
    try {
      await enrollInCourse(courseData.course.id, enrollState.form.name, enrollState.form.phone);
      setEnrollState((prev) => ({ ...prev, showModal: false }));
      toast.success('សំណើចុះឈ្មោះត្រូវបានផ្ញើ! សាលានឹងទាក់ទងទៅអ្នក។');
    } catch (error: any) {
      toast.error(error.message || 'បរាជ័យក្នុងការចុះឈ្មោះ');
    } finally {
      setEnrollState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleShare = async () => {
    if (!courseData.course) return;
    const link = getCourseShareLink(courseData.course.id);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('បានចម្លងតំណភ្ជាប់! (Link Copied)', {
        icon: '🔗',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
    } catch (err) {
      toast.error('បរាជ័យក្នុងការចម្លង');
    }
  };

  if (courseData.loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  if (!courseData.course) return <div className="p-10 text-center">រកមិនឃើញវគ្គសិក្សា។</div>;

  const { course, relatedCourses } = courseData;

  const remainingSeats = (course.maxSeats || 20) - (course.enrolledCount || 0);

  // Check if course is expired (deadline passed)
  // We treat the deadline date as inclusive (end of that day)
  const isExpired = course.deadline
    ? new Date(course.deadline).setHours(23, 59, 59, 999) < Date.now()
    : false;

  return (
    <div className="bg-surface-2 min-h-screen pb-10">
      {/* --- HERO IMAGE --- */}
      <div className="relative h-64 md:h-80 bg-gray-900 dark:bg-surface-3">
        <img
          src={course.coverImage || placeholderImage(1200, 600, 'Course')}
          alt="Course Cover"
          className="w-full h-full object-cover opacity-60"
        />

        {/* Navigation Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 bg-surface/20 backdrop-blur-md rounded-full text-white hover:bg-surface/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 bg-surface/20 backdrop-blur-md rounded-full text-white hover:bg-surface/30 transition-colors"
            title="ចែករំលែក (Share)"
            aria-label="Share Course"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded mb-3 uppercase tracking-wide">
              {course.category || 'វគ្គសិក្សាខ្លី'}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {course.title}
            </h1>
            <Link
              to={`/school/${course.school.id}`}
              className="flex items-center text-content-muted hover:text-white transition-colors w-fit"
            >
              <img
                src={course.school.logo}
                className="w-6 h-6 rounded bg-surface mr-2"
                alt="logo"
              />
              <span className="text-sm font-bold">{course.school.name}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* --- MAIN INFO CARD --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-surface rounded-xl shadow-lg dark:shadow-surface-3/20/50 border border-line p-5">
          <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-content-muted mb-5">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>
                ចាប់ផ្តើម៖ <span className="font-bold text-content">{course.startDate}</span>
              </span>
            </div>
            {course.deadline && (
              <div className="flex items-center">
                <AlertCircle
                  className={`h-4 w-4 mr-2 ${isExpired ? 'text-red-500' : 'text-primary'}`}
                />
                <span className={isExpired ? 'text-red-600 font-bold' : ''}>
                  ផុតកំណត់៖ {course.deadline}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>រយៈពេល៖ {course.duration}</span>
            </div>
            <div className="flex items-center">
              {course.format === 'Online' ? (
                <Monitor className="h-4 w-4 mr-2 text-primary" />
              ) : (
                <MapPin className="h-4 w-4 mr-2 text-primary" />
              )}
              <span>
                {course.format === 'Online'
                  ? 'អនឡាញ'
                  : course.format === 'On-Campus'
                    ? 'រៀននៅសាលា'
                    : 'ចម្រុះ'}
              </span>
            </div>
            {course.instructorName && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                <span>គ្រូ៖ {course.instructorName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <div className="flex flex-col">
              <span className="text-xs text-content-muted uppercase font-bold tracking-wider mb-0.5">
                តម្លៃសិក្សា (Tuition Fee)
              </span>
              <span className="text-2xl font-bold text-primary">{formatRiel(course.price)}</span>
            </div>

            {/* Desktop Enroll Button */}
            <div className="hidden md:flex items-center gap-4">
              {!isExpired && remainingSeats <= 10 && remainingSeats > 0 && (
                <span className="text-red-500 text-xs font-bold animate-pulse">
                  នៅសល់ {remainingSeats} កន្លែង!
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  !isExpired && setEnrollState((prev) => ({ ...prev, showModal: true }))
                }
                disabled={isExpired}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center ${
                  isExpired
                    ? 'bg-line-strong text-content-muted cursor-not-allowed shadow-none'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                }`}
              >
                {isExpired ? (
                  <>
                    <AlertCircle className="h-5 w-5 mr-2" /> ផុតកំណត់ (Expired)
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" /> ចុះឈ្មោះរៀន
                  </>
                )}
              </button>
            </div>

            {/* Mobile Status Badge (Only shown if NOT expired, otherwise button shows expired) */}
            {!isExpired && (
              <div className="md:hidden text-right">
                {remainingSeats <= 10 && remainingSeats > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold border border-red-100 animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" /> នៅសល់តែ {remainingSeats} កន្លែង!
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300 text-xs font-bold border border-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" /> កំពុងទទួលពាក្យ
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE ENROLL BUTTON (Moved here) --- */}
      <div className="max-w-5xl mx-auto px-4 mt-6 md:hidden">
        <button
          type="button"
          onClick={() => !isExpired && setEnrollState((prev) => ({ ...prev, showModal: true }))}
          disabled={isExpired}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center transition-transform ${
            isExpired
              ? 'bg-line-strong text-content-muted cursor-not-allowed shadow-none'
              : 'bg-primary text-white active:scale-95'
          }`}
        >
          {isExpired ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" /> ផុតកំណត់ (Expired)
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" /> ចុះឈ្មោះរៀន (Enroll Now)
            </>
          )}
        </button>
      </div>

      {/* --- TABS --- */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="flex border-b border-line-strong overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            សង្ខេប (Overview)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'syllabus' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            កម្មវិធីសិក្សា (Syllabus)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('school')}
            className={`flex-1 min-w-[100px] py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'school' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            អំពីសាលា (School)
          </button>
        </div>

        <div className="mt-6 mb-12 min-h-[300px]">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-surface rounded-xl p-6 border border-line shadow-sm">
                <h3 className="font-bold text-content mb-4 text-lg">អំពីវគ្គសិក្សានេះ</h3>
                <div className="text-content-muted leading-relaxed">
                  <MarkdownText content={course.description || 'មិនមានការពិពណ៌នាទេ។'} />
                </div>
              </div>

              <div className="bg-surface rounded-xl p-6 border border-line shadow-sm">
                <h3 className="font-bold text-content mb-4 text-lg">កាលវិភាគ & ទីតាំង</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-4 rounded-xl text-sm font-medium flex items-start">
                    <Clock className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block font-bold mb-1">កាលវិភាគប្រចាំសប្តាហ៍</span>
                      {course.schedule}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 p-4 rounded-xl text-sm font-medium flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block font-bold mb-1">ម៉ោងសិក្សា / ទម្រង់</span>
                      {course.format}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <div className="space-y-4 animate-fade-in">
              {course.syllabus && course.syllabus.length > 0 ? (
                course.syllabus.map((topic, idx) => (
                  <div
                    key={topic.title}
                    className="bg-surface rounded-xl p-5 border border-line shadow-sm group hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-content text-sm mb-1 group-hover:text-primary transition-colors">
                          {topic.title}
                        </h4>
                        <div className="text-xs text-content-muted leading-relaxed">
                          <MarkdownText content={topic.content} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-surface rounded-xl border border-line border-dashed">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-content-faint" />
                  <p className="text-content-muted font-medium">
                    កម្មវិធីសិក្សាលម្អិតនឹងមកដល់ឆាប់ៗនេះ។
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'school' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-surface rounded-xl p-6 border border-line shadow-sm">
                <div className="flex items-center mb-6">
                  <img
                    src={course.school.logo}
                    className="w-16 h-16 rounded-xl border border-line mr-4 p-1"
                    alt="School Logo"
                  />
                  <div>
                    <h3 className="font-bold text-content text-lg">{course.school.name}</h3>
                    <Link
                      to={`/school/${course.school.id}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      មើលប្រវត្តិពេញ (Full Profile)
                    </Link>
                  </div>
                </div>

                <h4 className="font-bold text-content text-sm mb-2">អំពីសាលា</h4>
                <p className="text-sm text-content-muted leading-relaxed mb-6">
                  {/* Fallback description if not joined, normally handled by backend view */}
                  វគ្គសិក្សានេះផ្តល់ជូនដោយ {course.school.name}{' '}
                  ដែលជាគ្រឹះស្ថានអប់រំឈានមុខគេមួយក្នុងថ្នាល REAN។
                  ពួកគេប្តេជ្ញាផ្តល់ជូននូវការអប់រំដែលមានគុណភាពខ្ពស់ និងជំនាញជាក់ស្តែង។
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- RELATED COURSES --- */}
        {relatedCourses.length > 0 && (
          <div className="mb-10 pt-8 border-t border-line-strong">
            <h3 className="font-bold text-content mb-6 px-2 text-lg">វគ្គសិក្សាស្រដៀងគ្នា</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCourses.map((rc) => (
                <ShortCourseCard key={rc.id} course={rc} schoolName={rc.schoolName} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ENROLL MODAL --- */}
      {enrollState.showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in shadow-2xl">
            <div className="bg-primary/5 p-5 border-b border-line flex justify-between items-center">
              <h3 className="font-bold text-content text-lg">ចុះឈ្មោះចូលរៀន</h3>
              <button
                type="button"
                onClick={() => setEnrollState((prev) => ({ ...prev, showModal: false }))}
                className="text-content-faint hover:text-content-muted"
                aria-label="Close Enroll Modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-surface-2 p-4 rounded-xl border border-line">
                <p className="text-xs text-content-muted uppercase font-bold mb-1">
                  ដាក់ពាក្យសម្រាប់
                </p>
                <p className="font-bold text-content text-base">{course.title}</p>
              </div>

              <div>
                <label
                  htmlFor="enroll-name"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  ឈ្មោះរបស់អ្នក
                </label>
                <input
                  id="enroll-name"
                  type="text"
                  value={enrollState.form.name}
                  onChange={(e) =>
                    setEnrollState((prev) => ({
                      ...prev,
                      form: { ...prev.form, name: e.target.value },
                    }))
                  }
                  className="w-full p-3.5 bg-surface-2 border border-line-strong rounded-xl text-sm focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="enroll-phone"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  លេខទូរស័ព្ទ <span className="text-red-500">*</span>
                </label>
                <input
                  id="enroll-phone"
                  type="tel"
                  value={enrollState.form.phone}
                  onChange={(e) =>
                    setEnrollState((prev) => ({
                      ...prev,
                      form: { ...prev.form, phone: e.target.value },
                    }))
                  }
                  placeholder="012 345 678"
                  className="w-full p-3.5 bg-surface-2 border border-line-strong rounded-xl text-sm focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrollState.submitting}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex justify-center items-center hover:bg-primary/90 transition-colors"
              >
                {enrollState.submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'បញ្ជាក់ការចុះឈ្មោះ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
