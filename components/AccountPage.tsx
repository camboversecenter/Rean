import React, { useEffect, useState, useRef } from 'react';
import { placeholderImage } from '../utils/placeholder';
import { getCurrentUserProfile } from '../services/authService';
import { uploadFile, deleteFileFromUrl } from '../services/storageService';
import { getMyActiveMissions } from '../services/missionProgressService';
import { fetchStudentAchievements } from '../services/achievementService';
import { getStudentBookings, updateBookingStatus } from '../services/tutorService';
import { calculateLevel, calculateNextLevelProgress } from '../services/leaderboardService';
import { supabase } from '../services/supabaseClient';
import {
  User,
  Camera,
  LogOut,
  Save,
  Loader2,
  AlertCircle,
  Building2,
  ChevronRight,
  Target,
  PlayCircle,
  Zap,
  GraduationCap,
  Clock,
  Award,
  Gift,
  CheckCircle,
  X,
  Bell,
  FileText,
  Monitor,
  BookOpen,
  HelpCircle,
  Edit,
} from './Icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signOut } from '../services/authService';
import toast from 'react-hot-toast';
import { TutorBooking, Achievement } from '../types';

const AccountPage: React.FC = () => {
  const [state, setState] = React.useReducer(
    (prev: any, next: any) => ({ ...prev, ...(typeof next === 'function' ? next(prev) : next) }),
    {
      profile: null as any,
      fullName: '',
      loading: true,
      saving: false,
      avatarFile: null as File | null,
      previewUrl: null as string | null,
      activeMissions: [] as any[],
      achievements: [] as Achievement[],
      bookings: [] as TutorBooking[],
      levelStats: null as any,
    }
  );

  const {
    profile,
    fullName,
    loading,
    saving,
    avatarFile,
    previewUrl,
    activeMissions,
    achievements,
    bookings,
    levelStats,
  } = state;

  const setProfile = (v: any) => setState({ profile: v });
  const setFullName = (v: any) => setState({ fullName: v });
  const setLoading = (v: any) => setState({ loading: v });
  const setSaving = (v: any) => setState({ saving: v });
  const setAvatarFile = (v: any) => setState({ avatarFile: v });
  const setPreviewUrl = (v: any) => setState({ previewUrl: v });
  const setActiveMissions = (v: any) => setState({ activeMissions: v });
  const setAchievements = (v: any) => setState({ achievements: v });
  const setBookings = (v: any) =>
    setState((prev: any) => ({ bookings: typeof v === 'function' ? v(prev.bookings) : v }));
  const setLevelStats = (v: any) => setState({ levelStats: v });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          setFullName(userProfile.full_name || '');
          setLevelStats(calculateNextLevelProgress(userProfile.lifetime_xp || 0));

          // Load active missions
          const missions = await getMyActiveMissions();
          setActiveMissions(missions);

          // Load Tutor Bookings
          const studentBookings = await getStudentBookings();
          setBookings(studentBookings);

          // Load Achievements
          const studentAchievements = await fetchStudentAchievements(userProfile.id);
          setAchievements(studentAchievements);
        }
      } catch (error) {
        console.error(error);
        toast.error('បរាជ័យក្នុងការផ្ទុកទិន្នន័យ');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let avatarUrl = profile.avatar_url;

      // 1. Handle Image Update (Delete Old -> Upload New)
      if (avatarFile) {
        if (avatarUrl && avatarUrl.includes('supabase')) {
          await deleteFileFromUrl(avatarUrl);
        }
        const newUrl = await uploadFile(avatarFile, 'avatars');
        if (!newUrl) throw new Error('បរាជ័យក្នុងការបង្ហោះរូបភាព');
        avatarUrl = newUrl;
      }

      // 2. Update Database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូប!');

      setProfile({ ...profile, full_name: fullName, avatar_url: avatarUrl });
      setAvatarFile(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'បរាជ័យក្នុងការកែប្រែ');
    } finally {
      setSaving(false);
    }
  };

  const handleStudentBookingAction = async (bookingId: string, action: 'Accepted' | 'Rejected') => {
    try {
      await updateBookingStatus(bookingId, action);
      setBookings((prev: any) =>
        prev.map((b: any) => (b.id === bookingId ? { ...b, status: action } : b))
      );
      if (action === 'Accepted') {
        toast.success('បានទទួលយកគ្រូ! អ្នកអាចចូលថ្នាក់រៀនបានហើយ។', { icon: '🤝' });
      } else {
        toast.success('បានបដិសេធសំណើ។');
      }
    } catch (e) {
      console.error(e);
      toast.error('បរាជ័យក្នុងការកែប្រែ។');
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check roles (Case Insensitive)
  const role = profile?.role?.toLowerCase();
  const isTutor = role === 'tutor' || role === 'admin';
  const isSchool = role === 'school' || role === 'admin';
  const isBusiness = role === 'business' || role === 'admin';

  // Creator check for mission studio
  const isCreator = isTutor || isSchool || isBusiness;

  const currentLevel = calculateLevel(profile?.lifetime_xp || 0);

  // --- FILTER BOOKINGS LOGIC ---
  const incomingApplications = bookings.filter(
    (b: any) => b.status === 'Pending' && b.locationNotes?.includes('[Job Application]')
  );

  const myPendingRequests = bookings.filter(
    (b: any) => b.status === 'Pending' && !b.locationNotes?.includes('[Job Application]')
  );

  const activeBookings = bookings.filter(
    (b: any) => b.status === 'Accepted' || b.status === 'Completed' || b.status === 'Rejected'
  );

  return (
    <div className="min-h-screen bg-surface-2 pb-24 font-sans animate-fade-in">
      {/* 1. HEADER SECTION (Redesigned for Desktop) */}
      <div className="bg-surface border-b border-line-strong mb-8 relative">
        {/* Adjusted padding and z-index for visibility */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 relative z-20">
          <h1 className="text-xl font-bold text-content">គណនីរបស់ខ្ញុំ</h1>
        </div>

        {/* Cover Photo - z-0 to stay behind content */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary to-teal-600 relative overflow-hidden z-0">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-20 w-72 h-72 bg-surface/10 rounded-full blur-3xl"></div>
          <div className="absolute left-10 bottom-10 w-40 h-40 bg-surface/10 rounded-full blur-2xl"></div>
        </div>

        {/* Profile Content - z-10 to stay above cover */}
        <div className="max-w-5xl mx-auto px-4 pb-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-surface-3">
                <img
                  src={
                    previewUrl ||
                    profile?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${fullName}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white"
                title="Change Photo"
                aria-label="Change Photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <label htmlFor="avatar-upload" className="sr-only">
                Upload Avatar
              </label>
              <input
                id="avatar-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload Avatar"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-content leading-tight mb-1">
                {profile?.full_name}
              </h1>
              <p className="text-sm text-content-muted font-medium mb-2">{profile?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wide border border-blue-100">
                  {profile?.role || 'Guest'}
                </span>
              </div>
            </div>

            {/* Stats Card (Desktop Right) */}
            {levelStats && (
              <div className="w-full md:w-80 bg-surface md:bg-surface-2 p-4 rounded-2xl border border-line md:border-line-strong shadow-sm md:shadow-none mb-2 md:mb-4">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-xs font-bold text-content-faint uppercase tracking-wider">
                      Level {currentLevel}
                    </span>
                    <div className="text-lg font-black text-content leading-none mt-0.5">
                      {profile?.lifetime_xp}{' '}
                      <span className="text-xs font-bold text-content-faint">XP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-primary leading-none">
                      {profile?.spendable_points}{' '}
                      <span className="text-xs font-bold text-content-faint">Pts</span>
                    </div>
                    <span className="text-[10px] text-content-faint font-medium">
                      Available Balance
                    </span>
                  </div>
                </div>
                <div className="w-full bg-line-strong rounded-full h-2 overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelStats.percent}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/leaderboard"
                    className="flex items-center justify-center py-2 bg-surface rounded-lg border border-line-strong text-xs font-bold text-content-soft hover:bg-surface-2 hover:border-line-strong transition-all"
                  >
                    <Award className="h-4 w-4 mr-1.5 text-yellow-500" /> Leaderboard
                  </Link>
                  <Link
                    to="/rewards"
                    className="flex items-center justify-center py-2 bg-surface rounded-lg border border-line-strong text-xs font-bold text-content-soft hover:bg-surface-2 hover:border-line-strong transition-all"
                  >
                    <Gift className="h-4 w-4 mr-1.5 text-pink-500" /> Rewards
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN (Main Activity & Achievements) */}
          <div className="md:col-span-2 space-y-8">
            {/* Dashboard Shortcuts (Only for specific roles) */}
            {(isTutor || isSchool || isCreator) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isTutor && (
                  <Link
                    to="/tutor/dashboard"
                    className="bg-surface border border-green-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 p-10 bg-green-50 rounded-full -mr-5 -mt-5 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-content">ផ្ទាំងគ្រប់គ្រងគ្រូ</h3>
                      <p className="text-xs text-content-muted mt-1">
                        Manage Tutor Profile & Bookings
                      </p>
                    </div>
                  </Link>
                )}
                {isCreator && (
                  <Link
                    to="/creator"
                    className="bg-surface border border-indigo-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 p-10 bg-indigo-50 rounded-full -mr-5 -mt-5 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3">
                        <Zap className="h-6 w-6 fill-indigo-600" />
                      </div>
                      <h3 className="font-bold text-content">ស្ទូឌីយោបេសកកម្ម</h3>
                      <p className="text-xs text-content-muted mt-1">Create & Manage Missions</p>
                    </div>
                  </Link>
                )}
                {isSchool && (
                  <Link
                    to="/school/dashboard"
                    className="bg-surface border border-blue-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 p-10 bg-blue-50 rounded-full -mr-5 -mt-5 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-content">ផ្ទាំងគ្រប់គ្រងសាលា</h3>
                      <p className="text-xs text-content-muted mt-1">
                        Manage School Page & Admissions
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {/* Incoming Applications */}
            {incomingApplications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-content mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" /> សំណើពីគ្រូ (Job
                  Applications)
                </h2>
                <div className="space-y-4">
                  {incomingApplications.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="bg-surface rounded-2xl shadow-sm border border-line p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-content">
                              {booking.tutorName || 'គ្រូបង្រៀន'}
                            </h4>
                            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Applying
                            </span>
                          </div>
                          <p className="text-sm text-content-muted">
                            Applied for: <span className="font-bold">{booking.subject}</span>
                          </p>
                          {booking.locationNotes && (
                            <div className="mt-2 bg-surface-2 p-3 rounded-xl text-sm text-content-muted border border-line italic">
                              "{booking.locationNotes.replace('[Job Application] ', '')}"
                            </div>
                          )}
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStudentBookingAction(booking.id, 'Accepted')}
                            className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-green-700 shadow-sm transition-colors"
                          >
                            ទទួល (Accept)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStudentBookingAction(booking.id, 'Rejected')}
                            className="flex-1 bg-surface border border-line-strong text-content-muted font-bold py-2 px-4 rounded-xl text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            បដិសេធ (Decline)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* My Requests */}
            {myPendingRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-content mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-content-faint" /> រង់ចាំការឆ្លើយតប (Pending)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myPendingRequests.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="bg-surface rounded-2xl shadow-sm border border-line-strong p-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-content text-sm">
                          {booking.tutorName || 'គ្រូបង្រៀន'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-surface-3 text-content-muted">
                          Waiting
                        </span>
                      </div>
                      <div className="text-xs text-content-muted mb-1">
                        <span className="font-medium">{booking.subject}</span>
                      </div>
                      <p className="text-xs text-content-faint italic">
                        Sent on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active/History */}
            {activeBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-content mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" /> ថ្នាក់រៀនរបស់ខ្ញុំ (My
                  Classes)
                </h2>
                <div className="space-y-3">
                  {activeBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="bg-surface rounded-2xl shadow-sm border border-line p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-10 rounded-full ${booking.status === 'Accepted' ? 'bg-green-500' : 'bg-line-strong'}`}
                        ></div>
                        <div>
                          <h4 className="font-bold text-content text-sm">{booking.tutorName}</h4>
                          <p className="text-xs text-content-muted">
                            {booking.subject} • {booking.status}
                          </p>
                        </div>
                      </div>
                      {booking.status === 'Accepted' && (
                        <Link
                          to={`/classroom/${booking.id}`}
                          className="text-xs bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-black transition-colors flex items-center"
                        >
                          ចូលថ្នាក់ <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Missions */}
            {activeMissions.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-content mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-500" /> បេសកកម្ម (Active Missions)
                </h2>
                <div className="space-y-3">
                  {activeMissions.map((m: any) => (
                    <div
                      key={m.enrollmentId}
                      className="bg-surface rounded-2xl shadow-sm border border-line p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <img
                          src={m.thumbnail || placeholderImage(80, 80, 'Mission')}
                          alt={m.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-surface-3"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-content text-sm truncate">{m.title}</h4>
                          <p className="text-xs text-content-muted flex items-center mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span> In
                            Progress
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/mission/${m.id}`}
                        className="bg-primary/5 text-primary p-2.5 rounded-full hover:bg-primary/10 flex-shrink-0 transition-colors"
                      >
                        <PlayCircle className="h-6 w-6" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements Section (Moved to Left) */}
            <div className="bg-surface rounded-3xl shadow-sm border border-line p-6">
              <h2 className="text-sm font-bold text-content mb-4 uppercase tracking-wider flex items-center">
                <Award className="h-4 w-4 mr-2 text-yellow-500" /> សមិទ្ធិផល (Achievements)
              </h2>

              {achievements.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-content-faint">មិនទាន់មានសមិទ្ធិផល។</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100 p-3 flex items-center gap-3"
                    >
                      <div className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-content text-xs truncate">{item.title}</h4>
                        <p className="text-[10px] text-content-muted truncate">
                          {item.providerName}
                        </p>
                      </div>
                      <div className="ml-auto text-[10px] text-content-faint">
                        {item.completedDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="md:col-span-1 space-y-6">
            {/* Profile Editor */}
            <div className="bg-surface rounded-3xl shadow-sm border border-line p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-content uppercase tracking-wider flex items-center">
                  <Edit className="h-4 w-4 mr-2" /> កែប្រែឈ្មោះ
                </h2>
              </div>

              <div className="space-y-3">
                <label htmlFor="fullName" className="sr-only">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-2 border border-line-strong rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="ឈ្មោះរបស់អ្នក (Full Name)"
                  aria-label="Full Name"
                />

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center text-sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'រក្សាទុក (Save)'}
                </button>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-3">
              <Link
                to="/docs"
                className="w-full bg-surface border border-line-strong text-content-soft font-bold py-3 rounded-xl hover:bg-surface-2 transition-colors flex items-center justify-center text-sm"
              >
                <HelpCircle className="h-4 w-4 mr-2" /> មជ្ឈមណ្ឌលជំនួយ
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-surface border border-red-100 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" /> ចាកចេញ (Sign Out)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
