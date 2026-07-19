import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  User as UserIcon,
  Bell,
  ChevronLeft,
  LogOut,
  Zap,
  Award,
  Gift,
  GraduationCap,
  Users,
  Building2,
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left Side: Back Button or Logo */}
          <div className="flex items-center">
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
                className="p-2 -ml-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100"
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
    </header>
  );
};

export default Header;
