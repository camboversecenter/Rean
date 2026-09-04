import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Zap,
  Image as ImageIcon,
  X,
  ShieldCheck,
  DollarSign,
  Layout,
  BookOpen,
  Plus,
  Brain,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Experiment,
} from './Icons';
import { Mission, MissionModule, MissionCategory } from '../types';
import {
  generateMissionStructure,
  generateImage,
  chatWithAI,
  AI_COSTS,
} from '../services/geminiService';
import { assignMissionMentor } from '../services/missionService';
import CharCounter from './CharCounter';
import toast from 'react-hot-toast';

const DESC_LIMIT = 1000;
const MODULE_TITLE_LIMIT = 100;
const TASK_LIMIT = 500;
const PERSONA_LIMIT = 500;
const PROMPT_LIMIT = 300;
const THEORY_LIMIT = 1000;
const OBJECTIVE_LIMIT = 300;
const KEY_POINTS_LIMIT = 800;

/** One key point per line. Blank lines and stray bullet markers are dropped. */
export const splitKeyPoints = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean);

/**
 * Key points must reach the student view as an array. The model sometimes
 * returns a single block of text instead, which would otherwise be stored as a
 * string and crash the renderer, so coerce whatever comes back.
 */
export const normalizeKeyPoints = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const points = value.map((p) => String(p).trim()).filter(Boolean);
    return points.length > 0 ? points : undefined;
  }
  if (typeof value === 'string') {
    const points = splitKeyPoints(value);
    return points.length > 0 ? points : undefined;
  }
  return undefined;
};

interface MissionFormProps {
  initialMission: Partial<Mission>;
  currentUserId: string | null;
  isSaving: boolean;
  onSave: (
    mission: Partial<Mission>,
    thumbnailFile: File | null,
    thumbnailBase64: string | null,
    qrFile: File | null
  ) => void;
  onCancel: () => void;
}

