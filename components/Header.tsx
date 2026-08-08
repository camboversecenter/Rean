import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  User as UserIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Award,
  Gift,
  GraduationCap,
  Users,
  Building2,
  Menu,
  X,
  Home,
  Compass,
  MessageCircle,
  Sparkles,
  FileText,
} from './Icons';
import { signOut, getCurrentUserProfile } from '../services/authService';
import { fetchRecentActivity } from '../services/leaderboardService';
import { supabase } from '../services/supabaseClient';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    profile: null as any,
    activity: [] as any[],
    showActivity: false,
    showMobileMenu: false,
  });

  const isHome = location.pathname === '/';
  const isExplore = location.pathname === '/explore';
  const isSchools = location.pathname === '/schools';
  const isChat = location.pathname === '/chat';
  const isCommunity = location.pathname === '/community';
  const isAccount = location.pathname === '/account';
  const isCreator = location.pathname === '/creator';
  const isTutorDash = location.pathname === '/tutor/dashboard';
  const isSchoolDash = location.pathname === '/school/dashboard';
  const isLeaderboard = location.pathname === '/leaderboard';
  const isRewards = location.pathname === '/rewards';
  const isTutorMarket = location.pathname === '/tutors';
  const isDocs = location.pathname === '/docs';
  const isAbout = location.pathname === '/about';
  const isDetail =
    location.pathname.startsWith('/course/') ||
    location.pathname.startsWith('/school/') ||
    location.pathname.startsWith('/mission/');

  useEffect(() => {
    const loadProfileData = () => {
      getCurrentUserProfile().then((p) => {
        if (p) setState((prev) => ({ ...prev, profile: p }));
      });
      fetchRecentActivity().then((a) => setState((prev) => ({ ...prev, activity: a })));
    };

    // Load initially
    loadProfileData();

    // 1. Supabase Auth Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadProfileData();
      } else {
        setState((prev) => ({ ...prev, profile: null, activity: [] }));
      }
    });

    // 2. Custom Event Listener for Points Updates (from GamificationService)
    const handlePointsUpdate = () => {
      loadProfileData();
    };
    window.addEventListener('rean-points-updated', handlePointsUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('rean-points-updated', handlePointsUpdate);
    };
  }, []);

  // Auto close mobile drawer on route change
  useEffect(() => {
    setState((prev) => ({ ...prev, showMobileMenu: false }));
  }, [location.pathname]);

  // Updated to include 'tutor' so they see both icons
  const canAccessStudio =
    state.profile &&
    (state.profile.role === 'business' ||
      state.profile.role === 'school' ||
      state.profile.role === 'admin' ||
      state.profile.role === 'tutor');
  const isTutor =
    state.profile && (state.profile.role === 'tutor' || state.profile.role === 'admin');
  const isSchool =
    state.profile && (state.profile.role === 'school' || state.profile.role === 'admin');

  const handleSignOut = async () => {
    await signOut();
    setState((prev) => ({ ...prev, showMobileMenu: false }));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left Side: Hamburger (Mobile), Back Button, or Logo */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, showMobileMenu: !prev.showMobileMenu }))
              }
              aria-label="Toggle mobile menu"
              className="p-2 -ml-2 text-gray-600 hover:text-primary rounded-xl hover:bg-gray-100 md:hidden transition-colors"
            >
              {state.showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {isDetail ||
            isAccount ||
            isCreator ||
            isTutorDash ||
            isSchoolDash ||
            isLeaderboard ||
            isRewards ||
            isDocs ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : (
              <Link to="/" className="flex items-center space-x-2" aria-label="Home">
                <div className="bg-primary p-1 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-primary tracking-tight">REAN</span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex space-x-6 mx-4">
            <Link
              to="/"
              className={`text-sm font-medium hover:text-primary transition-colors ${isHome ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              ទំព័រដើម
            </Link>
            <Link
              to="/schools"
              className={`text-sm font-medium hover:text-primary transition-colors ${isSchools ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              សាលារៀន
            </Link>
            <Link
              to="/community"
              className={`text-sm font-medium hover:text-primary transition-colors ${isCommunity ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              សហគមន៍
            </Link>
            <Link
              to="/explore"
              className={`text-sm font-medium hover:text-primary transition-colors ${isExplore ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              វគ្គសិក្សា
            </Link>
            <Link
              to="/chat"
              className={`text-sm font-medium hover:text-primary transition-colors ${isChat ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              សុភាទន្សាយ
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium hover:text-primary transition-colors ${isAbout ? 'text-primary font-bold' : 'text-gray-600'}`}
            >
              អំពីយើង
            </Link>
          </nav>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-2">
            {/* Tutor Market Link */}
            <Link
              to="/tutors"
              className={`p-2 rounded-full transition-colors ${isTutorMarket ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
              title="Tutor Market"
              aria-label="Tutor Market"
            >
              <Users className="h-5 w-5" />
            </Link>

            {/* Only show these if logged in */}
            {state.profile && (
              <>
                {/* Gamification Links */}
                <Link
                  to="/rewards"
                  className={`p-2 rounded-full transition-colors ${isRewards ? 'bg-pink-50 text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                  title="Rewards"
                  aria-label="Rewards"
                >
                  <Gift className="h-5 w-5 fill-current" />
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, showActivity: !prev.showActivity }))
                    }
                    aria-label="Notifications"
                    className="p-2 text-gray-400 hover:text-primary relative"
                  >
                    <Bell className="h-5 w-5" />
                    {state.activity.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>

                  {state.showActivity && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setState((prev) => ({ ...prev, showActivity: false }))}
                      ></div>
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                        <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            សកម្មភាពថ្មីៗ
                          </span>
                          <span className="text-xs text-primary font-bold">
                            {state.profile?.spendable_points || 0} PTS
                          </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {state.activity.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400">
                              មិនទាន់មានសកម្មភាពទេ។
                            </div>
                          ) : (
                            state.activity.map((act) => (
                              <div
                                key={act.id}
                                className="p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3"
                              >
                                <div
                                  className={`mt-0.5 p-1 rounded-full ${act.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                >
                                  {act.amount > 0 ? (
                                    <Zap className="h-3 w-3" />
                                  ) : (
                                    <Gift className="h-3 w-3" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-800 font-medium">{act.reason}</p>
                                  <p
                                    className={`text-[10px] font-bold ${act.amount > 0 ? 'text-green-600' : 'text-red-500'}`}
                                  >
                                    {act.amount > 0 ? '+' : ''}
                                    {act.amount} ពិន្ទុ
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/leaderboard"
                          className="block p-2 text-center text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                          onClick={() => setState((prev) => ({ ...prev, showActivity: false }))}
                        >
                          មើលតារាងពិន្ទុ (Leaderboard)
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* School Management Link */}
                {isSchool && (
                  <Link
                    to="/school/dashboard"
                    className={`p-2 rounded-full transition-colors ${isSchoolDash ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                    title="School Management"
                    aria-label="School Management"
                  >
                    <Building2 className="h-5 w-5" />
                  </Link>
                )}

                {/* Creator Studio Link */}
                {canAccessStudio && (
                  <Link
                    to="/creator"
                    className={`p-2 rounded-full transition-colors ${isCreator ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                    title="Mission Studio"
                    aria-label="Mission Studio"
                  >
                    <Zap className="h-5 w-5 fill-current" />
                  </Link>
                )}

                {/* Tutor Dashboard Link */}
                {isTutor && (
                  <Link
                    to="/tutor/dashboard"
                    className={`p-2 rounded-full transition-colors ${isTutorDash ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                    title="Tutor Dashboard"
                    aria-label="Tutor Dashboard"
                  >
                    <GraduationCap className="h-5 w-5 fill-current" />
                  </Link>
                )}
              </>
            )}

            {state.profile ? (
              <Link
                to="/account"
                aria-label="Account Profile"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ml-1"
              >
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-gray-800">
                    {state.profile.full_name || 'User'}
                  </span>
                  <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500 uppercase">
                    {state.profile.role || 'Guest'}
                  </span>
                </div>
                <img
                  src={
                    state.profile.avatar_url ||
                    `https://ui-avatars.com/api/?name=${state.profile.full_name || 'User'}`
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Login"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span className="text-xs font-bold hidden md:inline">ចូលប្រើ (Login)</span>
                <span className="text-xs font-bold md:hidden">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      {state.showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setState((prev) => ({ ...prev, showMobileMenu: false }))}
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <div className="fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto animate-fade-in border-r border-gray-100">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                <Link
                  to="/"
                  className="flex items-center space-x-2"
                  onClick={() => setState((prev) => ({ ...prev, showMobileMenu: false }))}
                >
                  <div className="bg-primary p-1.5 rounded-xl shadow-sm">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-primary tracking-tight">REAN - រៀន</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, showMobileMenu: false }))}
                  aria-label="Close menu"
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Summary Bar (If Logged In) */}
              {state.profile && (
                <div className="p-4 bg-gradient-to-r from-primary/5 via-teal-50/30 to-blue-50/50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          state.profile.avatar_url ||
                          `https://ui-avatars.com/api/?name=${state.profile.full_name || 'User'}`
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {state.profile.full_name || 'User'}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                          {state.profile.role || 'Student'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
                      <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                      <span className="text-xs font-bold text-gray-800">
                        {state.profile.spendable_points || 0} Pts
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Section */}
              <div className="p-3 space-y-1">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  ម៉ឺនុយមេ (Main Menu)
                </p>

                <Link
                  to="/"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isHome
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4" />
                    <span>ទំព័រដើម (Home)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/schools"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isSchools
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span>សាលារៀន (Schools)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/community"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isCommunity
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                    <span>សហគមន៍ (Community)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/explore"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isExplore
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Compass className="h-4 w-4 text-emerald-500" />
                    <span>វគ្គសិក្សា (Courses & Missions)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isChat
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>សុភាទន្សាយ (AI Tutor)</span>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    AI
                  </span>
                </Link>

                <Link
                  to="/tutors"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isTutorMarket
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>គ្រូបង្រៀន (Tutor Market)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/rewards"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isRewards
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Gift className="h-4 w-4 text-pink-500 fill-current" />
                    <span>រង្វាន់ (Rewards Store)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/leaderboard"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isLeaderboard
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-amber-600" />
                    <span>តារាងពិន្ទុ (Leaderboard)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  to="/docs"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isDocs
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-cyan-600" />
                    <span>ឯកសារ (Docs & Guides)</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>

                {/* Role Specific Management Links */}
                {(isSchool || canAccessStudio || isTutor) && (
                  <>
                    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      គ្រប់គ្រង (Management)
                    </p>

                    {isSchool && (
                      <Link
                        to="/school/dashboard"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isSchoolDash
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span>គ្រប់គ្រងសាលា (School Dashboard)</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    )}

                    {canAccessStudio && (
                      <Link
                        to="/creator"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isCreator
                            ? 'bg-indigo-50 text-indigo-600 font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Zap className="h-4 w-4 text-indigo-600 fill-current" />
                          <span>បង្កើតបេសកកម្ម (Mission Studio)</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    )}

                    {isTutor && (
                      <Link
                        to="/tutor/dashboard"
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isTutorDash
                            ? 'bg-green-50 text-green-600 font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="h-4 w-4 text-green-600 fill-current" />
                          <span>គ្រប់គ្រងគ្រូ (Tutor Dashboard)</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              {state.profile ? (
                <div className="space-y-2">
                  <Link
                    to="/account"
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-800 font-bold text-xs rounded-xl shadow-2xs hover:bg-gray-100 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span>គណនីរបស់ខ្ញុំ (Account Profile)</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-red-50 border border-red-100 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ចាកចេញ (Log Out)</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary/90 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>ចូលប្រើ (Login with Google)</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
