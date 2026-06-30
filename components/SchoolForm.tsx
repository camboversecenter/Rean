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

const SchoolForm: React.FC<SchoolFormProps> = ({ school, isSaving, onSave }) => {
  const [formData, setFormData] = useState<School>(school);
  const [majorsInput, setMajorsInput] = useState(school.majors?.join(', ') || '');

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);

  // AI states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTarget, setAiTarget] = useState<'logo' | 'cover' | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  // Local loading state for toggle
  const [toggling, setToggling] = useState(false);

  // Sync if school prop changes
  useEffect(() => {
    setFormData(school);
    setMajorsInput(school.majors?.join(', ') || '');
  }, [school]);

  const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const base64 = await generateImage(aiPrompt);
      if (base64) {
        if (aiTarget === 'logo') {
          setLogoBase64(base64);
          setLogoFile(null);
        } else {
          setCoverBase64(base64);
          setCoverFile(null);
        }
        setAiModalOpen(false);
        toast.success('រូបភាពត្រូវបានបង្កើត!');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const openAiModal = (target: 'logo' | 'cover') => {
    setAiTarget(target);
    setAiPrompt(
      target === 'logo'
        ? `Professional flat vector logo for ${formData.name}, educational style, clean background.`
        : `Modern university campus photography for ${formData.name}, high quality architecture, sunny day.`
    );
    setAiModalOpen(true);
  };

  const handleFormSubmit = () => {
    const files = {
      logo: logoBase64 ? base64ToBlob(logoBase64) : logoFile,
      cover: coverBase64 ? base64ToBlob(coverBase64) : coverFile,
    };

    // Convert comma-separated string to array
    const majorsArray = majorsInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m !== '');

    onSave({ ...formData, majors: majorsArray }, files);
  };

  const togglePublishStatus = async () => {
    if (toggling) return;
    const newStatus = !formData.isPublished;
    setToggling(true);

    // Optimistic Update
    setFormData((prev) => ({ ...prev, isPublished: newStatus }));

    try {
      // Immediate Save for better UX on toggles
      // Passing null for files ensures we don't re-upload images during this quick action
      await onSave({ isPublished: newStatus }, { logo: null, cover: null });

      // Toast handled by parent onSave usually, but we can add specific context here if parent doesn't
      // Parent (SchoolDashboard) currently shows "Saved Successfully", which is fine.
    } catch (e) {
      // Revert on error
      setFormData((prev) => ({ ...prev, isPublished: !newStatus }));
      toast.error('បរាជ័យក្នុងការប្តូរស្ថានភាព');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* VISIBILITY CONTROL BANNER */}
      <div className="lg:col-span-3">
        <div
          className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all ${
            formData.isPublished ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${formData.isPublished ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}
            >
              {formData.isPublished ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                ស្ថានភាពសាលា (Visibility)
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${formData.isPublished ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}
                >
                  {formData.isPublished ? 'Published' : 'Draft / Hidden'}
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {formData.isPublished
                  ? 'សាលារបស់អ្នកកំពុងបង្ហាញជាសាធារណៈ។ សិស្សអាចស្វែងរកបាន។'
                  : 'សាលារបស់អ្នកត្រូវបានលាក់។ មានតែអ្នកប៉ុណ្ណោះដែលមើលឃើញ។'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-xl">
            <span
              className={`text-xs font-bold ${formData.isPublished ? 'text-gray-400' : 'text-amber-600'}`}
            >
              លាក់
            </span>
            <button
              onClick={togglePublishStatus}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                formData.isPublished ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  formData.isPublished ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${formData.isPublished ? 'text-green-600' : 'text-gray-400'}`}
            >
              បង្ហាញ
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Layout className="h-5 w-5 mr-2 text-primary" /> ព័ត៌មានទូទៅ
            </h3>
            <button
              onClick={handleFormSubmit}
              disabled={isSaving || formData.description.length > SCHOOL_DESC_LIMIT}
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
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  ឈ្មោះសាលា
                </label>
                <input
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="បញ្ចូលឈ្មោះសាលារៀន"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  ប្រភេទគ្រឹះស្ថាន
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="University">សាកលវិទ្យាល័យ</option>
                  <option value="Vocational">វិជ្ជាជីវៈ</option>
                  <option value="High School">វិទ្យាល័យ</option>
                  <option value="Center">មជ្ឈមណ្ឌល (Center)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                ការពិពណ៌នា
              </label>
              <textarea
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-32 resize-none focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="រៀបរាប់អំពីសាលារបស់អ្នក..."
              />
              <CharCounter current={formData.description.length} limit={SCHOOL_DESC_LIMIT} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  ទីតាំង
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="ឧ. រាជធានីភ្នំពេញ"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  តម្លៃសិក្សា (Tuition Range)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.tuitionRange || ''}
                    onChange={(e) => setFormData({ ...formData, tuitionRange: e.target.value })}
                    placeholder="ឧ. $500 - $1,500 / ឆ្នាំ"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                ជំនាញសិក្សា (Majors)
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={majorsInput}
                  onChange={(e) => setMajorsInput(e.target.value)}
                  placeholder="ឧ. វិទ្យាសាស្ត្រកុំព្យូទ័រ, គ្រប់គ្រងអាជីវកម្ម (បំបែកដោយសញ្ញាក្បៀស)"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">
                បញ្ចូលជំនាញដែលសាលាផ្តល់ជូន បំបែកដោយសញ្ញាក្បៀស (,)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Cover Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">រូបភាពគម្រប</h3>
            <button
              onClick={() => openAiModal('cover')}
              className="text-[10px] font-bold text-purple-600 flex items-center bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Zap className="h-3 w-3 mr-1 fill-purple-600" /> AI Designer
            </button>
          </div>
          <div className="relative aspect-video rounded-2xl bg-gray-50 overflow-hidden border border-dashed border-gray-200 flex items-center justify-center group">
            <img
              src={
                coverBase64
                  ? `data:image/png;base64,${coverBase64}`
                  : coverFile
                    ? URL.createObjectURL(coverFile)
                    : formData.coverImage
              }
              className="w-full h-full object-cover"
              alt="Cover Preview"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="bg-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-5 w-5 text-primary" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setCoverFile(e.target.files?.[0] || null);
                    setCoverBase64(null);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">ឡូហ្គោសាលា</h3>
            <button
              onClick={() => openAiModal('logo')}
              className="text-[10px] font-bold text-purple-600 flex items-center bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Zap className="h-3 w-3 mr-1 fill-purple-600" /> AI Architect
            </button>
          </div>
          <div className="w-24 h-24 mx-auto relative rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center group overflow-hidden">
            <img
              src={
                logoBase64
                  ? `data:image/png;base64,${logoBase64}`
                  : logoFile
                    ? URL.createObjectURL(logoFile)
                    : formData.logo
              }
              className="w-full h-full object-contain p-2"
              alt="Logo Preview"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="bg-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-primary" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setLogoFile(e.target.files?.[0] || null);
                    setLogoBase64(null);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Image Generation Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Branding Studio</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Powered by Gemini 2.5
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              ពណ៌នាពីរូបភាពដែលអ្នកចង់បានសម្រាប់{' '}
              <strong>{aiTarget === 'logo' ? 'ឡូហ្គោ' : 'រូបភាពគម្រប'}</strong>។
            </p>
            <textarea
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-28 text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe visual style, colors, elements..."
            />
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setAiModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={generating || !aiPrompt.trim()}
                className="flex-1 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-1" /> Generate
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-4 italic">
              ចំណាយ៖ {AI_COSTS.IMAGE} Points សម្រាប់ការបង្កើតម្តង។
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolForm;