const MissionForm: React.FC<MissionFormProps> = ({
  initialMission,
  currentUserId,
  isSaving,
  onSave,
  onCancel,
}) => {
  const [state, setState] = useState({
    currentMission: (() => {
      let patchedMission = { ...initialMission };
      if (patchedMission.modules && patchedMission.modules.some((m) => !m.id)) {
        patchedMission.modules = patchedMission.modules.map((m, idx) => ({
          ...m,
          id: m.id || `mod-${Date.now()}-${idx}`,
        }));
      }
      return patchedMission;
    })(),
    thumbnailFile: null as File | null,
    thumbnailBase64: null as string | null,
    qrFile: null as File | null,
    teacherEmail: '',
    assigningTeacher: false,
    aiPrompt: '',
    isGenerating: false,
    showAiModal: false,
  });

  const {
    currentMission,
    thumbnailFile,
    thumbnailBase64,
    qrFile,
    teacherEmail,
    assigningTeacher,
    aiPrompt,
    isGenerating,
    showAiModal,
  } = state;

  const isOwner = currentMission.ownerId === currentUserId || !currentMission.id;

  const handleGenerateThumbnail = async () => {
    if (!currentMission.title) return;
    setState((prev) => ({ ...prev, isGenerating: true }));
    try {
      const prompt = `A modern, sleek educational thumbnail for a mission titled "${currentMission.title}". 3D abstract style, vibrant colors.`;
      const base64 = await generateImage(prompt);
      if (base64) {
        setState((prev) => ({ ...prev, thumbnailBase64: base64, thumbnailFile: null }));
        toast.success('បានបង្កើតរូបភាព!');
      }
    } catch (e) {
      toast.error('បរាជ័យក្នុងការបង្កើតរូបភាព');
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleAiGenerateStructure = async () => {
    if (!aiPrompt.trim()) return;
    setState((prev) => ({ ...prev, isGenerating: true }));
    try {
      const structure = await generateMissionStructure(aiPrompt);
      if (structure) {
        // Ensure generated modules have unique IDs
        const newModules = (structure.modules || []).map((m: any, idx: number) => ({
          ...m,
          id: m.id || `mod-${Date.now()}-${idx}`,
          keyPoints: normalizeKeyPoints(m.keyPoints),
        }));

        setState((prev) => ({
          ...prev,
          currentMission: {
            ...prev.currentMission,
            title: structure.title || prev.currentMission.title,
            description: structure.description || prev.currentMission.description,
            level: structure.level || prev.currentMission.level,
            price: structure.price || prev.currentMission.price,
            squadSize: structure.squadSize || prev.currentMission.squadSize,
            modules: newModules,
          },
          showAiModal: false,
        }));
        toast.success('បេសកកម្មត្រូវបានរៀបចំរួចរាល់!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleAssignTeacher = async () => {
    if (!currentMission.id || !teacherEmail.trim()) {
      toast.error('សូមរក្សាទុកបេសកកម្មជាមុនសិន ឬបញ្ចូលអ៊ីមែល។');
      return;
    }
    setState((prev) => ({ ...prev, assigningTeacher: true }));
    try {
      const teacherProfile = await assignMissionMentor(currentMission.id, teacherEmail);
      setState((prev) => ({
        ...prev,
        currentMission: {
          ...prev.currentMission,
          mentorId: teacherProfile.id,
          mentor: teacherProfile.full_name,
        },
        teacherEmail: '',
      }));
      toast.success(`បានចាត់តាំង ${teacherProfile.full_name} ជាគ្រូ!`);
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការចាត់តាំង។');
    } finally {
      setState((prev) => ({ ...prev, assigningTeacher: false }));
    }
  };

  const addModule = () => {
    setState((prev) => ({
      ...prev,
      currentMission: {
        ...prev.currentMission,
        modules: [
          ...(prev.currentMission.modules || []),
          {
            id: `mod-${Date.now()}`,
            title: 'មេរៀនថ្មី',
            task: '',
            aiPersona: 'You are a helpful mentor.',
            initialPrompt: 'Hello! Ready to start?',
            theoryPrompt: '',
            objective: '',
            keyPoints: [],
          },
        ],
      },
    }));
  };

  const updateModule = (index: number, field: keyof MissionModule, value: string) => {
    // Use functional update to ensure we always have the latest state, avoiding closure staleness issues
    setState((prev) => {
      const updated = [...(prev.currentMission.modules || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, currentMission: { ...prev.currentMission, modules: updated } };
    });
  };

  const batchUpdateModule = (index: number, updates: Partial<MissionModule>) => {
    setState((prev) => {
      const updated = [...(prev.currentMission.modules || [])];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, currentMission: { ...prev.currentMission, modules: updated } };
    });
  };

  const removeModule = (index: number) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុបមេរៀននេះមែនទេ?')) return;
    setState((prev) => {
      const updated = [...(prev.currentMission.modules || [])];
      updated.splice(index, 1);
      return { ...prev, currentMission: { ...prev.currentMission, modules: updated } };
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-content-muted font-bold flex items-center hover:text-content text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> ត្រឡប់ក្រោយ
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, showAiModal: true }))}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center hover:bg-purple-200 transition-colors text-sm"
          >
            <Brain className="h-4 w-4 mr-2" /> AI បង្កើត
          </button>
          <button
            type="button"
            onClick={() => onSave(currentMission, thumbnailFile, thumbnailBase64, qrFile)}
            disabled={isSaving || (currentMission.description?.length || 0) > DESC_LIMIT}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center hover:scale-105 transition-transform text-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            រក្សាទុក
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Thumbnail */}
          <div className="bg-surface p-5 rounded-2xl shadow-sm border border-line">
            <h3 className="font-bold text-content mb-4">រូបភាព (Thumbnail)</h3>
            <div className="relative aspect-video bg-surface-3 rounded-xl overflow-hidden border border-line-strong group mb-3">
              {thumbnailBase64 || thumbnailFile || currentMission.thumbnail ? (
                <img
                  src={
                    thumbnailBase64
                      ? `data:image/png;base64,${thumbnailBase64}`
                      : thumbnailFile
                        ? URL.createObjectURL(thumbnailFile)
                        : currentMission.thumbnail
                  }
                  className="w-full h-full object-cover"
                  alt="Thumbnail"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-content-faint">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <label
                  htmlFor="thumbnail-upload"
                  className="bg-surface text-content px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-surface-3"
                >
                  Upload
                  <input
                    id="thumbnail-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      setState((prev) => ({
                        ...prev,
                        thumbnailFile: e.target.files?.[0] || null,
                        thumbnailBase64: null,
                      }));
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleGenerateThumbnail}
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center"
                >
                  <Zap className="h-3 w-3 mr-1" /> AI
                </button>
              </div>
            </div>
          </div>

          {/* Mentor */}
          <div className="bg-surface p-5 rounded-2xl shadow-sm border border-line">
            <h3 className="font-bold text-content mb-4 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
              គ្រូទទួលបន្ទុក
            </h3>
            {isOwner ? (
              <>
                {currentMission.mentorId ? (
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-bold uppercase mb-1">បានចាត់តាំង</p>
                      <p className="font-bold text-content text-sm">{currentMission.mentor}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          currentMission: {
                            ...prev.currentMission,
                            mentorId: undefined,
                            mentor: 'សុភាទន្សាយ',
                          },
                        }))
                      }
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="teacherEmail" className="sr-only">
                      អ៊ីមែលគ្រូ
                    </label>
                    <input
                      id="teacherEmail"
                      className="w-full p-2 border border-line-strong rounded-lg text-sm"
                      placeholder="អ៊ីមែលគ្រូ"
                      value={teacherEmail}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, teacherEmail: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAssignTeacher}
                      disabled={assigningTeacher || !teacherEmail.trim()}
                      className="w-full bg-gray-900 dark:bg-surface-3 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {assigningTeacher ? (
                        <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                      ) : (
                        'ចាត់តាំង'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-2 p-3 rounded-xl border border-line-strong">
                <p className="text-xs text-content-muted mb-1">គ្រូទទួលបន្ទុក</p>
                <p className="font-bold text-content text-sm">{currentMission.mentor || 'None'}</p>
                <p className="text-[10px] text-content-faint mt-2 italic flex items-center">
                  <X className="h-3 w-3 mr-1" /> Read Only
                </p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-surface p-5 rounded-2xl shadow-sm border border-line space-y-4">
            <h3 className="font-bold text-content mb-2 flex items-center">
              <Layout className="h-4 w-4 mr-2 text-primary" />
              ការកំណត់បេសកកម្ម
            </h3>
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-content-muted mb-1">
                ប្រភេទ (Category)
              </label>
              <select
                id="category"
                className="w-full p-2 border border-line-strong rounded-lg text-sm"
                value={currentMission.category}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    currentMission: {
                      ...prev.currentMission,
                      category: e.target.value as MissionCategory,
                    },
                  }))
                }
              >
                {Object.values(MissionCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="squadSize"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  ចំនួនសិស្សក្នុងក្រុម
                </label>
                <input
                  id="squadSize"
                  type="number"
                  className="w-full p-2 border border-line-strong rounded-lg text-sm"
                  value={currentMission.squadSize}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: {
                        ...prev.currentMission,
                        squadSize: parseInt(e.target.value),
                      },
                    }))
                  }
                  min={1}
                />
              </div>
              <div>
                <label
                  htmlFor="squadCreation"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  របៀបបង្កើតក្រុម
                </label>
                <select
                  id="squadCreation"
                  className="w-full p-2 border border-line-strong rounded-lg text-sm"
                  value={currentMission.squadCreation}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: {
                        ...prev.currentMission,
                        squadCreation: e.target.value as any,
                      },
                    }))
                  }
                >
                  <option value="auto">Auto (ស្វ័យប្រវត្តិ)</option>
                  <option value="manual">Manual (ដោយដៃ)</option>
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="enrollmentType"
                className="block text-xs font-bold text-content-muted mb-1"
              >
                ប្រភេទការចុះឈ្មោះ
              </label>
              <select
                id="enrollmentType"
                className="w-full p-2 border border-line-strong rounded-lg text-sm"
                value={currentMission.enrollmentType}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    currentMission: {
                      ...prev.currentMission,
                      enrollmentType: e.target.value as any,
                    },
                  }))
                }
              >
                <option value="open">Open (សាធារណៈ)</option>
                <option value="invite_only">Invite Only (ឯកជន)</option>
              </select>
            </div>
            {/* Enable Plagiarism Check Toggle */}
            <div className="pt-2 border-t border-line">
              <label
                htmlFor="plagiarismCheck"
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  id="plagiarismCheck"
                  type="checkbox"
                  className="form-checkbox text-primary rounded h-4 w-4"
                  checked={currentMission.enablePlagiarismCheck || false}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: {
                        ...prev.currentMission,
                        enablePlagiarismCheck: e.target.checked,
                      },
                    }))
                  }
                />
                <span className="text-xs font-bold text-content-soft">
                  Enable Plagiarism Check (AI)
                </span>
              </label>
              <p className="text-[10px] text-content-faint mt-1 pl-6">
                If enabled, student submissions will be checked for similarity against others.
              </p>
            </div>
          </div>

          {/* Payment & Community */}
          <div className="bg-surface p-5 rounded-2xl shadow-sm border border-line">
            <h3 className="font-bold text-content mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              ការទូទាត់ & សហគមន៍
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="khqrUpload"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  KHQR (សម្រាប់បង់ប្រាក់)
                </label>
                {currentMission.paymentQrUrl ? (
                  <div className="relative group w-24 h-24 mb-2">
                    <img
                      src={currentMission.paymentQrUrl}
                      className="w-full h-full object-cover rounded-lg border border-line-strong"
                      alt="QR"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          currentMission: { ...prev.currentMission, paymentQrUrl: undefined },
                        }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <input
                    id="khqrUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, qrFile: e.target.files?.[0] || null }))
                    }
                    className="block w-full text-xs text-content-muted file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                )}
              </div>
              <div>
                <label
                  htmlFor="paymentInstruction"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  ណែនាំបង់ប្រាក់
                </label>
                <input
                  id="paymentInstruction"
                  className="w-full p-2 border border-line-strong rounded-lg text-sm"
                  value={currentMission.paymentInstruction || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: {
                        ...prev.currentMission,
                        paymentInstruction: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ex: ABA 001 234 567"
                />
              </div>
              <div>
                <label
                  htmlFor="telegramLink"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  Telegram Group Link
                </label>
                <input
                  id="telegramLink"
                  className="w-full p-2 border border-line-strong rounded-lg text-sm text-blue-600"
                  value={currentMission.telegramGroupLink || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: { ...prev.currentMission, telegramGroupLink: e.target.value },
                    }))
                  }
                  placeholder="https://t.me/+AbCdEfGh"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-line space-y-4">
            <h3 className="font-bold text-content mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              ព័ត៌មានលម្អិត
            </h3>
            <div>
              <label
                htmlFor="missionTitle"
                className="block text-xs font-bold text-content-muted mb-1"
              >
                ចំណងជើងបេសកកម្ម
              </label>
              <input
                id="missionTitle"
                className="w-full p-3 border border-line-strong rounded-xl text-base font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                value={currentMission.title}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    currentMission: { ...prev.currentMission, title: e.target.value },
                  }))
                }
                placeholder="Enter mission title..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="missionLevel"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  កម្រិតជំនាញ
                </label>
                <select
                  id="missionLevel"
                  className="w-full p-3 border border-line-strong rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={currentMission.level}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: { ...prev.currentMission, level: e.target.value as any },
                    }))
                  }
                >
                  <option value="Beginner">Beginner (ដំបូង)</option>
                  <option value="Intermediate">Intermediate (មធ្យម)</option>
                  <option value="Advanced">Advanced (ខ្ពស់)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="missionPrice"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  តម្លៃ (រៀល)
                </label>
                <input
                  id="missionPrice"
                  type="number"
                  className="w-full p-3 border border-line-strong rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  value={currentMission.price}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      currentMission: { ...prev.currentMission, price: parseFloat(e.target.value) },
                    }))
                  }
                  min={0}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="missionDescription"
                className="block text-xs font-bold text-content-muted mb-1"
              >
                បរិយាយ (Description)
              </label>
              <textarea
                id="missionDescription"
                className="w-full p-3 border border-line-strong rounded-xl text-sm h-32 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                value={currentMission.description}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    currentMission: { ...prev.currentMission, description: e.target.value },
                  }))
                }
                placeholder="Describe the mission goal and outcome..."
              />
              <CharCounter current={currentMission.description?.length || 0} limit={DESC_LIMIT} />
            </div>
          </div>

          {/* Modules */}
          <div className="bg-surface-2 p-6 rounded-2xl border border-line-strong">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-content">កម្មវិធីសិក្សា (Modules)</h3>
              <button
                type="button"
                onClick={addModule}
                className="bg-surface text-content-soft px-3 py-1.5 rounded-lg border border-line-strong text-xs font-bold hover:bg-surface-3 flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Module
              </button>
            </div>

            <div className="space-y-4">
              {currentMission.modules?.map((mod, idx) => (
                <ModuleEditor
                  key={mod.id}
                  module={mod}
                  index={idx}
                  onChange={updateModule}
                  onBatchUpdate={batchUpdateModule}
                  onDelete={removeModule}
                />
              ))}
              {currentMission.modules?.length === 0 && (
                <div className="text-center py-10 text-content-faint bg-surface rounded-xl border border-dashed border-line-strong">
                  <p className="text-sm">No modules added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" /> AI Mission Architect
            </h3>
            <p className="text-sm text-content-muted mb-4">
              Describe the mission topic, and AI will generate the structure, modules, and thumbnail
              for you.
            </p>
            <textarea
              className="w-full p-3 border border-line-strong rounded-xl text-sm h-24 mb-4 focus:ring-2 focus:ring-purple-200 outline-none"
              placeholder="e.g. A comprehensive guide to Python for Data Science..."
              value={aiPrompt}
              onChange={(e) => setState((prev) => ({ ...prev, aiPrompt: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, showAiModal: false }))}
                className="px-4 py-2 text-content-muted font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiGenerateStructure}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm shadow-lg disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Generate Mission (${AI_COSTS.STRUCTURE} Pts)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleEditor: React.FC<{
  module: MissionModule;
  index: number;
  onChange: (index: number, field: keyof MissionModule, value: string) => void;
  onBatchUpdate: (index: number, updates: Partial<MissionModule>) => void;
  onDelete: (index: number) => void;
}> = ({ module, index, onChange, onBatchUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Key points are stored as an array but edited as one line of text per point.
  // The textarea keeps its own draft so that pressing Enter on a fresh line is
  // not swallowed by the trim-and-filter round trip. The ref lets us tell our
  // own edits apart from an external change such as Magic Fill.
  const joinedKeyPoints = (module.keyPoints || []).join('\n');
  const [keyPointsText, setKeyPointsText] = useState(joinedKeyPoints);
  const lastSyncedKeyPoints = useRef(joinedKeyPoints);

  useEffect(() => {
    if (joinedKeyPoints !== lastSyncedKeyPoints.current) {
      lastSyncedKeyPoints.current = joinedKeyPoints;
      setKeyPointsText(joinedKeyPoints);
    }
  }, [joinedKeyPoints]);

  const handleKeyPointsChange = (text: string) => {
    setKeyPointsText(text);
    const points = splitKeyPoints(text);
    lastSyncedKeyPoints.current = points.join('\n');
    onBatchUpdate(index, { keyPoints: points });
  };

  const handleAutoGenerate = async () => {
    if (!module.title) {
      toast.error('Please provide a title first.');
      return;
    }
    setGenerating(true);
    try {
      const prompt = `
                Generate specific content for an educational module titled "${module.title}".
                Return a JSON object with:
                - objective: One or two sentences, written TO the student, describing what they
                  will be able to do after this lesson. Student facing prose, not a prompt.
                - keyPoints: An array of 3 to 5 short strings covering the main ideas, useful
                  tricks, and common mistakes for this lesson. Student facing prose.
                - task: A specific, actionable assignment the student has to hand in.
                - aiPersona: A system instruction for an AI mentor.
                - initialPrompt: The first thing the AI says to the student.
                - theoryPrompt: A prompt for the AI to explain the theory.

                MATH FORMATTING: the app renders LaTeX through KaTeX. Write every
                formula, equation, fraction, exponent, root, limit, integral, or
                summation as LaTeX. Use $...$ inline and $$...$$ for a formula on
                its own line. For example write $\\lim_{x \\to 3} \\dfrac{x^2-9}{x-3}$,
                never "lim(x->3) (x^2-9)/(x-3)". This applies to keyPoints and task
                as well as the prose fields.
            `;

      const response = await chatWithAI(
        prompt,
        [],
        'You are an expert curriculum designer. Return valid JSON only.'
      );
      const cleanText = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const data = JSON.parse(cleanText);

      // Use batch update to prevent closure staleness issues with individual updates
      const updates: Partial<MissionModule> = {};
      if (data.task) updates.task = data.task;
      if (data.aiPersona) updates.aiPersona = data.aiPersona;
      if (data.initialPrompt) updates.initialPrompt = data.initialPrompt;
      if (data.theoryPrompt) updates.theoryPrompt = data.theoryPrompt;
      if (data.objective) updates.objective = data.objective;
      const generatedKeyPoints = normalizeKeyPoints(data.keyPoints);
      if (generatedKeyPoints) updates.keyPoints = generatedKeyPoints;

      if (Object.keys(updates).length > 0) {
        onBatchUpdate(index, updates);
        toast.success('Content generated!');
      } else {
        toast.error('AI returned empty data.');
      }
    } catch (e) {
      toast.error('Generation failed. Please try again.');
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulationUrlChange = (url: string) => {
    let finalUrl = url;
    const currentType = module.simulationConfig?.type || 'phet';

    // Auto-fix Wokwi URLs
    if (currentType === 'wokwi' && url.includes('wokwi.com/projects/')) {
      // Remove /embedded suffix if present and ensure clean base
      let cleanUrl = url.replace(/\/embedded\/?$/, '').replace(/\/$/, '');

      // Append ?embed=1 if not present
      if (!cleanUrl.includes('embed=1')) {
        cleanUrl += cleanUrl.includes('?') ? '&embed=1' : '?embed=1';
      }
      finalUrl = cleanUrl;
    }

    if (!finalUrl) {
      const { simulationConfig, ...rest } = module;
      onBatchUpdate(index, { ...rest, simulationConfig: undefined });
    } else {
      onBatchUpdate(index, {
        simulationConfig: {
          type: currentType,
          url: finalUrl,
          instructions: module.simulationConfig?.instructions || 'Follow the instructions.',
        },
      });
    }
  };

  const handleSimulationTypeChange = (type: 'phet' | 'wokwi' | 'other') => {
    if (module.simulationConfig) {
      onBatchUpdate(index, {
        simulationConfig: {
          ...module.simulationConfig,
          type: type,
        },
      });
    } else {
      onBatchUpdate(index, {
        simulationConfig: {
          type: type,
          url: '',
          instructions: 'Follow the instructions.',
        },
      });
    }
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-line-strong shadow-sm mb-4 transition-all">
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1 rounded-full ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-surface-3 text-content-faint'}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className="font-bold text-content-muted text-xs uppercase block">
              Module {index + 1}
            </span>
            <span className="font-bold text-content text-sm">
              {module.title || 'Untitled Module'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Magic Wand for generating content */}
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAutoGenerate();
              }}
              disabled={generating}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
              title="Auto Generate Content"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Magic Fill</span>
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="text-content-faint hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Module"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-line animate-fade-in">
          <div>
            <label
              htmlFor={`mod-title-${index}`}
              className="block text-xs font-bold text-content-faint mb-1 uppercase"
            >
              Title
            </label>
            <input
              id={`mod-title-${index}`}
              className="w-full p-3 border border-line-strong rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Module Title"
              value={module.title}
              onChange={(e) => onChange(index, 'title', e.target.value)}
            />
            <CharCounter current={module.title.length} limit={MODULE_TITLE_LIMIT} />
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-4">
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
              Lesson brief (shown to students on the Summary tab)
            </p>
            <div>
              <label
                htmlFor={`mod-objective-${index}`}
                className="block text-xs font-bold text-content-faint mb-1 uppercase"
              >
                Objective
              </label>
              <textarea
                id={`mod-objective-${index}`}
                className="w-full p-3 border border-line-strong rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[80px]"
                placeholder="What the student will be able to do after this lesson"
                value={module.objective || ''}
                onChange={(e) => onChange(index, 'objective', e.target.value)}
              />
              <CharCounter current={module.objective?.length || 0} limit={OBJECTIVE_LIMIT} />
            </div>
            <div>
              <label
                htmlFor={`mod-keypoints-${index}`}
                className="block text-xs font-bold text-content-faint mb-1 uppercase"
              >
                Key points, one per line
              </label>
              <textarea
                id={`mod-keypoints-${index}`}
                className="w-full p-3 border border-line-strong rounded-lg text-sm bg-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[90px]"
                placeholder={
                  'The main idea to remember\nA trick that makes it easier\nA common mistake to avoid'
                }
                value={keyPointsText}
                onChange={(e) => handleKeyPointsChange(e.target.value)}
              />
              <CharCounter current={keyPointsText.length} limit={KEY_POINTS_LIMIT} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor={`mod-task-${index}`}
                className="block text-xs font-bold text-content-faint uppercase"
              >
                Task
              </label>
              <span className="text-[10px] text-content-faint">
                Shown on the Practice tab, above the workspace
              </span>
            </div>
            <textarea
              id={`mod-task-${index}`}
              className="w-full p-3 border border-line-strong rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[100px]"
              placeholder="The assignment the student has to hand in"
              value={module.task}
              onChange={(e) => onChange(index, 'task', e.target.value)}
            />
            <CharCounter current={module.task.length} limit={TASK_LIMIT} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`mod-persona-${index}`}
                className="block text-xs font-bold text-content-faint mb-1 uppercase"
              >
                AI Persona
              </label>
              <textarea
                id={`mod-persona-${index}`}
                className="w-full p-3 border border-line-strong rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[120px]"
                placeholder="AI Persona"
                value={module.aiPersona}
                onChange={(e) => onChange(index, 'aiPersona', e.target.value)}
              />
              <CharCounter current={module.aiPersona.length} limit={PERSONA_LIMIT} />
            </div>
            <div>
              <label
                htmlFor={`mod-prompt-${index}`}
                className="block text-xs font-bold text-content-faint mb-1 uppercase"
              >
                Initial Greeting
              </label>
              <textarea
                id={`mod-prompt-${index}`}
                className="w-full p-3 border border-line-strong rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[120px]"
                placeholder="Initial AI Greeting"
                value={module.initialPrompt}
                onChange={(e) => onChange(index, 'initialPrompt', e.target.value)}
              />
              <CharCounter current={module.initialPrompt.length} limit={PROMPT_LIMIT} />
            </div>
          </div>
          <div>
            <label
              htmlFor={`mod-theory-${index}`}
              className="block text-xs font-bold text-content-faint mb-1 uppercase"
            >
              Theory Prompt
            </label>
            <textarea
              id={`mod-theory-${index}`}
              className="w-full p-3 border border-line-strong rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[100px]"
              placeholder="Theory Prompt"
              value={module.theoryPrompt || ''}
              onChange={(e) => onChange(index, 'theoryPrompt', e.target.value)}
            />
            <CharCounter current={module.theoryPrompt?.length || 0} limit={THEORY_LIMIT} />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <label
              htmlFor={`mod-sim-${index}`}
              className="block text-xs font-bold text-content-faint mb-1 uppercase flex items-center gap-1"
            >
              <Experiment className="h-3 w-3" /> Simulation Configuration
            </label>
            <div className="flex gap-2">
              <select
                id={`mod-sim-${index}`}
                className="w-1/3 p-3 border border-line-strong rounded-lg text-xs font-bold bg-surface-2 focus:ring-2 focus:ring-primary/20 outline-none"
                value={module.simulationConfig?.type || 'phet'}
                onChange={(e) => handleSimulationTypeChange(e.target.value as any)}
              >
                <option value="phet">PhET (Science)</option>
                <option value="wokwi">Wokwi (IoT/Arduino)</option>
                <option value="other">Other (Embed)</option>
              </select>
              <label htmlFor={`mod-sim-url-${index}`} className="sr-only">
                Simulation URL
              </label>
              <input
                id={`mod-sim-url-${index}`}
                className="flex-1 p-3 border border-line-strong rounded-lg text-xs font-mono text-blue-600 focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder={
                  module.simulationConfig?.type === 'wokwi'
                    ? 'https://wokwi.com/projects/...'
                    : 'https://phet.colorado.edu/...'
                }
                value={module.simulationConfig?.url || ''}
                onChange={(e) => handleSimulationUrlChange(e.target.value)}
              />
            </div>
            {module.simulationConfig?.type === 'wokwi' && (
              <p className="text-[10px] text-content-faint mt-1 italic">
                Paste the Wokwi Project URL (e.g. https://wokwi.com/projects/305568836183138882). It
                will auto-convert to embed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionForm;
