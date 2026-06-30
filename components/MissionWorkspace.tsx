import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle,
  Bot,
  Send,
  Users2,
  FileText,
  Brain,
  Target,
  ChevronRight,
  Lock,
  PlayCircle,
  AlertCircle,
  Loader2,
  Award,
  MessageCircle,
  Edit,
  Save,
  BookOpen,
  Zap,
  Globe,
  Copy,
  ShieldCheck,
  Home,
  Camera,
  Image as ImageIcon,
  Terminal,
  Layout,
  X,
  Experiment,
} from './Icons';
import { Mission, ChatMessage, MissionModuleStatus, SquadMember } from '../types';
import {
  chatWithAI,
  evaluateSubmission,
  evaluateImageSubmission,
  AI_COSTS,
} from '../services/geminiService';
import {
  updateMissionProgress,
  updateMissionSquadNote,
  getSquadMembers,
  checkPlagiarism,
  saveSubmissionVector,
  updateEnrollmentStatus,
} from '../services/missionProgressService';
import { uploadFile, deleteFileFromUrl } from '../services/storageService';
import MarkdownText from './MarkdownText';
import CodeEditor from './CodeEditor';
import CharCounter from './CharCounter';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const SUBMISSION_LIMIT = 3000;
const SQUAD_NOTE_LIMIT = 10000;

interface MissionWorkspaceProps {
  mission: Mission;
  enrollmentId?: string;
  initialProgress?: Record<string, MissionModuleStatus>;
  initialProgressDetails?: Record<
    string,
    { status: MissionModuleStatus; submission: string; feedback: string }
  >;
  initialSquadNote?: string;
  squadId?: number;
}

