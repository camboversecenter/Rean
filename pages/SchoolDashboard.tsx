import React, { useEffect, useState } from 'react';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Plus,
  Loader2,
  MessageCircle,
  CheckCircle,
  Layout,
  Calendar,
  User,
  Phone,
} from '../components/Icons';
import {
  getMySchool,
  updateSchoolProfile,
  createMySchool,
  getMyInquiries,
  getSchoolEnrollments,
} from '../services/schoolService';
import { uploadFile, deleteFileFromUrl } from '../services/storageService';
import { School, SchoolInquiry } from '../types';
import SchoolForm from '../components/SchoolForm';
import SchoolAdmissionManager from '../components/SchoolAdmissionManager';
import SchoolInquiryManager from '../components/SchoolInquiryManager';
import SchoolEnrollmentManager from '../components/SchoolEnrollmentManager';
import SchoolCourseManager from '../components/SchoolCourseManager';
import toast from 'react-hot-toast';

const SchoolDashboard: React.FC = () => {
  const [state, setState] = useState({
    school: null as School | null,
    inquiries: [] as SchoolInquiry[],
    enrollments: [] as any[],
    loading: true,
    saving: false,
    activeTab: 'profile' as 'profile' | 'admissions' | 'courses' | 'leads' | 'enrollments',
  });

  const loadData = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const schoolData = await getMySchool();
      let leads: SchoolInquiry[] = [];
      let apps: any[] = [];
      if (schoolData) {
        [leads, apps] = await Promise.all([
          getMyInquiries(schoolData.id),
          getSchoolEnrollments(schoolData.id),
        ]);
      }
      setState((s) => ({
        ...s,
        school: schoolData,
        inquiries: leads,
        enrollments: apps,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSchool = async () => {
    setState((s) => ({ ...s, saving: true }));
    try {
      const newSchool = await createMySchool('សាលារបស់ខ្ញុំ (My School)');
      setState((s) => ({ ...s, school: newSchool }));
      toast.success('បានបង្កើតសាលារៀនជោគជ័យ!');
      await loadData();
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការបង្កើតសាលា។');
    } finally {
      setState((s) => ({ ...s, saving: false }));
    }
  };

  const handleSaveProfile = async (
    updates: Partial<School>,
    files: { logo: File | Blob | null; cover: File | Blob | null }
  ) => {
    if (!state.school) return;
    setState((s) => ({ ...s, saving: true }));
    try {
      let logoUrl = state.school.logo;
      let coverUrl = state.school.coverImage;

      if (files.logo) {
        if (logoUrl?.includes('supabase')) await deleteFileFromUrl(logoUrl);
        logoUrl = (await uploadFile(files.logo, 'school-logos')) || logoUrl;
      }

      if (files.cover) {
        if (coverUrl?.includes('supabase')) await deleteFileFromUrl(coverUrl);
        coverUrl = (await uploadFile(files.cover, 'school-covers')) || coverUrl;
      }

      await updateSchoolProfile(state.school.id, {
        ...updates,
        logo: logoUrl,
        coverImage: coverUrl,
      });
      toast.success('រក្សាទុកជោគជ័យ!');
      await loadData();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការរក្សាទុក');
    } finally {
      setState((s) => ({ ...s, saving: false }));
    }
  };

  if (state.loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );

  if (!state.school) {
    return (
      <div className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-4">
        <div className="bg-surface p-8 rounded-3xl shadow-sm border border-line text-center max-w-md w-full">
          <Building2 className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-content mb-2">មិនទាន់មានព័ត៌មានសាលារៀន</h2>
          <p className="text-content-muted text-sm mb-6">
            អ្នកមិនទាន់បានបង្កើតទំព័រសាលារៀននៅឡើយទេ។
          </p>
          <button
            type="button"
            onClick={handleCreateSchool}
            disabled={state.saving}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all"
          >
            {state.saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Plus className="h-5 w-5 mr-2" />
            )}
            បង្កើតសាលារៀនឥឡូវនេះ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2 pb-20">
      {/* Nav Bar */}
      <div className="bg-surface border-b border-line-strong px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-content flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary" />
            គ្រប់គ្រងសាលា
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Custom Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {[
            { id: 'profile', icon: Layout, label: 'ប្រវត្តិរូប' },
            { id: 'admissions', icon: GraduationCap, label: 'ការជ្រើសរើស' },
            { id: 'courses', icon: BookOpen, label: 'វគ្គសិក្សា' },
            { id: 'leads', icon: MessageCircle, label: 'សំណួរ' },
            { id: 'enrollments', icon: CheckCircle, label: 'ការចុះឈ្មោះ' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setState((s) => ({ ...s, activeTab: tab.id as any }))}
              className={`flex items-center px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${state.activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-surface text-content-muted border border-line hover:bg-surface-2'}`}
            >
              <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {state.activeTab === 'profile' && (
            <SchoolForm school={state.school} isSaving={state.saving} onSave={handleSaveProfile} />
          )}

          {state.activeTab === 'admissions' && (
            <SchoolAdmissionManager
              schoolId={state.school.id}
              admissions={state.school.admissions}
              onUpdate={loadData}
            />
          )}

          {state.activeTab === 'courses' && (
            <SchoolCourseManager
              schoolId={state.school.id}
              courses={state.school.shortCourses}
              onUpdate={loadData}
            />
          )}

          {state.activeTab === 'leads' && (
            <SchoolInquiryManager inquiries={state.inquiries} onUpdate={loadData} />
          )}

          {state.activeTab === 'enrollments' && (
            <SchoolEnrollmentManager enrollments={state.enrollments} onUpdate={loadData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
