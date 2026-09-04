import React, { useState, useEffect } from 'react';
import {
  Building2,
  Camera,
  Zap,
  Brain,
  X,
  Loader2,
  Save,
  Layout,
  MapPin,
  DollarSign,
  BookOpen,
  Eye,
  EyeOff,
} from './Icons';
import { School } from '../types';
import { generateImage, AI_COSTS } from '../services/geminiService';
import CharCounter from './CharCounter';
import toast from 'react-hot-toast';

const SCHOOL_DESC_LIMIT = 1000;

interface SchoolFormProps {
  school: School;
  isSaving: boolean;
  onSave: (
    updates: Partial<School>,
    files: { logo: File | Blob | null; cover: File | Blob | null }
  ) => Promise<void>;
}

const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const SchoolForm: React.FC<SchoolFormProps> = ({ school, isSaving, onSave }) => {
  const [state, setState] = useState({
    formData: school,
    majorsInput: school.majors?.join(', ') || '',
    logoFile: null as File | null,
    logoBase64: null as string | null,
    coverFile: null as File | null,
    coverBase64: null as string | null,
    aiModalOpen: false,
    aiTarget: null as 'logo' | 'cover' | null,
    aiPrompt: '',
    generating: false,
    toggling: false,
  });

  const handleGenerateImage = async () => {
    if (!state.aiPrompt.trim()) return;
    setState((prev) => ({ ...prev, generating: true }));
    try {
      const base64 = await generateImage(state.aiPrompt);
      if (base64) {
        setState((prev) => ({
          ...prev,
          ...(prev.aiTarget === 'logo'
            ? { logoBase64: base64, logoFile: null }
            : { coverBase64: base64, coverFile: null }),
          aiModalOpen: false,
        }));
        toast.success('រូបភាពត្រូវបានបង្កើត!');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setState((prev) => ({ ...prev, generating: false }));
    }
  };

  const openAiModal = (target: 'logo' | 'cover') => {
    setState((prev) => ({
      ...prev,
      aiTarget: target,
      aiPrompt:
        target === 'logo'
          ? `Professional flat vector logo for ${prev.formData.name}, educational style, clean background.`
          : `Modern university campus photography for ${prev.formData.name}, high quality architecture, sunny day.`,
      aiModalOpen: true,
    }));
  };

  const handleFormSubmit = () => {
    const files = {
      logo: state.logoBase64 ? base64ToBlob(state.logoBase64) : state.logoFile,
      cover: state.coverBase64 ? base64ToBlob(state.coverBase64) : state.coverFile,
    };

    // Convert comma-separated string to array
    const majorsArray = state.majorsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m !== '');

    onSave({ ...state.formData, majors: majorsArray }, files);
  };

  const togglePublishStatus = async () => {
    if (state.toggling) return;
    const newStatus = !state.formData.isPublished;
    setState((prev) => ({
      ...prev,
      toggling: true,
      formData: { ...prev.formData, isPublished: newStatus },
    }));

    try {
      // Immediate Save for better UX on toggles
      // Passing null for files ensures we don't re-upload images during this quick action
      await onSave({ isPublished: newStatus }, { logo: null, cover: null });

      // Toast handled by parent onSave usually, but we can add specific context here if parent doesn't
      // Parent (SchoolDashboard) currently shows "Saved Successfully", which is fine.
    } catch (e) {
      // Revert on error
      setState((prev) => ({ ...prev, formData: { ...prev.formData, isPublished: !newStatus } }));
      toast.error('បរាជ័យក្នុងការប្តូរស្ថានភាព');
    } finally {
      setState((prev) => ({ ...prev, toggling: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* VISIBILITY CONTROL BANNER */}
      <div className="lg:col-span-3">
        <div
          className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all ${
            state.formData.isPublished
              ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${state.formData.isPublished ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}
            >
              {state.formData.isPublished ? (
                <Eye className="h-6 w-6" />
              ) : (
                <EyeOff className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-content flex items-center gap-2">
                ស្ថានភាពសាលា (Visibility)
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${state.formData.isPublished ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'}`}
                >
                  {state.formData.isPublished ? 'Published' : 'Draft / Hidden'}
                </span>
              </h3>
              <p className="text-xs text-content-muted mt-1">
                {state.formData.isPublished
                  ? 'សាលារបស់អ្នកកំពុងបង្ហាញជាសាធារណៈ។ សិស្សអាចស្វែងរកបាន។'
                  : 'សាលារបស់អ្នកត្រូវបានលាក់។ មានតែអ្នកប៉ុណ្ណោះដែលមើលឃើញ។'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-surface/50 p-2 rounded-xl">
            <span
              className={`text-xs font-bold ${state.formData.isPublished ? 'text-content-faint' : 'text-amber-600'}`}
            >
              លាក់
            </span>
            <button
              type="button"
              onClick={togglePublishStatus}
              disabled={state.toggling}
              aria-label="Toggle publish status"
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                state.formData.isPublished ? 'bg-green-500' : 'bg-line-strong'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface transition-transform duration-200 ease-in-out ${
                  state.formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${state.formData.isPublished ? 'text-green-600' : 'text-content-faint'}`}
            >
              បង្ហាញ
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-line">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-content flex items-center">
              <Layout className="h-5 w-5 mr-2 text-primary" /> ព័ត៌មានទូទៅ
            </h3>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSaving || state.formData.description.length > SCHOOL_DESC_LIMIT}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              រក្សាទុកបម្រែបម្រួល
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="schoolName"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  ឈ្មោះសាលា
                </label>
                <input
                  id="schoolName"
                  className="w-full p-3 bg-surface-2 border border-line rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={state.formData.name}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, name: e.target.value },
                    }))
                  }
                  placeholder="បញ្ចូលឈ្មោះសាលារៀន"
                />
              </div>
              <div>
                <label
                  htmlFor="schoolType"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  ប្រភេទគ្រឹះស្ថាន
                </label>
                <select
                  id="schoolType"
                  className="w-full p-3 bg-surface-2 border border-line rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={state.formData.type}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, type: e.target.value as any },
                    }))
                  }
                >
                  <option value="University">សាកលវិទ្យាល័យ</option>
                  <option value="Vocational">វិជ្ជាជីវៈ</option>
                  <option value="High School">វិទ្យាល័យ</option>
                  <option value="Center">មជ្ឈមណ្ឌល (Center)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="schoolDesc"
                className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
              >
                ការពិពណ៌នា
              </label>
              <textarea
                id="schoolDesc"
                className="w-full p-3 bg-surface-2 border border-line rounded-xl h-32 resize-none focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed"
                value={state.formData.description}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, description: e.target.value },
                  }))
                }
                placeholder="រៀបរាប់អំពីសាលារបស់អ្នក..."
              />
              <CharCounter current={state.formData.description.length} limit={SCHOOL_DESC_LIMIT} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="schoolLoc"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  ទីតាំង
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-content-faint" />
                  <input
                    id="schoolLoc"
                    className="w-full pl-9 pr-3 py-3 bg-surface-2 border border-line rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={state.formData.location}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, location: e.target.value },
                      }))
                    }
                    placeholder="ឧ. រាជធានីភ្នំពេញ"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="schoolTuition"
                  className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
                >
                  តម្លៃសិក្សា (Tuition Range)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-content-faint" />
                  <input
                    id="schoolTuition"
                    className="w-full pl-9 pr-3 py-3 bg-surface-2 border border-line rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={state.formData.tuitionRange || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, tuitionRange: e.target.value },
                      }))
                    }
                    placeholder="ឧ. $500 - $1,500 / ឆ្នាំ"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="schoolMajors"
                className="block text-xs font-bold text-content-muted mb-1.5 uppercase"
              >
                ជំនាញសិក្សា (Majors)
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-content-faint" />
                <input
                  id="schoolMajors"
                  className="w-full pl-9 pr-3 py-3 bg-surface-2 border border-line rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={state.majorsInput}
                  onChange={(e) => setState((prev) => ({ ...prev, majorsInput: e.target.value }))}
                  placeholder="ឧ. វិទ្យាសាស្ត្រកុំព្យូទ័រ, គ្រប់គ្រងអាជីវកម្ម (បំបែកដោយសញ្ញាក្បៀស)"
                />
              </div>
              <p className="text-[10px] text-content-faint mt-1 italic">
                បញ្ចូលជំនាញដែលសាលាផ្តល់ជូន បំបែកដោយសញ្ញាក្បៀស (,)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Cover Section */}
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-line">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-content">រូបភាពគម្រប</h3>
            <button
              type="button"
              onClick={() => openAiModal('cover')}
              className="text-[10px] font-bold text-purple-600 dark:text-purple-300 flex items-center bg-purple-50 dark:bg-purple-900/50 px-2 py-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-colors"
            >
              <Zap className="h-3 w-3 mr-1 fill-purple-600 dark:fill-purple-300" /> AI Designer
            </button>
          </div>
          <div className="relative aspect-video rounded-2xl bg-surface-2 overflow-hidden border border-dashed border-line-strong flex items-center justify-center group">
            <img
              src={
                state.coverBase64
                  ? `data:image/png;base64,${state.coverBase64}`
                  : state.coverFile
                    ? URL.createObjectURL(state.coverFile)
                    : state.formData.coverImage
              }
              className="w-full h-full object-cover"
              alt="Cover Preview"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label
                htmlFor="coverInput"
                className="bg-surface p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-5 w-5 text-primary" />
                <input
                  id="coverInput"
                  aria-label="Upload Cover Image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      coverFile: e.target.files?.[0] || null,
                      coverBase64: null,
                    }))
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-surface p-6 rounded-3xl shadow-sm border border-line">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-content">ឡូហ្គោសាលា</h3>
            <button
              type="button"
              onClick={() => openAiModal('logo')}
              className="text-[10px] font-bold text-purple-600 dark:text-purple-300 flex items-center bg-purple-50 dark:bg-purple-900/50 px-2 py-1 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/50 transition-colors"
            >
              <Zap className="h-3 w-3 mr-1 fill-purple-600 dark:fill-purple-300" /> AI Architect
            </button>
          </div>
          <div className="w-24 h-24 mx-auto relative rounded-2xl bg-surface-2 border border-dashed border-line-strong flex items-center justify-center group overflow-hidden">
            <img
              src={
                state.logoBase64
                  ? `data:image/png;base64,${state.logoBase64}`
                  : state.logoFile
                    ? URL.createObjectURL(state.logoFile)
                    : state.formData.logo
              }
              className="w-full h-full object-contain p-2"
              alt="Logo Preview"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label
                htmlFor="logoInput"
                className="bg-surface p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-4 w-4 text-primary" />
                <input
                  id="logoInput"
                  aria-label="Upload Logo"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      logoFile: e.target.files?.[0] || null,
                      logoBase64: null,
                    }))
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Image Generation Modal */}
      {state.aiModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Branding Studio</h3>
                <p className="text-[10px] text-content-faint font-bold uppercase tracking-wider">
                  Powered by Gemini 2.5
                </p>
              </div>
            </div>
            <p className="text-sm text-content-muted mb-4">
              ពណ៌នាពីរូបភាពដែលអ្នកចង់បានសម្រាប់{' '}
              <strong>{state.aiTarget === 'logo' ? 'ឡូហ្គោ' : 'រូបភាពគម្រប'}</strong>។
            </p>
            <textarea
              aria-label="AI Prompt"
              className="w-full p-4 bg-surface-2 border border-line rounded-2xl h-28 text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              value={state.aiPrompt}
              onChange={(e) => setState((prev) => ({ ...prev, aiPrompt: e.target.value }))}
              placeholder="Describe visual style, colors, elements..."
            />
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, aiModalOpen: false }))}
                className="flex-1 py-3 text-content-muted font-bold hover:bg-surface-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={state.generating || !state.aiPrompt.trim()}
                className="flex-1 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                {state.generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" /> Generate
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-content-faint mt-4 italic">
              ចំណាយ៖ {AI_COSTS.IMAGE} Points សម្រាប់ការបង្កើតម្តង។
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolForm;
