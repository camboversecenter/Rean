import React, { useState } from 'react';
import { updateUserRole } from '../services/authService';
import { UserRole } from '../types';
import { User, Briefcase, GraduationCap, CheckCircle, AlertCircle, Building2 } from './Icons';

const ROLES: {
  id: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: 'student',
    title: 'សិស្ស / និស្សិត',
    subtitle: 'Learner',
    description: 'ស្វែងរកសាលា, ស្វែងរកគ្រូ និងរៀនជំនាញថ្មីៗ។',
    icon: User,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'tutor',
    title: 'គ្រូបង្រៀន',
    subtitle: 'Educator',
    description: 'បង្កើតប្រវត្តិរូបបង្រៀន និងទទួលសិស្ស។',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'school',
    title: 'សាលារៀន',
    subtitle: 'Institution',
    description: 'គ្រប់គ្រងទំព័រសាលា និងជ្រើសរើសសិស្សថ្មី។',
    icon: Building2,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'business',
    title: 'ក្រុមហ៊ុន',
    subtitle: 'Partner',
    description: 'បង្កើត Missions និងជ្រើសរើសបុគ្គលិក។',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-600',
  },
];

const RoleSelectionPage: React.FC = () => {
  const [state, setState] = useState<{
    selectedRole: UserRole | null;
    loading: boolean;
    errorMsg: string | null;
  }>({
    selectedRole: null,
    loading: false,
    errorMsg: null,
  });

  const { selectedRole, loading, errorMsg } = state;

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setState(s => ({ ...s, loading: true, errorMsg: null }));

    try {
      await updateUserRole(selectedRole);
      // Reload to trigger the App.tsx auth state check
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating role:', error);
      setState(s => ({ ...s, loading: false, errorMsg: error.message || 'An unexpected error occurred. Please try again.' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">តើអ្នកជានរណា?</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            ជ្រើសរើសតួនាទីរបស់អ្នកដើម្បីបន្ត។ អ្នកមិនអាចផ្លាស់ប្តូរនៅពេលក្រោយបានទេ។
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-start mx-2" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Mobile First Grid: 1 col on mobile, 2 on tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-24 md:mb-8 px-2">
          {ROLES.map((role) => (
            <button type="button"
              key={role.id}
              onClick={() => setState(s => ({ ...s, selectedRole: role.id }))}
              aria-pressed={selectedRole === role.id}
              aria-label={`ជ្រើសរើសតួនាទី ${role.title}`}
              className={`relative cursor-pointer bg-white p-5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left w-full ${
                selectedRole === role.id
                  ? 'border-primary shadow-lg ring-1 ring-primary'
                  : 'border-gray-100 shadow-sm hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${role.color}`}>
                  <role.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                {selectedRole === role.id && (
                  <div className="bg-primary text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{role.title}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                  {role.subtitle}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Floating Bottom Button for Mobile, Static for Desktop */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-2 z-10">
          <div className="max-w-2xl mx-auto">
            <button type="button"
              onClick={handleConfirm}
              disabled={!selectedRole || loading}
              aria-label="បន្តទៅមុខ (Continue)"
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.99] transition-transform flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></div>
                  កំពុងដំណើរការ...
                </>
              ) : (
                'បន្តទៅមុខ (Continue)'
              )}
            </button>
          </div>
        </div>

        {/* Spacer for mobile scrolling behind fixed button */}
        <div className="h-20 md:hidden"></div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