const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const MissionWorkspace: React.FC<MissionWorkspaceProps> = ({
  mission,
  enrollmentId,
  initialProgress,
  initialProgressDetails,
  initialSquadNote,
  squadId,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState(() => {
    let initialActiveModuleId = mission.modules[0].id;
    if (initialProgress) {
      const firstActive = mission.modules.find((m) => {
        const status = initialProgress[m.id];
        return status === 'active' || !status;
      });
      initialActiveModuleId = firstActive ? firstActive.id : mission.modules[0].id;
    }

    let initialModuleStatus: Record<string, MissionModuleStatus> = {};
    if (initialProgress && Object.keys(initialProgress).length > 0) {
      initialModuleStatus = initialProgress;
    } else {
      mission.modules.forEach((m, idx) => {
        initialModuleStatus[m.id] = idx === 0 ? 'active' : 'locked';
      });
    }

    return {
      activeModuleId: initialActiveModuleId,
      moduleStatus: initialModuleStatus,
      activeTab: 'brief' as 'brief' | 'learn' | 'studio' | 'team' | 'simulation',
      chatInput: '',
      messages: {} as Record<string, ChatMessage[]>,
      submissionData: {} as Record<string, string>,
      submissionType: 'text' as 'text' | 'code',
      codeLanguage: 'javascript' as 'javascript' | 'python' | 'html',
      submissionImage: null as string | null,
      evaluationData: {} as Record<string, { passed: boolean; score?: number; feedback: string } | null>,
      generatedLessons: {} as Record<string, string>,
      loadingLesson: false,
      lessonLanguage: 'km' as 'km' | 'en',
      squadNote: initialSquadNote || '',
      isSaving: false,
      lastSaved: null as Date | null,
      squadMembers: [] as SquadMember[],
      isEvaluating: false,
      isChatLoading: false,
      showCompletionModal: false,
    };
  });

  const {
    activeModuleId, moduleStatus, activeTab, chatInput, messages,
    submissionData, submissionType, codeLanguage, submissionImage,
    evaluationData, generatedLessons, loadingLesson, lessonLanguage,
    squadNote, isSaving, lastSaved, squadMembers, isEvaluating,
    isChatLoading, showCompletionModal
  } = state;

  const setActiveModuleId = React.useCallback((v: any) => setState(s => ({ ...s, activeModuleId: v })), []);
  const setModuleStatus = React.useCallback((v: any) => setState(s => ({ ...s, moduleStatus: typeof v === 'function' ? v(s.moduleStatus) : v })), []);
  const setActiveTab = React.useCallback((v: any) => setState(s => ({ ...s, activeTab: v })), []);
  const setChatInput = React.useCallback((v: any) => setState(s => ({ ...s, chatInput: v })), []);
  const setMessages = React.useCallback((v: any) => setState(s => ({ ...s, messages: typeof v === 'function' ? v(s.messages) : v })), []);
  const setSubmissionData = React.useCallback((v: any) => setState(s => ({ ...s, submissionData: typeof v === 'function' ? v(s.submissionData) : v })), []);
  const setSubmissionType = React.useCallback((v: any) => setState(s => ({ ...s, submissionType: v })), []);
  const setCodeLanguage = React.useCallback((v: any) => setState(s => ({ ...s, codeLanguage: v })), []);
  const setSubmissionImage = React.useCallback((v: any) => setState(s => ({ ...s, submissionImage: v })), []);
  const setEvaluationData = React.useCallback((v: any) => setState(s => ({ ...s, evaluationData: typeof v === 'function' ? v(s.evaluationData) : v })), []);
  const setGeneratedLessons = React.useCallback((v: any) => setState(s => ({ ...s, generatedLessons: typeof v === 'function' ? v(s.generatedLessons) : v })), []);
  const setLoadingLesson = React.useCallback((v: any) => setState(s => ({ ...s, loadingLesson: v })), []);
  const setLessonLanguage = React.useCallback((v: any) => setState(s => ({ ...s, lessonLanguage: v })), []);
  const setSquadNote = React.useCallback((v: any) => setState(s => ({ ...s, squadNote: v })), []);
  const setIsSavingNote = React.useCallback((v: any) => setState(s => ({ ...s, isSaving: v })), []);
  const setLastSaved = React.useCallback((v: any) => setState(s => ({ ...s, lastSaved: v })), []);
  const setSquadMembers = React.useCallback((v: any) => setState(s => ({ ...s, squadMembers: v })), []);
  const setIsEvaluating = React.useCallback((v: any) => setState(s => ({ ...s, isEvaluating: v })), []);
  const setIsChatLoading = React.useCallback((v: any) => setState(s => ({ ...s, isChatLoading: v })), []);
  const setShowCompletionModal = React.useCallback((v: any) => setState(s => ({ ...s, showCompletionModal: v })), []);

  const noteSaveTimeout = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const simFileInputRef = useRef<HTMLInputElement>(null);

  const prevEnrollmentIdRef = useRef(enrollmentId);
  const prevInitialSquadNoteRef = useRef(initialSquadNote);

  const activeModule = mission.modules.find((m) => m.id === activeModuleId) || mission.modules[0];
  const isLocked = moduleStatus[activeModuleId] === 'locked';
  const currentSubmissionText = submissionData[activeModuleId] || '';
  const currentEvaluation = evaluationData[activeModuleId];

  // Auto-switch to Simulation tab if module has sim and is active, but only on first load of that module
  useEffect(() => {
    if (
      activeModule.simulationConfig &&
      activeTab !== 'simulation' &&
      !initialProgressDetails?.[activeModuleId]
    ) {
      // Optional: Auto-switch could be annoying, maybe just show a notification or indicator
      // For now, let's keep tabs stable unless explicitly clicked
    }
  }, [activeModuleId, activeModule, activeTab, initialProgressDetails]);

  const getTheoryPromptText = () => {
    return (
      activeModule.theoryPrompt ||
      `Explain the core concepts required to complete this task: "${activeModule.task}". Provide examples.`
    );
  };

  const prevInitialProgressDetailsRef = React.useRef(initialProgressDetails);

  if (initialProgressDetails !== prevInitialProgressDetailsRef.current) {
    prevInitialProgressDetailsRef.current = initialProgressDetails;
    if (initialProgressDetails) {
      const texts: Record<string, string> = {};
      const evals: Record<string, any> = {};

      Object.keys(initialProgressDetails).forEach((modId) => {
        const detail = initialProgressDetails[modId];
        if (detail.submission) texts[modId] = detail.submission;
        if (detail.feedback) {
          const scoreMatch = detail.feedback.match(/Score:\s*(\d+)/i);
          const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined;

          evals[modId] = {
            passed: detail.status === 'completed',
            score: score,
            feedback: detail.feedback,
          };
        }
      });
      setSubmissionData((prev) => ({ ...prev, ...texts }));
      setEvaluationData((prev) => ({ ...prev, ...evals }));
    }
  }

  if (enrollmentId !== prevEnrollmentIdRef.current) {
    prevEnrollmentIdRef.current = enrollmentId;
    setSquadNote(initialSquadNote || '');
  } else if (initialSquadNote && !squadNote && !isSaving && initialSquadNote !== prevInitialSquadNoteRef.current) {
    prevInitialSquadNoteRef.current = initialSquadNote;
    setSquadNote(initialSquadNote);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeModuleId]);

  useEffect(() => {
    if ((!messages[activeModuleId] || messages[activeModuleId].length === 0) && !isLocked) {
      setMessages((prev) => ({
        ...prev,
        [activeModuleId]: [
          {
            id: 'init-' + activeModuleId,
            role: 'model',
            text: activeModule.initialPrompt || 'សួស្តី! តោះចាប់ផ្តើមបេសកកម្មនេះទាំងអស់គ្នា។',
            timestamp: new Date(),
          },
        ],
      }));
    }
  }, [activeModuleId, isLocked, activeModule, messages, setMessages]);

  useEffect(() => {
    if (activeTab === 'team' && squadId && squadMembers.length === 0) {
      getSquadMembers(mission.id, squadId).then(setSquadMembers);
    }
  }, [activeTab, squadId, mission.id, squadMembers.length, setSquadMembers]);

  const handleModuleClick = (id: string) => {
    if (moduleStatus[id] !== 'locked') {
      setActiveModuleId(id);
      setActiveTab('brief');
      setSubmissionImage(null); // Reset image when changing module
    } else {
      toast.error('ត្រូវបញ្ចប់មេរៀនមុនសិន ទើបអាចបើកមេរៀននេះបាន!');
    }
  };

  const handleTextChange = (text: string) => {
    setSubmissionData((prev) => ({ ...prev, [activeModuleId]: text }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubmissionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSquadNote = async (text: string) => {
    if (!enrollmentId) return;
    try {
      await updateMissionSquadNote(enrollmentId, text);
      setLastSaved(new Date());
    } catch (e) {
      console.error('Failed to save note', e);
      toast.error('បរាជ័យក្នុងការរក្សាទុក (Sync Failed)');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSquadNoteChange = (text: string) => {
    setSquadNote(text);
    if (!enrollmentId || text.length > SQUAD_NOTE_LIMIT) return;

    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current);

    setIsSavingNote(true);
    noteSaveTimeout.current = setTimeout(() => saveSquadNote(text), 1000);
  };

  const handleSquadNoteBlur = () => {
    if (noteSaveTimeout.current) clearTimeout(noteSaveTimeout.current);
    if (enrollmentId) {
      setIsSavingNote(true);
      saveSquadNote(squadNote);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeModuleId]: [...(prev[activeModuleId] || []), userMsg],
    }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const history = (messages[activeModuleId] || []).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const responseText = await chatWithAI(userMsg.text, history, activeModule.aiPersona);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [activeModuleId]: [...(prev[activeModuleId] || []), botMsg],
      }));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (
      (!currentSubmissionText.trim() && !submissionImage) ||
      currentSubmissionText.length > SUBMISSION_LIMIT
    ) {
      if (currentSubmissionText.length > SUBMISSION_LIMIT) toast.error('ចម្លើយរបស់អ្នកវែងពេក!');
      else toast.error('សូមសរសេរចម្លើយ ឬបញ្ចូលរូបភាព!');
      return;
    }
    setIsEvaluating(true);

    try {
      // 1. Plagiarism Check (Only if enabled and text exists)
      if (enrollmentId && mission.enablePlagiarismCheck && currentSubmissionText.length > 50) {
        const similarSubmission = await checkPlagiarism(
          mission.id,
          activeModuleId,
          enrollmentId,
          currentSubmissionText
        );
        if (similarSubmission && similarSubmission.similarity > 0.85) {
          toast.error(
            `⚠️ រកឃើញភាពដូចគ្នាខ្លាំងទៅនឹងចម្លើយដែលមានស្រាប់ (${(similarSubmission.similarity * 100).toFixed(0)}%)។ សូមសរសេរដោយខ្លួនឯង។`
          );
          setIsEvaluating(false);
          return;
        }
      }

      // 2. Evaluation
      let result;
      if (submissionImage) {
        const rawBase64 = submissionImage.split(',')[1];
        result = await evaluateImageSubmission(
          activeModule.task,
          activeModule.aiPersona,
          rawBase64,
          currentSubmissionText
        );
      } else {
        result = await evaluateSubmission(
          activeModule.task,
          activeModule.aiPersona,
          currentSubmissionText
        );
      }

      setEvaluationData((prev) => ({ ...prev, [activeModuleId]: result }));

      const persistentFeedback = `**Score: ${result.score}/100**\n\n${result.feedback}`;

      if (result.passed) {
        const newStatusMap: Record<string, MissionModuleStatus> = {
          ...moduleStatus,
          [activeModuleId]: 'completed',
        };
        setModuleStatus(newStatusMap);

        if (enrollmentId) {
          // Handle Image Storage
          let finalSubmissionText = currentSubmissionText;

          if (submissionImage) {
            const oldSubmission = submissionData[activeModuleId];
            if (oldSubmission) {
              const urlMatch = oldSubmission.match(
                /https:\/\/[^\s]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s]+/
              );
              if (urlMatch) await deleteFileFromUrl(urlMatch[0]);
            }

            const blob = base64ToBlob(submissionImage);
            const uploadedUrl = await uploadFile(blob, 'missions');

            if (uploadedUrl) {
              finalSubmissionText = `[Image] ${uploadedUrl}\n\n${currentSubmissionText}`;
            } else {
              finalSubmissionText = `[Image Upload Failed] ${currentSubmissionText}`;
            }
          } else if (submissionType === 'code') {
            finalSubmissionText = `\`\`\`${codeLanguage}\n${currentSubmissionText}\n\`\`\``;
          }

          await updateMissionProgress(
            enrollmentId,
            activeModuleId,
            'completed',
            finalSubmissionText,
            persistentFeedback
          );

          if (mission.enablePlagiarismCheck && currentSubmissionText) {
            await saveSubmissionVector(
              mission.id,
              enrollmentId,
              activeModuleId,
              currentSubmissionText
            );
          }

          const allCompleted = mission.modules.every((m) =>
            m.id === activeModuleId ? true : newStatusMap[m.id] === 'completed'
          );

          if (allCompleted) {
            await updateEnrollmentStatus(enrollmentId, 'Completed');
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#10B981', '#3B82F6'],
            });
            setTimeout(() => setShowCompletionModal(true), 1000);
          } else {
            toast.success(`ឆ្លងកាត់! ពិន្ទុ៖ ${result.score}/100`, { icon: '🎉' });
          }
        } else {
          toast.success(`ឆ្លងកាត់! ពិន្ទុ៖ ${result.score}/100`, { icon: '🎉' });
        }

        const currentIndex = mission.modules.findIndex((m) => m.id === activeModuleId);
        if (currentIndex < mission.modules.length - 1) {
          const nextId = mission.modules[currentIndex + 1].id;
          setModuleStatus((prev) => ({ ...prev, [nextId]: 'active' }));
          if (enrollmentId) await updateMissionProgress(enrollmentId, nextId, 'active');
        }
      } else {
        toast.error(`មិនទាន់ជាប់ (Score: ${result.score})។ សូមកែតម្រូវហើយដាក់ស្នើម្តងទៀត!`);
        if (enrollmentId) {
          await updateMissionProgress(
            enrollmentId,
            activeModuleId,
            'active',
            currentSubmissionText,
            persistentFeedback
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartLesson = async () => {
    setLoadingLesson(true);
    const basePrompt = getTheoryPromptText();
    const langInstruction =
      lessonLanguage === 'km'
        ? 'OUTPUT IN KHMER LANGUAGE ONLY (ភាសាខ្មែរ). Explain clearly and concisely. Use LaTeX $$..$$ for formulas.'
        : 'OUTPUT IN ENGLISH LANGUAGE ONLY. Explain clearly and concisely. Use LaTeX $$..$$ for formulas.';

    const prompt = `${basePrompt}\n\nIMPORTANT: ${langInstruction}`;

    try {
      const lesson = await chatWithAI(prompt, [], 'You are an expert professor.');
      setGeneratedLessons((prev) => ({ ...prev, [activeModuleId]: lesson }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingLesson(false);
    }
  };

  const isFailedAttempt = currentEvaluation && !currentEvaluation.passed;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 overflow-hidden relative">
      {/* COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl animate-bounce-in">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">អបអរសាទរ!</h2>
            <p className="text-gray-500 mb-6">
              អ្នកបានបញ្ចប់បេសកកម្ម <strong>"{mission.title}"</strong> ដោយជោគជ័យ។
              សមិទ្ធិផលនេះត្រូវបានកត់ត្រាក្នុងប្រវត្តិរូបរបស់អ្នក។
            </p>
            <div className="space-y-3">
              <button type="button"
                onClick={() => navigate('/account')}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-transform active:scale-95 flex items-center justify-center"
              >
                <Award className="h-5 w-5 mr-2" /> មើលវិញ្ញាបនបត្រ (View Profile)
              </button>
              <button type="button"
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Home className="h-5 w-5 mr-2" /> ទៅទំព័រដើម
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shadow-sm z-20">
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">{mission.title}</h1>
          <p className="text-xs text-gray-500">
            ការគ្រប់គ្រងបេសកកម្ម •{' '}
            {mission.modules.filter((m) => moduleStatus[m.id] === 'completed').length} /{' '}
            {mission.modules.length} បានបញ្ចប់
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mission.telegramGroupLink && (
            <a
              href={mission.telegramGroupLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-xs font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send className="h-3 w-3 mr-1.5 rotate-45 transform -translate-y-[1px]" /> Telegram
            </a>
          )}
          {squadId && (
            <div className="flex items-center text-xs font-bold text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded-lg">ក្រុមទី #{squadId}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-20 md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col overflow-y-auto hidden-scrollbar">
          <div className="p-4 pb-20 md:pb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 hidden md:block">
              ផែនទីបេសកកម្ម
            </h3>
            <div className="space-y-2 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 z-0 hidden md:block"></div>
              {mission.modules.map((mod, idx) => {
                const status = moduleStatus[mod.id] || (idx === 0 ? 'active' : 'locked');
                const isActive = activeModuleId === mod.id;

                let circleClass = 'bg-gray-100 border-gray-200 text-gray-400';
                let icon = <Lock className="h-3.5 w-3.5" />;

                if (status === 'completed') {
                  circleClass =
                    'bg-green-500 border-green-500 text-white shadow-sm shadow-green-200';
                  icon = <CheckCircle className="h-4 w-4" />;
                } else if (status === 'active') {
                  circleClass =
                    'bg-white border-primary text-primary shadow-sm ring-2 ring-primary/10';
                  icon = <span className="text-xs font-bold">{idx + 1}</span>;
                }

                return (
                  <button type="button"
                    key={mod.id}
                    onClick={() => handleModuleClick(mod.id)}
                    className={`relative z-10 w-full flex items-center text-left p-2 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 border-2 transition-colors duration-200 ${circleClass}`}
                    >
                      {icon}
                    </div>
                    <div className="hidden md:block">
                      <p
                        className={`text-sm font-bold transition-colors line-clamp-1 ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}
                      >
                        {mod.title}
                      </p>
                      <p className="text-[10px] text-gray-400 capitalize">
                        {status === 'completed'
                          ? 'បានបញ្ចប់'
                          : status === 'active'
                            ? 'កំពុងដំណើរការ'
                            : 'ចាក់សោ'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
          <div className="flex bg-white border-b border-gray-200 px-4 overflow-x-auto scrollbar-hide">
            <button type="button"
              onClick={() => setActiveTab('brief')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'brief' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
            >
              <Target className="h-4 w-4 mr-2" /> សង្ខេប
            </button>

            {/* Add Simulation Tab conditionally */}
            {activeModule.simulationConfig && (
              <button type="button"
                onClick={() => setActiveTab('simulation')}
                className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'simulation' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
              >
                <Experiment className="h-4 w-4 mr-2" />{' '}
                {activeModule.simulationConfig.type === 'wokwi'
                  ? 'IoT Lab (Wokwi)'
                  : 'ពិសោធន៍ (Sim)'}
              </button>
            )}

            <button type="button"
              onClick={() => setActiveTab('learn')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'learn' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
            >
              <BookOpen className="h-4 w-4 mr-2" /> រៀន
            </button>
            <button type="button"
              onClick={() => setActiveTab('studio')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'studio' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
            >
              <Edit className="h-4 w-4 mr-2" /> កន្លែងអនុវត្ត
            </button>
            <button type="button"
              onClick={() => setActiveTab('team')}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'team' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
            >
              <Users2 className="h-4 w-4 mr-2" /> បន្ទប់ក្រុម
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {activeTab === 'brief' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{activeModule.title}</h2>
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium mb-6 flex items-start">
                    <Target className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block font-bold mb-1 uppercase text-xs tracking-wider">
                        គោលបំណង
                      </span>
                      <MarkdownText content={activeModule.task} />
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p>
                      ស្វាគមន៍មកកាន់មេរៀននេះ។
                      {activeModule.simulationConfig ? (
                        <>
                          {' '}
                          សូមចូលទៅកាន់ផ្ទាំង{' '}
                          <strong>
                            {activeModule.simulationConfig.type === 'wokwi'
                              ? 'IoT Lab'
                              : 'ពិសោធន៍ (Sim)'}
                          </strong>{' '}
                          ដើម្បីចាប់ផ្តើម។
                        </>
                      ) : (
                        <>
                          {' '}
                          ប្រើប្រាស់ផ្ទាំង <strong>កន្លែងអនុវត្ត (Studio)</strong>{' '}
                          ដើម្បីដាក់ស្នើកិច្ចការរបស់អ្នក។
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button"
                    onClick={() => setActiveTab('learn')}
                    className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" /> រៀនសិន
                  </button>
                  {activeModule.simulationConfig ? (
                    <button type="button"
                      onClick={() => setActiveTab('simulation')}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center hover:scale-105 transition-transform"
                    >
                      <Experiment className="h-4 w-4 mr-2" /> ចាប់ផ្តើមពិសោធន៍
                    </button>
                  ) : (
                    <button type="button"
                      onClick={() => setActiveTab('studio')}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center hover:scale-105 transition-transform"
                    >
                      ចាប់ផ្តើមអនុវត្ត <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Simulation Tab (Supports PhET and Wokwi) */}
            {activeTab === 'simulation' && activeModule.simulationConfig && (
              <div className="flex flex-col h-full gap-4 animate-fade-in">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[500px]">
                  {activeModule.simulationConfig.type === 'wokwi' ? (
                    // Wokwi Embed (Official Embedding supports params like &diagram=1 etc)
                    <iframe
                      src={
                        activeModule.simulationConfig.url
                          .replace(/\/embedded\/?$/, '')
                          .replace(/\/$/, '') +
                        (activeModule.simulationConfig.url.includes('embed=1') ? '' : '?embed=1')
                      }
                      className="w-full h-full absolute inset-0 border-0"
                      title="Wokwi Simulator"
                      allowFullScreen
                      allow="serial"
                    />
                  ) : (
                    // PhET or other
                    <iframe
                      src={activeModule.simulationConfig.url}
                      className="w-full h-full absolute inset-0 border-0"
                      title="Simulation"
                      allowFullScreen
                    />
                  )}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-primary" />
                      ផ្ទៀងផ្ទាត់ការពិសោធន៍ (Verify Lab Work)
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 text-sm text-gray-600">
                      <p className="mb-2">១. ធ្វើការពិសោធន៍អោយបានត្រឹមត្រូវតាមការណែនាំ។</p>
                      <p className="mb-2">
                        ២. ថតរូបអេក្រង់ (Screenshot) លទ្ធផលនៃការពិសោធន៍របស់អ្នក។
                      </p>
                      <p>៣. បញ្ចូលរូបភាពនៅទីនេះដើម្បីឱ្យ AI ត្រួតពិនិត្យ។</p>
                    </div>
                    <div className="w-full sm:w-auto flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={simFileInputRef}
                        aria-label="Upload Screenshot"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSubmissionImage(reader.result as string);
                              // Auto switch to studio to submit
                              setActiveTab('studio');
                              toast.success(
                                'រូបភាពត្រូវបានជ្រើសរើស! សូមចុច Submit នៅផ្ទាំង Studio។'
                              );
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                      <button type="button"
                        onClick={() => simFileInputRef.current?.click()}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform"
                      >
                        <Camera className="h-5 w-5 mr-2" /> Upload Screenshot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="max-w-3xl mx-auto h-full flex flex-col animate-fade-in">
                {generatedLessons[activeModuleId] ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                      <h3 className="font-bold text-gray-900">
                        មេរៀន ({lessonLanguage === 'km' ? 'ភាសាខ្មែរ' : 'English'})
                      </h3>
                      <button type="button"
                        onClick={() =>
                          setGeneratedLessons((prev) => ({ ...prev, [activeModuleId]: '' }))
                        }
                        className="text-sm text-primary font-bold hover:underline"
                      >
                        បង្កើតថ្មី
                      </button>
                    </div>
                    <div className="prose prose-blue max-w-none">
                      <MarkdownText content={generatedLessons[activeModuleId]} />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                      <button type="button"
                        onClick={() => setActiveTab('studio')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                      >
                        ខ្ញុំត្រៀមខ្លួនអនុវត្តហើយ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                      <Brain className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">ដោះសោចំណេះដឹង</h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                      ជ្រើសរើសភាសាដែលអ្នកចង់សិក្សា ហើយ AI នឹងបង្កើតមេរៀនសង្ខេបសម្រាប់អ្នក។
                    </p>

                    <div className="flex gap-4 mb-6">
                      <button type="button"
                        onClick={() => setLessonLanguage('km')}
                        className={`px-6 py-3 rounded-xl font-bold border transition-all ${lessonLanguage === 'km' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        🇰🇭 ភាសាខ្មែរ
                      </button>
                      <button type="button"
                        onClick={() => setLessonLanguage('en')}
                        className={`px-6 py-3 rounded-xl font-bold border transition-all ${lessonLanguage === 'en' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        🇬🇧 English
                      </button>
                    </div>

                    <button type="button"
                      onClick={handleStartLesson}
                      disabled={loadingLesson}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl flex items-center hover:scale-105 transition-transform"
                    >
                      {loadingLesson ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-5 w-5 mr-2 fill-white" />
                      )}
                      {loadingLesson
                        ? 'កំពុងបង្កើតមេរៀន...'
                        : `បង្កើតមេរៀន (${AI_COSTS.LESSON} Pts)`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'studio' && (
              <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <button type="button"
                        onClick={() => setSubmissionType('text')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${submissionType === 'text' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FileText className="h-3.5 w-3.5" /> Text Answer
                      </button>
                      <button type="button"
                        onClick={() => setSubmissionType('code')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${submissionType === 'code' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Terminal className="h-3.5 w-3.5" /> Code Editor
                      </button>
                    </div>

                    {mission.enablePlagiarismCheck && (
                      <div className="flex items-center text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Check Active
                      </div>
                    )}
                  </div>

                  <div className="px-4 pt-4">
                    {submissionImage ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-2">
                        <img
                          src={submissionImage}
                          alt="Homework"
                          className="w-full h-full object-contain"
                        />
                        <button type="button"
                          onClick={() => setSubmissionImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                          aria-label="Remove Image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : submissionType === 'text' ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors mb-2 gap-2"
                      >
                        <Camera className="h-5 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">
                          Attach Image / Screenshot (Optional)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          aria-label="Upload Attachment"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2 mb-2">
                        {['javascript', 'python', 'html'].map((lang) => (
                          <button type="button"
                            key={lang}
                            onClick={() => setCodeLanguage(lang as any)}
                            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${codeLanguage === lang ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4">
                    {submissionType === 'code' ? (
                      <div className="h-[400px]">
                        <CodeEditor
                          initialCode={currentSubmissionText || '// Start coding here...'}
                          language={codeLanguage}
                          onChange={(val) => handleTextChange(val)}
                          readOnly={moduleStatus[activeModuleId] === 'completed'}
                        />
                      </div>
                    ) : (
                      <>
                        <label htmlFor="submissionTextInput" className="sr-only">Submission Text</label>
                        <textarea
                          id="submissionTextInput"
                          className="w-full resize-y focus:outline-none text-sm text-gray-800 leading-relaxed min-h-[150px] bg-transparent p-2"
                          placeholder="សរសេរចម្លើយរបស់អ្នកនៅទីនេះ..."
                          value={currentSubmissionText}
                          onChange={(e) => handleTextChange(e.target.value)}
                          disabled={moduleStatus[activeModuleId] === 'completed'}
                        />
                        <CharCounter
                          current={currentSubmissionText.length}
                          limit={SUBMISSION_LIMIT}
                        />
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {submissionType === 'code'
                        ? 'Code is run in browser sandbox'
                        : 'Supports Markdown & LaTeX $$...$$'}
                    </span>
                    <button type="button"
                      onClick={handleSubmitWork}
                      disabled={
                        isEvaluating ||
                        moduleStatus[activeModuleId] === 'completed' ||
                        (!currentSubmissionText.trim() && !submissionImage) ||
                        currentSubmissionText.length > SUBMISSION_LIMIT
                      }
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center ${
                        moduleStatus[activeModuleId] === 'completed'
                          ? 'bg-green-500 text-white'
                          : isFailedAttempt
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-900 text-white'
                      } disabled:opacity-50`}
                    >
                      {isEvaluating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {isEvaluating
                        ? 'Checking...'
                        : moduleStatus[activeModuleId] === 'completed'
                          ? 'បានបញ្ចប់ (Completed)'
                          : isFailedAttempt
                            ? `Retry (${submissionImage ? AI_COSTS.EVALUATION + 5 : AI_COSTS.EVALUATION} Pts)`
                            : `Submit (${submissionImage ? AI_COSTS.EVALUATION + 5 : AI_COSTS.EVALUATION} Pts)`}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 items-start animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                    <span className="text-lg">🐰</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex-1">
                    <h4 className="text-xs font-bold text-primary mb-1">សុភាទន្សាយ (AI Mentor)</h4>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <MarkdownText
                        content={
                          activeModule.initialPrompt ||
                          'សួស្តី! តោះចាប់ផ្តើមបេសកកម្មនេះទាំងអស់គ្នា។'
                        }
                      />
                    </div>
                  </div>
                </div>

                {currentEvaluation && (
                  <div
                    className={`p-4 rounded-xl border ${currentEvaluation.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-scale-in`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-bold text-sm mb-2 ${currentEvaluation.passed ? 'text-green-800' : 'text-red-800'}`}
                        >
                          {currentEvaluation.passed
                            ? 'ល្អណាស់!'
                            : 'ត្រូវការកែតម្រូវ (Needs Improvement)'}
                        </h4>
                        <div className="text-sm leading-relaxed">
                          <MarkdownText content={currentEvaluation.feedback} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="max-w-3xl mx-auto h-full animate-fade-in flex flex-col gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    សមាជិកក្រុម ({squadMembers.length})
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {squadMembers.map((member) => (
                      <div
                        key={member.studentId}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                      >
                        <span className="text-sm font-bold text-gray-800">{member.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-100 flex-1 flex flex-col min-h-[300px]">
                  <div className="p-4 border-b border-yellow-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-bold text-yellow-900">កំណត់ហេតុក្រុម (Squad Note)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSaving ? (
                        <span className="text-xs text-yellow-600 animate-pulse">
                          កំពុងរក្សាទុក...
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600">
                          បានរក្សាទុក {lastSaved ? lastSaved.toLocaleTimeString() : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <label htmlFor="squadNoteInput" className="sr-only">Squad Note</label>
                    <textarea
                      id="squadNoteInput"
                      className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder-yellow-800/40"
                      placeholder="ប្រើកន្លែងនេះដើម្បីសហការគ្នា (Auto-saved)..."
                      value={squadNote}
                      onChange={(e) => handleSquadNoteChange(e.target.value)}
                      onBlur={handleSquadNoteBlur}
                    />
                    <CharCounter current={squadNote.length} limit={SQUAD_NOTE_LIMIT} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Mentor Sidebar (Desktop) */}
        <div className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col">
          <div className="h-14 border-b border-gray-100 flex items-center px-4 bg-primary/5">
            <Brain className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">គ្រូជំនួយ AI</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {(messages[activeModuleId] || []).map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-gray-800 border' : 'bg-primary text-white'}`}
                >
                  <MarkdownText content={msg.text} />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="relative">
              <label htmlFor="chatInput" className="sr-only">សួរសំណួរ</label>
              <input
                id="chatInput"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="សួរសំណួរ... (1 Pt)"
                className="w-full bg-gray-100 text-sm rounded-xl pl-3 pr-10 py-3 focus:outline-none"
              />
              <button type="button"
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-primary text-white rounded-lg disabled:opacity-50"
                aria-label="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionWorkspace;
