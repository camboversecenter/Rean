import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserProfileById } from '../services/authService';
import { getStudentMissions } from '../services/missionProgressService';
import { getStudentCourses } from '../services/schoolService';
import { calculateLevel } from '../services/leaderboardService';
import {
  Loader2,
  Target,
  BookOpen,
  CheckCircle,
  GraduationCap,
  ChevronLeft,
  Award,
} from '../components/Icons';
import MissionCard from '../components/MissionCard';
import ShortCourseCard from '../components/ShortCourseCard';
import { Mission } from '../types';

const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState({
    profile: null as any,
    missions: [] as any[],
    courses: [] as any[],
    loading: true,
    activeTab: 'active' as 'active' | 'completed',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setState((s) => ({ ...s, loading: true }));
      try {
        const [userProfile, userMissions, userCourses] = await Promise.all([
          getUserProfileById(id),
          getStudentMissions(id),
          getStudentCourses(id),
        ]);
        setState((s) => ({
          ...s,
          profile: userProfile,
          missions: userMissions,
          courses: userCourses,
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    };
    load();
  }, [id]);

  if (state.loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  if (!state.profile) return <div className="p-10 text-center">User not found</div>;

  const level = calculateLevel(state.profile.lifetime_xp || 0);

  // Filter Lists
  const activeMissions = state.missions.filter(
    (m) => m.enrollmentStatus === 'In Progress' || m.enrollmentStatus === 'Pending'
  );
  const completedMissions = state.missions.filter((m) => m.enrollmentStatus === 'Completed');

  const activeCourses = state.courses.filter(
    (c) => c.enrollmentStatus === 'Pending' || c.enrollmentStatus === 'Approved'
  );
  const completedCourses = state.courses.filter((c) => c.enrollmentStatus === 'Completed');

  // Combine for display based on tab
  const displayActive = [
    ...activeMissions.map((m) => ({ ...m, type: 'mission' })),
    ...activeCourses.map((c) => ({ ...c, type: 'course' })),
  ];
  const displayCompleted = [
    ...completedMissions.map((m) => ({ ...m, type: 'mission' })),
    ...completedCourses.map((c) => ({ ...c, type: 'course' })),
  ];

  return (
    <div className="min-h-screen bg-surface-2 pb-20 font-sans animate-fade-in">
      {/* Header Section */}
      <div className="bg-surface border-b border-line-strong mb-8 relative">
        {/* Page Title - Always Visible */}
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-2 relative z-20">
          <h1 className="text-xl font-bold text-content">ប្រវត្តិរូប (Profile)</h1>
        </div>

        {/* Cover Photo */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-500 to-teal-400 relative z-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute top-4 left-4 p-2 bg-surface/20 backdrop-blur-md rounded-full text-white hover:bg-surface/30 transition-colors z-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="max-w-5xl mx-auto px-4 pb-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4 md:gap-6">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg overflow-hidden bg-line-strong flex-shrink-0">
              <img
                src={
                  state.profile.avatar_url ||
                  `https://ui-avatars.com/api/?name=${state.profile.full_name}`
                }
                className="w-full h-full object-cover"
                alt="Profile"
              />
            </div>
            <div className="text-center md:text-left flex-1 mb-2 md:mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-content leading-tight mb-1">
                {state.profile.full_name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="bg-surface-3 text-content-muted text-[10px] px-2 py-0.5 rounded uppercase font-bold border border-line-strong">
                  {state.profile.role || 'Student'}
                </span>
                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold border border-yellow-200">
                  Lvl {level}
                </span>
              </div>
            </div>

            {/* Stats - Desktop aligned right/bottom of header area */}
            <div className="flex gap-4 mb-2 md:mb-6">
              <div className="text-center bg-surface-2 p-3 rounded-xl min-w-[80px] border border-line">
                <p className="text-xs text-content-muted font-bold uppercase">Active</p>
                <p className="text-xl font-bold text-primary">{displayActive.length}</p>
              </div>
              <div className="text-center bg-surface-2 p-3 rounded-xl min-w-[80px] border border-line">
                <p className="text-xs text-content-muted font-bold uppercase">Done</p>
                <p className="text-xl font-bold text-green-600">{displayCompleted.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Tabs */}
        <div className="flex border-b border-line-strong mb-6">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'active' }))}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center ${state.activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-content-muted'}`}
          >
            <GraduationCap className="h-4 w-4 mr-2" /> កំពុងសិក្សា (Learning)
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'completed' }))}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center ${state.activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-content-muted'}`}
          >
            <Award className="h-4 w-4 mr-2" /> សមិទ្ធិផល (Achievements)
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.activeTab === 'active' && displayActive.length === 0 && (
            <div className="col-span-full py-16 text-center text-content-faint bg-surface rounded-2xl border border-dashed border-line-strong">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>មិនទាន់មានការសិក្សាសកម្មទេ។</p>
            </div>
          )}
          {state.activeTab === 'completed' && displayCompleted.length === 0 && (
            <div className="col-span-full py-16 text-center text-content-faint bg-surface rounded-2xl border border-dashed border-line-strong">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>មិនទាន់មានសមិទ្ធិផលនៅឡើយទេ។</p>
            </div>
          )}

          {(state.activeTab === 'active' ? displayActive : displayCompleted).map((item: any) => {
            if (item.type === 'mission') {
              return <MissionCard key={`m-${item.id}`} mission={item as Mission} />;
            } else {
              // Map generic data back to ShortCourse structure for card
              const scProps = {
                id: item.id,
                title: item.title,
                coverImage: item.coverImage,
                category: 'Short Course',
                price: item.price,
                duration: item.duration,
                startDate: item.startDate || 'Flexible',
                format: item.format || 'Online',
              };
              return (
                <div key={`c-${item.id}`} className="relative">
                  <ShortCourseCard course={scProps as any} schoolName={item.schoolName} />
                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold shadow-sm ${
                        item.enrollmentStatus === 'Completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {item.enrollmentStatus}
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
