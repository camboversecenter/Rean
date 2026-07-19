import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSchoolById, createStudentInquiry } from '../services/schoolService';
import { getCurrentUserProfile } from '../services/authService';
import { School, Admission } from '../types';
import {
  MapPin,
  Building2,
  Calendar,
  Award,
  CheckCircle,
  MessageCircle,
  Send,
  Phone,
  Globe,
  BookOpen,
  Clock,
  Loader2,
  X,
  AlertCircle,
  CalendarDays,
  Users,
  Share2,
  ChevronLeft,
} from '../components/Icons';
import ShortCourseCard from '../components/ShortCourseCard';
import { SUPABASE_URL } from '../services/supabaseClient';
import toast from 'react-hot-toast';

// Helper to construct the Edge Function URL for School SEO
const getSchoolShareLink = (schoolId: string) => {
  const baseUrl = SUPABASE_URL || 'https://apirean.e-khmer.com';
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/functions/v1/og-school?id=${schoolId}`;
};

const SchoolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState({
    school: null as School | null,
    loading: true,
    activeTab: 'admissions' as 'admissions' | 'courses' | 'about',
    userProfile: null as any,
  });

  // Modal State
  const [modalState, setModalState] = useState({
    show: false,
    targetAdmission: null as { id: string; title: string } | null,
    inquiryForm: { phone: '', message: '' },
    submitting: false,
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await fetchSchoolById(id);
      const user = await getCurrentUserProfile();
      setState((s) => ({ ...s, school: data, userProfile: user, loading: false }));
    };
    load();
  }, [id]);

  const openInquiryModal = (admission?: Admission, isInterested: boolean = false) => {
    if (!state.userProfile) {
      toast.error('សូមចូលគណនីជាមុនសិន។ (Please login)');
      return;
    }

    setModalState((s) => ({
      ...s,
      targetAdmission: admission ? { id: admission.id, title: admission.title } : null,
      inquiryForm: {
        phone: '',
        message: isInterested
          ? `ខ្ញុំចាប់អារម្មណ៍លើ "${admission?.title || 'សាលារបស់អ្នក'}". សូមទាក់ទងមកខ្ញុំវិញផង។`
          : '',
      },
      show: true,
    }));
  };

  const handleSubmitInquiry = async () => {
    if (!state.school || !modalState.inquiryForm.phone) {
      toast.error('សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក។');
      return;
    }
    setModalState((s) => ({ ...s, submitting: true }));
    try {
      await createStudentInquiry({
        schoolId: state.school.id,
        admissionId: modalState.targetAdmission?.id,
        studentName: state.userProfile.full_name || 'Anonymous Student',
        studentPhone: modalState.inquiryForm.phone,
        message: modalState.inquiryForm.message,
      });
      toast.success('បានផ្ញើសំណួររួចរាល់!');
      setModalState((s) => ({ ...s, show: false }));
    } catch (error) {
      console.error(error);
      toast.error('បរាជ័យក្នុងការផ្ញើ។');
    } finally {
      setModalState((s) => ({ ...s, submitting: false }));
    }
  };

  const handleShare = async () => {
    if (!state.school) return;
    const link = getSchoolShareLink(state.school.id);
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

  if (state.loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  if (!state.school) return <div className="p-10 text-center">School not found.</div>;

  // Filter active admissions
  const activeAdmissions = state.school.admissions.filter((a) => a.status !== 'Closed');

  const getSchoolTypeKH = (type: string) => {
    switch (type) {
      case 'University':
        return 'សាកលវិទ្យាល័យ';
      case 'High School':
        return 'វិទ្យាល័យ';
      case 'Vocational':
        return 'វិជ្ជាជីវៈ';
      case 'Center':
        return 'មជ្ឈមណ្ឌល';
      default:
        return type;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-48 md:h-64 bg-gray-200">
        <img
          src={state.school.coverImage || 'https://via.placeholder.com/1200x400'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Navigation Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
            title="ចែករំលែក (Share)"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* --- PROFILE HEADER --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-white p-1 rounded-2xl shadow-md -mt-16 md:mt-0">
            <img
              src={state.school.logo || 'https://via.placeholder.com/150'}
              alt="Logo"
              className="w-24 h-24 rounded-xl object-contain bg-white"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{state.school.name}</h1>
              {state.school.verified && (
                <CheckCircle className="h-5 w-5 text-blue-500 fill-white" />
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> {state.school.location}
              </span>
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" /> {getSchoolTypeKH(state.school.type)}
              </span>
            </div>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <button
              type="button"
              onClick={() => openInquiryModal()}
              className="flex-1 md:flex-none bg-primary text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> ទាក់ទង (Contact)
            </button>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'admissions' }))}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${state.activeTab === 'admissions' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
          >
            ការជ្រើសរើស ({activeAdmissions.length})
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'courses' }))}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${state.activeTab === 'courses' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
          >
            វគ្គសិក្សាខ្លី ({state.school.shortCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'about' }))}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${state.activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
          >
            អំពី & ជំនាញ
          </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 1. ADMISSIONS TAB */}
        {state.activeTab === 'admissions' && (
          <div className="space-y-6">
            {activeAdmissions.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">មិនមានការជ្រើសរើសសិស្សនៅពេលនេះទេ។</p>
              </div>
            )}

            {activeAdmissions.map((adm) => (
              <div
                key={adm.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 border-b border-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{adm.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            adm.status === 'Open'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {adm.status === 'Open' ? 'កំពុងទទួល' : 'ជិតចប់'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>
                          ផុតកំណត់៖ <span className="font-medium text-gray-900">{adm.endDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 mt-2">
                    {adm.description}
                  </p>

                  {/* Majors Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {adm.majors.slice(0, 5).map((m) => (
                      <span
                        key={m}
                        className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded border border-gray-100"
                      >
                        {m}
                      </span>
                    ))}
                    {adm.majors.length > 5 && (
                      <span className="text-xs text-gray-400 py-1">
                        +{adm.majors.length - 5} more
                      </span>
                    )}
                  </div>

                  {/* Scholarships */}
                  {adm.scholarships.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-100">
                      <h4 className="text-xs font-bold text-yellow-800 flex items-center mb-2">
                        <Award className="h-3.5 w-3.5 mr-1" /> អាហារូបករណ៍ដែលមាន (Scholarships)
                      </h4>
                      <div className="space-y-1">
                        {adm.scholarships.map((sch) => (
                          <div key={sch.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700">{sch.title}</span>
                            <span className="font-bold text-green-600 bg-white px-1.5 py-0.5 rounded shadow-sm border border-green-100">
                              {sch.discount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openInquiryModal(adm, false)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                  >
                    សួរព័ត៌មាន (Ask Info)
                  </button>
                  <button
                    type="button"
                    onClick={() => openInquiryModal(adm, true)}
                    className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors text-sm"
                  >
                    ចាប់អារម្មណ៍ (Interested)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. COURSES TAB */}
        {state.activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.school.shortCourses.map((course) => (
              <ShortCourseCard key={course.id} course={course} />
            ))}
            {state.school.shortCourses.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-400 text-sm">មិនមានវគ្គសិក្សាខ្លីទេ។</p>
              </div>
            )}
          </div>
        )}

        {/* 3. ABOUT TAB */}
        {state.activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">អំពី {state.school.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {state.school.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">តម្លៃសិក្សា (Tuition Range)</p>
                  <p className="font-bold text-gray-900">{state.school.tuitionRange}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">ទីតាំង (Location)</p>
                  <p className="font-bold text-gray-900">{state.school.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">ជំនាញ / ដេប៉ាតឺម៉ង់ (Majors)</h3>
              <div className="flex flex-wrap gap-2">
                {state.school.majors.map((major) => (
                  <span
                    key={major}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    {major}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {state.school.gallery && state.school.gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {state.school.gallery.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt="Gallery"
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- INQUIRY MODAL --- */}
      {modalState.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
            <div className="bg-primary/5 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">ផ្ញើសំណួរ (Send Inquiry)</h3>
                <p className="text-xs text-gray-500">ទៅកាន់៖ {state.school.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalState((s) => ({ ...s, show: false }))}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {modalState.targetAdmission && (
                <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg font-medium">
                  ទាក់ទងនឹង៖ {modalState.targetAdmission.title}
                </div>
              )}

              <div>
                <label
                  htmlFor="inquiry-phone"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  លេខទូរស័ព្ទរបស់អ្នក <span className="text-red-500">*</span>
                </label>
                <input
                  id="inquiry-phone"
                  type="tel"
                  value={modalState.inquiryForm.phone}
                  onChange={(e) =>
                    setModalState((s) => ({
                      ...s,
                      inquiryForm: { ...s.inquiryForm, phone: e.target.value },
                    }))
                  }
                  placeholder="012 345 678"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="inquiry-message"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  សារ (Message)
                </label>
                <textarea
                  id="inquiry-message"
                  value={modalState.inquiryForm.message}
                  onChange={(e) =>
                    setModalState((s) => ({
                      ...s,
                      inquiryForm: { ...s.inquiryForm, message: e.target.value },
                    }))
                  }
                  placeholder="តើអ្នកចង់ដឹងអ្វីខ្លះ?"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitInquiry}
                disabled={modalState.submitting || !modalState.inquiryForm.phone}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
              >
                {modalState.submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'ផ្ញើទៅសាលា'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDetailPage;
