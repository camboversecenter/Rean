import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Target,
  Users,
  Search,
  Zap,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Loader2,
  X,
  MessageCircle,
  Gift,
} from '../components/Icons';
import SchoolCard from '../components/SchoolCard';
import ShortCourseCard from '../components/ShortCourseCard';
import MissionCard from '../components/MissionCard';
import TutorCard from '../components/TutorCard';
import { fetchAllSchools } from '../services/schoolService';
import { fetchAllMissions } from '../services/missionService';
import { fetchAllTutors } from '../services/tutorService';
import { getCurrentUserProfile } from '../services/authService';
import { School, Mission, TutorProfile } from '../types';

const HomePage: React.FC = () => {
  const [state, setState] = useState({
    searchTab: 'school' as 'school' | 'mission' | 'tutor',
    searchQuery: '',
    schools: [] as School[],
    missions: [] as Mission[],
    tutors: [] as TutorProfile[],
    loading: true,
    profile: null as any,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Parallel data loading
      const [schoolData, missionData, tutorData, userProfile] = await Promise.all([
        fetchAllSchools(),
        fetchAllMissions(),
        fetchAllTutors(),
        getCurrentUserProfile(),
      ]);

      setState((s) => ({
        ...s,
        schools: schoolData,
        missions: missionData,
        tutors: tutorData,
        profile: userProfile,
        loading: false,
      }));
    };
    loadData();
  }, []);

  // --- Filtering Logic ---
  const filteredSchools = state.schools.filter(
    (s) =>
      s.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      s.majors.some((m) => m.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
      s.location.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const filteredMissions = state.missions.filter(
    (m) =>
      m.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const filteredTutors = state.tutors.filter(
    (t) =>
      (t.fullName || '').toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (t.subjects || []).some((s) => s.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
      (t.bio || '').toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 md:pb-12 bg-surface-2 min-h-screen">
      <div className="max-w-5xl mx-auto md:px-4">
        {/* Hero Marketplace Search */}
        <section className="bg-surface md:bg-transparent pb-6 pt-4 px-4 md:px-0 rounded-b-3xl shadow-sm md:shadow-none border-b border-line md:border-none mb-6 sticky top-14 md:static z-30">
          {/* Search Interface */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Tabs */}
            <div className="flex justify-center space-x-1 p-1 bg-surface-3 md:bg-surface rounded-xl w-fit md:w-auto shrink-0 transition-all md:shadow-sm md:border md:border-line-strong">
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, searchTab: 'school' }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${state.searchTab === 'school' ? 'bg-surface text-primary shadow-sm md:bg-surface-3' : 'text-content-muted hover:text-content-soft'}`}
              >
                <Building2 className="h-3.5 w-3.5 mr-2" />
                សាលារៀន
              </button>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, searchTab: 'mission' }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${state.searchTab === 'mission' ? 'bg-surface text-primary shadow-sm md:bg-surface-3' : 'text-content-muted hover:text-content-soft'}`}
              >
                <Target className="h-3.5 w-3.5 mr-2" />
                បេសកកម្ម
              </button>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, searchTab: 'tutor' }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center ${state.searchTab === 'tutor' ? 'bg-surface text-primary shadow-sm md:bg-surface-3' : 'text-content-muted hover:text-content-soft'}`}
              >
                <Users className="h-3.5 w-3.5 mr-2" />
                គ្រូបង្រៀន
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <input
                aria-label="Search"
                type="text"
                value={state.searchQuery}
                onChange={(e) => setState((s) => ({ ...s, searchQuery: e.target.value }))}
                placeholder={
                  state.searchTab === 'school'
                    ? 'ស្វែងរកសាកលវិទ្យាល័យ ឬជំនាញសិក្សា...'
                    : state.searchTab === 'mission'
                      ? 'ស្វែងរកជំនាញ (Digital Marketing, Coding...)'
                      : 'ស្វែងរកគ្រូបង្រៀន (គណិតវិទ្យា, អង់គ្លេស...)'
                }
                className="w-full bg-surface-2 md:bg-surface border border-line-strong text-content text-sm rounded-xl focus:ring-primary focus:border-primary block w-full pl-12 pr-12 p-3 shadow-sm transition-all"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-content-faint" />
              </div>
              {state.searchQuery ? (
                <button
                  type="button"
                  onClick={() => setState((s) => ({ ...s, searchQuery: '' }))}
                  aria-label="Clear Search"
                  className="absolute right-3 top-2.5 p-1.5 text-content-faint hover:text-content-muted rounded-full hover:bg-surface-3"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="absolute right-2 top-2 bg-primary text-white font-medium rounded-lg text-xs px-4 py-1.5 hover:bg-primary/90 transition-colors"
                >
                  ស្វែងរក
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- CONTENT AREA --- */}

        {/* 1. SEARCH RESULTS VIEW */}
        {state.searchQuery ? (
          <div className="px-4 md:px-0 min-h-[50vh] animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-content">
                លទ្ធផលស្វែងរក "{state.searchQuery}"{' '}
                <span className="text-content-faint font-normal ml-1">
                  (
                  {state.searchTab === 'school'
                    ? filteredSchools.length
                    : state.searchTab === 'mission'
                      ? filteredMissions.length
                      : filteredTutors.length}
                  )
                </span>
              </h2>
            </div>

            {state.searchTab === 'school' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((s) => <SchoolCard key={s.id} school={s} />)
                ) : (
                  <div className="col-span-full text-center py-20 bg-surface rounded-2xl border border-dashed border-line-strong">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-content-faint" />
                    <p className="text-content-muted">មិនមានសាលាដែលអ្នកស្វែងរកទេ។</p>
                  </div>
                )}
              </div>
            )}

            {state.searchTab === 'mission' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMissions.length > 0 ? (
                  filteredMissions.map((m) => <MissionCard key={m.id} mission={m} />)
                ) : (
                  <div className="col-span-full text-center py-20 bg-surface rounded-2xl border border-dashed border-line-strong">
                    <Target className="h-12 w-12 mx-auto mb-3 text-content-faint" />
                    <p className="text-content-muted">មិនមានបេសកកម្មដែលអ្នកស្វែងរកទេ។</p>
                  </div>
                )}
              </div>
            )}

            {state.searchTab === 'tutor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTutors.length > 0 ? (
                  filteredTutors.map((t) => <TutorCard key={t.id} tutor={t} />)
                ) : (
                  <div className="col-span-full text-center py-20 bg-surface rounded-2xl border border-dashed border-line-strong">
                    <Users className="h-12 w-12 mx-auto mb-3 text-content-faint" />
                    <p className="text-content-muted">មិនមានគ្រូបង្រៀនដែលអ្នកស្វែងរកទេ។</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* 2. DEFAULT DASHBOARD VIEW */
          <>
            {/* Active Missions (Moved to Top) */}
            <section className="px-4 md:px-0 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-content text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  រៀនតាមរយៈការអនុវត្ត (Missions)
                </h2>
                <Link to="/explore" className="text-xs text-primary font-medium hover:underline">
                  មើលទាំងអស់
                </Link>
              </div>

              {state.loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-content-faint" />
                </div>
              ) : state.missions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.missions.slice(0, 3).map((mission) => (
                    <MissionCard key={mission.id} mission={mission} compact={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-content-faint bg-surface-2 rounded-xl border border-dashed border-line-strong">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active missions yet.</p>
                </div>
              )}
            </section>

            {/* COMMUNITY BANNER */}
            <section className="px-4 md:px-0 mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-yellow-100 fill-yellow-100" />
                    Lazy Learning Community
                  </h2>
                  <p className="text-yellow-50 text-sm md:text-base max-w-lg leading-relaxed">
                    ឆ្ងល់មេរៀន? សួរភ្លាម ឆ្លើយភ្លាមជាមួយ AI និងសិស្សច្បង!
                    សន្សំពិន្ទុដើម្បីប្តូរយករង្វាន់។
                  </p>
                </div>
                <Link
                  to="/community"
                  className="relative z-10 bg-surface text-orange-600 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-yellow-50 transition-colors flex items-center whitespace-nowrap active:scale-95 transform"
                >
                  <MessageCircle className="h-5 w-5 mr-2" /> ចូលសហគមន៍
                </Link>

                {/* Decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-surface/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
              </div>
            </section>

            {/* School Recruitment */}
            <section className="mb-8">
              <div className="flex items-center justify-between px-4 md:px-0 mb-3">
                <h2 className="font-bold text-content text-lg flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  ការជ្រើសរើសសិស្សថ្មី (Admissions)
                </h2>
                <Link
                  to="/schools"
                  className="text-xs text-primary font-medium flex items-center hover:underline"
                >
                  មើលទាំងអស់ <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="px-4 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.loading ? (
                  <div className="col-span-2 flex justify-center py-8">
                    <Loader2 className="animate-spin text-content-faint" />
                  </div>
                ) : (
                  state.schools
                    .slice(0, 4)
                    .map((school) => <SchoolCard key={school.id} school={school} />)
                )}
              </div>
            </section>

            {/* Short Courses Grid (Desktop) / Carousel (Mobile) */}
            <section className="mb-8 bg-blue-50 py-6 md:rounded-3xl">
              <div className="px-4 md:px-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-content text-lg flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    វគ្គសិក្សារយៈពេលខ្លី
                  </h2>
                  <Link to="/explore" className="text-xs text-blue-600 font-medium hover:underline">
                    មើលបន្ថែម
                  </Link>
                </div>
                {state.loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-300" />
                  </div>
                ) : (
                  <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-2 md:gap-4 md:space-x-0 md:overflow-visible md:mx-0 md:px-0">
                    {state.schools
                      .flatMap((s) => s.shortCourses.map((sc) => ({ ...sc, schoolName: s.name })))
                      .slice(0, 6)
                      .map((course) => (
                        <div key={course.id} className="min-w-[280px] md:min-w-0 h-full">
                          <ShortCourseCard course={course} schoolName={course.schoolName} />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* Tutors List */}
            <section className="mb-8">
              <div className="flex items-center justify-between px-4 md:px-0 mb-3">
                <h2 className="font-bold text-content text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-500" />
                  ស្វែងរកគ្រូបង្រៀន (Tutors)
                </h2>
                <Link to="/tutors" className="text-xs text-primary font-medium hover:underline">
                  ស្វែងរកគ្រូ
                </Link>
              </div>
              <div className="px-4 md:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {state.loading ? (
                  <div className="col-span-2 flex justify-center py-8">
                    <Loader2 className="animate-spin text-content-faint" />
                  </div>
                ) : state.tutors.length > 0 ? (
                  state.tutors
                    .slice(0, 4)
                    .map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />)
                ) : (
                  <div className="col-span-2 text-center py-8 text-content-faint bg-surface-2 rounded-xl border border-dashed border-line-strong">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active tutors yet.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
