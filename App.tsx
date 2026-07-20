import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import RoleSelectionPage from './components/RoleSelectionPage';
import LuckyDropManager from './components/LuckyDropManager';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute'; // New component
import { supabase } from './services/supabaseClient';
import { getCurrentUserProfile } from './services/authService';
import { Toaster } from 'react-hot-toast';

// Route-level code splitting: each page loads on demand instead of shipping in
// the initial bundle (dashboards, classroom, and the AI chat are the heavy ones).
const AccountPage = lazy(() => import('./components/AccountPage'));
const KruReanChat = lazy(() => import('./components/KruReanChat'));
const CommunityFeed = lazy(() => import('./components/CommunityFeed'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SchoolsListPage = lazy(() => import('./pages/SchoolsListPage'));
const TutorListPage = lazy(() => import('./pages/TutorListPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const MissionDetailPage = lazy(() => import('./pages/MissionDetailPage'));
const SchoolDashboard = lazy(() => import('./pages/SchoolDashboard'));
const SchoolDetailPage = lazy(() => import('./pages/SchoolDetailPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const TutorDashboard = lazy(() => import('./pages/TutorDashboard'));
const TutorDetailPage = lazy(() => import('./pages/TutorDetailPage'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage'));
const DocumentationPage = lazy(() => import('./documents/DocumentationPage'));
const AdmissionsDoc = lazy(() => import('./documents/AdmissionsDoc'));
const ShortCoursesDoc = lazy(() => import('./documents/ShortCoursesDoc'));
const TutorDoc = lazy(() => import('./documents/TutorDoc'));
const MissionsDoc = lazy(() => import('./documents/MissionsDoc'));
const LazyLearningDoc = lazy(() => import('./documents/LazyLearningDoc'));
const CommunityLicensePage = lazy(() => import('./pages/CommunityLicensePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));

// Shown while a lazy page chunk downloads
const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Helper to update document title based on route
const PageTitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'REAN - Educational Marketplace';

    if (path === '/') title = 'REAN | Home';
    else if (path === '/schools') title = 'REAN | Schools';
    else if (path === '/community') title = 'REAN | Lazy Learning';
    else if (path === '/explore') title = 'REAN | Explore';
    else if (path === '/chat') title = 'REAN | AI Tutor';
    else if (path.startsWith('/school/')) title = 'REAN | School Details';
    else if (path.startsWith('/mission/')) title = 'REAN | Mission';
    else if (path.startsWith('/profile/')) title = 'REAN | User Profile';

    document.title = title;
  }, [location]);
  return null;
};

// --- Main App Logic for Auth Checking ---
const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<any>(null);

  // Helper to check profile and set role
  const checkProfile = async () => {
    const profile = await getCurrentUserProfile();
    if (profile && profile.role) {
      setUserRole(profile.role);
    } else {
      setUserRole(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkProfile();
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkProfile();
      } else {
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading REAN...</p>
        </div>
      </div>
    );
  }

  // BLOCKING: Authenticated users MUST have a role selected before using the app
  // Exception: License page (in case they want to read terms)
  if (session && !userRole && window.location.hash !== '#/license') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/license" element={<CommunityLicensePage />} />
            <Route path="*" element={<RoleSelectionPage />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" />
      </div>
    );
  }

  // MAIN APP ROUTING (Both Public & Protected)
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <ScrollToTop />
      <PageTitleUpdater />
      <Header />
      <LuckyDropManager />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* The Mission Detail Page is now PUBLIC as requested */}
            <Route path="/mission/:id" element={<MissionDetailPage />} />

            {/* Other Public Pages */}
            {/* Logged-out visitors see the marketing landing page; logged-in users get the marketplace home. */}
            <Route path="/" element={session ? <HomePage /> : <LandingPage />} />
            <Route path="/schools" element={<SchoolsListPage />} />
            <Route path="/school/:id" element={<SchoolDetailPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/tutors" element={<TutorListPage />} />
            <Route path="/tutor/:id" element={<TutorDetailPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />

            {/* Docs are Public */}
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/docs/admissions" element={<AdmissionsDoc />} />
            <Route path="/docs/short-courses" element={<ShortCoursesDoc />} />
            <Route path="/docs/tutor" element={<TutorDoc />} />
            <Route path="/docs/missions" element={<MissionsDoc />} />
            <Route path="/docs/lazy-learning" element={<LazyLearningDoc />} />
            <Route path="/license" element={<CommunityLicensePage />} />

            {/* Authentication Route */}
            {/* If already logged in, /login redirects to home */}
            <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />

            {/* --- PROTECTED ROUTES --- */}
            <Route element={<ProtectedRoute session={session} />}>
              <Route path="/account" element={<AccountPage />} />
              <Route path="/chat" element={<KruReanChat />} />

              {/* Community Feed: Could be public, but let's keep it protected for posting/interaction focus for now, or move to public if read-only needed */}
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/community/question/:id" element={<QuestionDetailPage />} />

              {/* Dashboards & Tools */}
              <Route path="/school/dashboard" element={<SchoolDashboard />} />
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/tutor/dashboard" element={<TutorDashboard />} />
              <Route path="/classroom/:id" element={<ClassroomPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
            </Route>

            {/* Catch all: same split as the root route */}
            <Route path="*" element={session ? <HomePage /> : <LandingPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
