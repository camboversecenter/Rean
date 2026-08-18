import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTutorById, createBooking } from '../services/tutorService';
import { getCurrentUser } from '../services/authService';
import { TutorProfile } from '../types';
import {
  Loader2,
  MapPin,
  CheckCircle,
  GraduationCap,
  Monitor,
  Phone,
  Calendar,
  Clock,
  X,
  ChevronLeft,
  Share2,
} from '../components/Icons';
import { formatRiel } from '../utils/formatHelper';
import { SUPABASE_URL } from '../services/supabaseClient';
import toast from 'react-hot-toast';

// Helper to construct the Edge Function URL for Tutor SEO
const getTutorShareLink = (tutorId: string) => {
  const baseUrl = SUPABASE_URL;
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/functions/v1/og-tutor?id=${tutorId}`;
};

const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState({
    tutor: null as TutorProfile | null,
    loading: true,
    showBooking: false,
    currentUser: null as any,
    bookingForm: {
      subject: '',
      date: '',
      time: '',
      notes: '',
    },
    bookingSubmitting: false,
  });

  useEffect(() => {
    if (id) {
      Promise.all([getTutorById(id), getCurrentUser()]).then(([data, user]) => {
        setState((s) => ({ ...s, tutor: data, currentUser: user, loading: false }));
      });
    }
  }, [id]);

  const handleOpenBooking = () => {
    if (!state.currentUser) {
      toast.error('សូមចូលគណនីជាមុនសិន ដើម្បីកក់។ (Please login first)');
      return;
    }
    if (state.currentUser.id === state.tutor?.id) {
      toast.error('អ្នកមិនអាចកក់ខ្លួនឯងបានទេ។');
      return;
    }
    setState((s) => ({ ...s, showBooking: true }));
  };

  const handleBooking = async () => {
    if (
      !state.bookingForm.subject ||
      !state.bookingForm.date ||
      !state.bookingForm.time ||
      !state.tutor
    ) {
      toast.error('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់។');
      return;
    }

    setState((s) => ({ ...s, bookingSubmitting: true }));
    try {
      const scheduledTime = new Date(
        `${state.bookingForm.date}T${state.bookingForm.time}`
      ).toISOString();
      await createBooking({
        tutorId: state.tutor.id,
        subject: state.bookingForm.subject,
        scheduledTime,
        notes: state.bookingForm.notes,
      });
      toast.success('បានផ្ញើសំណើកក់! សូមរង់ចាំការឆ្លើយតប។', { duration: 4000 });
      setState((s) => ({
        ...s,
        showBooking: false,
        bookingForm: { subject: '', date: '', time: '', notes: '' },
      }));
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការកក់។');
    } finally {
      setState((s) => ({ ...s, bookingSubmitting: false }));
    }
  };

  const handleShare = async () => {
    if (!state.tutor) return;
    const link = getTutorShareLink(state.tutor.id);
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  if (!state.tutor) return <div className="p-10 text-center">រកមិនឃើញគ្រូបង្រៀន</div>;

  return (
    <div className="bg-surface-2 min-h-screen pb-32 font-sans">
      {/* Header / Cover */}
      <div className="relative pt-12 pb-16 px-4 text-white shadow-lg overflow-hidden">
        {/* Background Image or Gradient */}
        {state.tutor.coverImage ? (
          <>
            <img
              src={state.tutor.coverImage}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-teal-800"></div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-surface/20 rounded-full hover:bg-surface/30 backdrop-blur-md transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 bg-surface/20 backdrop-blur-md rounded-full text-white hover:bg-surface/30 transition-colors"
            title="ចែករំលែក (Share)"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-line-strong">
            <img
              src={
                state.tutor.avatarUrl || `https://ui-avatars.com/api/?name=${state.tutor.fullName}`
              }
              className="w-full h-full object-cover"
              alt="Tutor Avatar"
            />
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {state.tutor.fullName}{' '}
            {state.tutor.isVerified && (
              <CheckCircle className="h-5 w-5 text-blue-300 fill-blue-500" />
            )}
          </h1>
          <p className="opacity-90 text-sm mt-1">{state.tutor.experience}</p>
          <div className="flex gap-2 mt-4">
            <span className="bg-surface/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm flex items-center border border-white/10">
              <MapPin className="h-3 w-3 mr-1" /> {state.tutor.location}
            </span>
            <span className="bg-surface/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm flex items-center border border-white/10">
              {state.tutor.teachingMode === 'Online' ? (
                <Monitor className="h-3 w-3 mr-1" />
              ) : (
                <GraduationCap className="h-3 w-3 mr-1" />
              )}
              {state.tutor.teachingMode === 'Online'
                ? 'អនឡាញ'
                : state.tutor.teachingMode === 'Home'
                  ? 'រៀននៅផ្ទះ'
                  : 'ទាំងពីរ'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar (Stats & Subjects) */}
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl shadow-sm p-4 border border-line">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-content-muted uppercase font-bold">តម្លៃ (Rate)</p>
                  <p className="text-xl font-bold text-primary">
                    {formatRiel(state.tutor.hourlyRate || 0)}{' '}
                    <span className="text-xs text-content-faint font-normal">/h</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-content-muted uppercase font-bold">មុខវិជ្ជា</p>
                  <p className="text-xl font-bold text-content">
                    {state.tutor.subjects?.length || 0}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenBooking}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition-transform active:scale-95"
              >
                កក់ម៉ោងសិក្សា
              </button>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line">
              <h3 className="font-bold text-content mb-4 text-sm uppercase">មុខវិជ្ជា & កម្រិត</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {state.tutor.subjects?.map((s) => (
                  <span
                    key={s}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {state.tutor.grades?.map((g) => (
                  <span
                    key={g}
                    className="bg-surface-3 text-content-muted px-3 py-1 rounded-lg text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content (Bio) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-surface rounded-2xl shadow-sm p-6 border border-line min-h-[300px]">
              <h3 className="font-bold text-content mb-3 text-lg border-b border-line pb-2">
                អំពីខ្ញុំ (About Me)
              </h3>
              <p className="text-content-muted text-sm leading-relaxed whitespace-pre-wrap">
                {state.tutor.bio || 'មិនមានការពិពណ៌នា'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface p-4 border-t border-line-strong md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleOpenBooking}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          កក់ម៉ោងសិក្សា (Book Now)
        </button>
      </div>

      {/* Booking Modal */}
      {state.showBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-content">កក់ម៉ោងសិក្សា</h3>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showBooking: false }))}
                className="p-1 hover:bg-surface-3 rounded-full"
              >
                <X className="h-6 w-6 text-content-faint" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="booking-subject"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  មុខវិជ្ជា
                </label>
                <select
                  id="booking-subject"
                  value={state.bookingForm.subject}
                  className="w-full p-3 bg-surface-2 border border-line-strong rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      bookingForm: { ...s.bookingForm, subject: e.target.value },
                    }))
                  }
                >
                  <option value="">ជ្រើសរើសមុខវិជ្ជា</option>
                  {state.tutor.subjects?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs font-bold text-content-muted mb-1"
                  >
                    កាលបរិច្ឆេទ
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={state.bookingForm.date}
                    className="w-full p-3 bg-surface-2 border border-line-strong rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        bookingForm: { ...s.bookingForm, date: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="booking-time"
                    className="block text-xs font-bold text-content-muted mb-1"
                  >
                    ម៉ោង
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={state.bookingForm.time}
                    className="w-full p-3 bg-surface-2 border border-line-strong rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        bookingForm: { ...s.bookingForm, time: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="booking-notes"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  ចំណាំ (Notes)
                </label>
                <textarea
                  id="booking-notes"
                  value={state.bookingForm.notes}
                  className="w-full p-3 bg-surface-2 border border-line-strong rounded-xl text-sm h-24 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="តើអ្នកចង់រៀនអំពីអ្វី?"
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      bookingForm: { ...s.bookingForm, notes: e.target.value },
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={state.bookingSubmitting}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                {state.bookingSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'បញ្ជាក់ការកក់'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDetailPage;
