import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Save,
  Loader2,
  Briefcase,
  Calendar,
  CheckCircle,
  X,
  User,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  AlertCircle,
  Send,
  BookOpen,
  Video,
  Filter,
  ChevronRight,
  FileText,
  Eye,
  EyeOff,
  Camera,
  Zap,
  Image as ImageIcon,
} from '../components/Icons';
import {
  getMyTutorProfile,
  updateTutorProfile,
  getTutorBookings,
  updateBookingStatus,
  fetchStudentRequests,
  applyToRequest,
} from '../services/tutorService';
import { generateImage, AI_COSTS } from '../services/geminiService';
import { uploadFile } from '../services/storageService';
import { TutorProfile, TutorBooking, TutorRequest } from '../types';
import CharCounter from '../components/CharCounter';
import TutorRequestCard from '../components/TutorRequestCard';
import toast from 'react-hot-toast';
import { formatRiel } from '../utils/formatHelper';
import { Link } from 'react-router-dom';

const BIO_LIMIT = 600;

const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const TutorDashboard: React.FC = () => {
  const [state, setState] = useState({
    profile: {
      subjects: [],
      grades: [],
      teachingMode: 'Both',
      hourlyRate: 0,
      experience: '',
      bio: '',
      location: '',
      phoneContact: '',
      is_listed: true,
      coverImage: '',
    } as Partial<TutorProfile>,
    bookings: [] as TutorBooking[],
    requests: [] as TutorRequest[],
    loading: true,
    saving: false,
    toggling: false,
    activeTab: 'profile' as 'profile' | 'bookings' | 'jobs',
    subjectsInput: '',
    gradesInput: '',
    coverFile: null as File | null,
    coverBase64: null as string | null,
    isGeneratingCover: false,
    showApplyModal: false,
    selectedRequest: null as TutorRequest | null,
    applyMessage: '',
    applying: false,
  });

  const {
    profile, bookings, requests, loading, saving, toggling, activeTab,
    subjectsInput, gradesInput, coverFile, coverBase64, isGeneratingCover,
    showApplyModal, selectedRequest, applyMessage, applying
  } = state;

  const setProfile = (val: any) => setState(s => ({ ...s, profile: typeof val === 'function' ? val(s.profile) : val }));
  const setBookings = (val: any) => setState(s => ({ ...s, bookings: typeof val === 'function' ? val(s.bookings) : val }));
  const setRequests = (val: any) => setState(s => ({ ...s, requests: typeof val === 'function' ? val(s.requests) : val }));
  const setLoading = (val: any) => setState(s => ({ ...s, loading: typeof val === 'function' ? val(s.loading) : val }));
  const setSaving = (val: any) => setState(s => ({ ...s, saving: typeof val === 'function' ? val(s.saving) : val }));
  const setToggling = (val: any) => setState(s => ({ ...s, toggling: typeof val === 'function' ? val(s.toggling) : val }));
  const setActiveTab = (val: any) => setState(s => ({ ...s, activeTab: typeof val === 'function' ? val(s.activeTab) : val }));
  const setSubjectsInput = (val: any) => setState(s => ({ ...s, subjectsInput: typeof val === 'function' ? val(s.subjectsInput) : val }));
  const setGradesInput = (val: any) => setState(s => ({ ...s, gradesInput: typeof val === 'function' ? val(s.gradesInput) : val }));
  const setCoverFile = (val: any) => setState(s => ({ ...s, coverFile: typeof val === 'function' ? val(s.coverFile) : val }));
  const setCoverBase64 = (val: any) => setState(s => ({ ...s, coverBase64: typeof val === 'function' ? val(s.coverBase64) : val }));
  const setIsGeneratingCover = (val: any) => setState(s => ({ ...s, isGeneratingCover: typeof val === 'function' ? val(s.isGeneratingCover) : val }));
  const setShowApplyModal = (val: any) => setState(s => ({ ...s, showApplyModal: typeof val === 'function' ? val(s.showApplyModal) : val }));
  const setSelectedRequest = (val: any) => setState(s => ({ ...s, selectedRequest: typeof val === 'function' ? val(s.selectedRequest) : val }));
  const setApplyMessage = (val: any) => setState(s => ({ ...s, applyMessage: typeof val === 'function' ? val(s.applyMessage) : val }));
  const setApplying = (val: any) => setState(s => ({ ...s, applying: typeof val === 'function' ? val(s.applying) : val }));

  const loadData = React.useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const myProfile = await getMyTutorProfile();
      if (myProfile) {
        setState(s => ({
          ...s,
          profile: myProfile,
          subjectsInput: myProfile.subjects?.join(', ') || '',
          gradesInput: myProfile.grades?.join(', ') || ''
        }));

        const myBookings = await getTutorBookings();
        setState(s => ({ ...s, bookings: myBookings }));
      }
      const jobs = await fetchStudentRequests();
      setState(s => ({ ...s, requests: jobs }));
    } catch (e) {
      console.error('Error loading dashboard', e);
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async () => {
    if ((profile.bio?.length || 0) > BIO_LIMIT) return;
    setSaving(true);
    try {
      let coverUrl = profile.coverImage || '';

      // Handle Cover Image Upload
      if (coverBase64) {
        const blob = base64ToBlob(coverBase64);
        coverUrl = (await uploadFile(blob, 'course-covers')) || coverUrl; // Reuse bucket folder
      } else if (coverFile) {
        coverUrl = (await uploadFile(coverFile, 'course-covers')) || coverUrl;
      }

      const updatedProfile = {
        ...profile,
        subjects: subjectsInput
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        grades: gradesInput
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
        coverImage: coverUrl,
      };

      await updateTutorProfile(updatedProfile);
      setProfile(updatedProfile);
      // Reset temp states
      setCoverFile(null);
      setCoverBase64(null);

      toast.success('បានរក្សាទុកប្រវត្តិរូប!');
    } catch (e) {
      toast.error('បរាជ័យក្នុងការរក្សាទុក។');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!subjectsInput) {
      toast.error('សូមបញ្ចូលមុខវិជ្ជាជាមុនសិន ដើម្បីឱ្យ AI ស្គាល់អ្នក');
      return;
    }
    setIsGeneratingCover(true);
    try {
      const prompt = `A professional, modern educational banner background for a tutor teaching: ${subjectsInput}. Clean design, soft lighting, high quality, 3D abstract elements related to education.`;
      const base64 = await generateImage(prompt);
      if (base64) {
        setCoverBase64(base64);
        setCoverFile(null);
        toast.success('រូបភាពត្រូវបានបង្កើត!');
      }
    } catch (e) {
      toast.error('បរាជ័យក្នុងការបង្កើតរូបភាព');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const toggleListedStatus = async () => {
    if (toggling) return;
    const newStatus = !profile.is_listed;
    setToggling(true);

    // Optimistic Update
    setProfile((prev) => ({ ...prev, is_listed: newStatus }));

    try {
      await updateTutorProfile({ is_listed: newStatus });
      // toast.success(newStatus ? "ប្រវត្តិរូបកំពុងផ្សាយជាសាធារណៈ!" : "ប្រវត្តិរូបត្រូវបានលាក់!");
    } catch (e) {
      // Revert on failure
      setProfile((prev) => ({ ...prev, is_listed: !newStatus }));
      toast.error('បរាជ័យក្នុងការប្តូរស្ថានភាព។');
    } finally {
      setToggling(false);
    }
  };

  const handleBookingAction = async (id: string, action: 'Accepted' | 'Rejected') => {
    try {
      await updateBookingStatus(id, action);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: action } : b)));
      toast.success(`សំណើត្រូវបាន ${action === 'Accepted' ? 'ទទួល' : 'បដិសេធ'}`);
    } catch (e) {
      toast.error('មានបញ្ហាក្នុងការកែប្រែ។');
    }
  };

  const handleOpenApplyModal = (req: TutorRequest) => {
    if (profile.id === req.studentId) {
      toast.error('អ្នកមិនអាចដាក់ពាក្យលើសំណើខ្លួនឯងបានទេ។');
      return;
    }
    setSelectedRequest(req);
    setApplyMessage(`សួស្តី ${req.name}! ខ្ញុំចាប់អារម្មណ៍បង្រៀនមុខវិជ្ជា ${req.subject}។`);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedRequest || !applyMessage.trim()) return;
    setApplying(true);
    try {
      await applyToRequest(selectedRequest, applyMessage);
      toast.success('បានផ្ញើសារទៅសិស្ស!', { icon: '📨' });
      setShowApplyModal(false);
      setApplyMessage('');
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការផ្ញើ។');
    } finally {
      setApplying(false);
    }
  };

  // Derived State
  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const activeBookings = bookings.filter((b) => b.status === 'Accepted');
  const pastBookings = bookings.filter((b) => b.status !== 'Pending' && b.status !== 'Accepted');

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2 text-primary" />
            <span>Tutor Dashboard</span>
          </h1>
          {activeTab === 'profile' && (
            <button type="button"
              onClick={handleSaveProfile}
              disabled={saving || (profile.bio?.length || 0) > BIO_LIMIT}
              className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              រក្សាទុក
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* --- MARKETPLACE VISIBILITY BANNER --- */}
        <div
          className={`mb-8 p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col md:flex-row justify-between items-center gap-4 ${
            profile.is_listed
              ? 'bg-green-50 border-green-100 shadow-sm'
              : 'bg-amber-50 border-amber-100 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl ${profile.is_listed ? 'bg-green-500 text-white' : 'bg-amber-500 text-white shadow-inner'}`}
            >
              {profile.is_listed ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">ស្ថានភាពលើទីផ្សារ (Marketplace Status)</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    profile.is_listed ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {profile.is_listed ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">
                {profile.is_listed
                  ? 'សិស្សអាចស្វែងរក និងកក់ម៉ោងសិក្សាជាមួយអ្នកបានជាសាធារណៈ។'
                  : 'ប្រវត្តិរូបរបស់អ្នកត្រូវបានលាក់។ សិស្សថ្មីមិនអាចស្វែងរកអ្នកឃើញឡើយ។'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/50 p-2 rounded-2xl border border-white/50 backdrop-blur-sm">
            <span
              className={`text-xs font-bold ${profile.is_listed ? 'text-gray-400' : 'text-amber-600'}`}
            >
              លាក់
            </span>
            <button type="button"
              onClick={toggleListedStatus}
              disabled={toggling}
              aria-label={profile.is_listed ? "Hide Profile" : "Publish Profile"}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-primary/20 ${
                profile.is_listed ? 'bg-green-50' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  profile.is_listed ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${profile.is_listed ? 'text-green-600' : 'text-gray-400'}`}
            >
              ផ្សាយ
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase">សិស្សសរុប</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase">សំណើថ្មី</p>
            <p className="text-2xl font-bold text-orange-500">{pendingBookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase">ថ្នាក់សកម្ម</p>
            <p className="text-2xl font-bold text-green-600">{activeBookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase">Job Market</p>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100/50 p-1.5 rounded-2xl flex gap-1 mb-8 w-full md:w-auto md:inline-flex border border-gray-200">
          <button type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User className="h-4 w-4 mr-2" /> ប្រវត្តិរូប
          </button>
          <button type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'bookings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Calendar className="h-4 w-4 mr-2" /> ការកក់ ({pendingBookings.length})
          </button>
          <button type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'jobs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Briefcase className="h-4 w-4 mr-2" /> ការងារថ្មី
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Col: Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 p-1 border border-gray-200 mx-auto">
                      <img
                        src={
                          profile.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${profile.fullName}`
                        }
                        alt="avatar"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{profile.fullName}</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {profile.id ? 'Verified Tutor' : 'New Tutor'}
                  </p>

                  <div className="space-y-4 text-left">
                    <div>
                      <label htmlFor="hourlyRate" className="block text-xs font-bold text-gray-500 mb-1">
                        តម្លៃម៉ោង (Riel)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          id="hourlyRate"
                          type="number"
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={profile.hourlyRate}
                          onChange={(e) =>
                            setProfile({ ...profile, hourlyRate: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-xs font-bold text-gray-500 mb-1">ទីតាំង</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          id="location"
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={profile.location || ''}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phoneContact" className="block text-xs font-bold text-gray-500 mb-1">
                        លេខទូរស័ព្ទ
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          id="phoneContact"
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={profile.phoneContact || ''}
                          onChange={(e) => setProfile({ ...profile, phoneContact: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Teaching Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2 text-primary" /> រូបភាពគម្រប (Cover Image)
                    </h3>
                    <button type="button"
                      onClick={handleGenerateCover}
                      disabled={isGeneratingCover}
                      className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center hover:bg-purple-100 transition-colors"
                    >
                      {isGeneratingCover ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Zap className="h-3 w-3 mr-1" />
                      )}
                      AI Generate
                    </button>
                  </div>
                  <div className="relative aspect-[3/1] bg-gray-100 rounded-xl overflow-hidden border border-dashed border-gray-300 flex items-center justify-center group cursor-pointer">
                    {coverBase64 || coverFile || profile.coverImage ? (
                      <img
                        src={
                          coverBase64
                            ? `data:image/png;base64,${coverBase64}`
                            : coverFile
                              ? URL.createObjectURL(coverFile)
                              : profile.coverImage
                        }
                        className="w-full h-full object-cover"
                        alt="Cover Preview"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-xs">ចុចដើម្បីដាក់រូបភាព (Click to Upload)</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white p-2 rounded-full shadow-lg">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <input
                      aria-label="Upload Cover Image"
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={(e) => {
                        setCoverFile(e.target.files?.[0] || null);
                        setCoverBase64(null);
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" /> ព័ត៌មានបង្រៀន
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="subjectsInput" className="block text-xs font-bold text-gray-500 mb-1">
                        មុខវិជ្ជា (Subjects)
                      </label>
                      <input
                        id="subjectsInput"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={subjectsInput}
                        onChange={(e) => setSubjectsInput(e.target.value)}
                        placeholder="Math, English, Physics..."
                      />
                      <p className="text-[10px] text-gray-400 mt-1">បំបែកដោយសញ្ញាក្បៀស (,)</p>
                    </div>
                    <div>
                      <label htmlFor="gradesInput" className="block text-xs font-bold text-gray-500 mb-1">
                        កម្រិត (Grades)
                      </label>
                      <input
                        id="gradesInput"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={gradesInput}
                        onChange={(e) => setGradesInput(e.target.value)}
                        placeholder="Grade 10, Grade 12, Adult..."
                      />
                    </div>
                  </div>
                  <fieldset className="mb-4">
                    <legend className="block text-xs font-bold text-gray-500 mb-1">
                      ទម្រង់បង្រៀន
                    </legend>
                    <div className="flex gap-4">
                      {['Online', 'Home', 'Both'].map((mode) => (
                        <label key={mode} htmlFor={`mode-${mode}`} className="flex items-center cursor-pointer">
                          <input
                            id={`mode-${mode}`}
                            type="radio"
                            name="teachingMode"
                            className="mr-2 text-primary focus:ring-primary"
                            checked={profile.teachingMode === mode}
                            onChange={() => setProfile({ ...profile, teachingMode: mode as any })}
                          />
                          <span className="text-sm text-gray-700">
                            {mode === 'Online' ? 'អនឡាញ' : mode === 'Home' ? 'តាមផ្ទះ' : 'ទាំងពីរ'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="experience" className="block text-xs font-bold text-gray-500 mb-1">
                      បទពិសោធន៍ (Experience)
                    </label>
                    <input
                      id="experience"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={profile.experience || ''}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      placeholder="Ex: 5 years teaching Math at High School"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" /> <label htmlFor="bio">អំពីខ្ញុំ (Bio)</label>
                  </h3>
                  <textarea
                    id="bio"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="ណែនាំខ្លួនអ្នក និងវិធីសាស្រ្តបង្រៀនរបស់អ្នក..."
                  />
                  <CharCounter current={profile.bio?.length || 0} limit={BIO_LIMIT} />
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              {/* Pending Section */}
              {pendingBookings.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" /> សំណើថ្មី (Pending)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-400 p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                b.studentAvatar ||
                                `https://ui-avatars.com/api/?name=${b.studentName}`
                              }
                              className="w-10 h-10 rounded-full bg-gray-200"
                              alt="Avatar"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900">{b.studentName}</h4>
                              <p className="text-xs text-gray-500">
                                {new Date(b.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded">
                            New Request
                          </span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm text-gray-700 space-y-1">
                          <p>
                            <span className="font-bold text-gray-500 text-xs uppercase w-20 inline-block">
                              Subject:
                            </span>{' '}
                            {b.subject}
                          </p>
                          <p>
                            <span className="font-bold text-gray-500 text-xs uppercase w-20 inline-block">
                              Time:
                            </span>{' '}
                            {b.scheduledTime}
                          </p>
                          {b.locationNotes && (
                            <p className="italic text-gray-500 border-t border-gray-200 pt-2 mt-2">
                              "{b.locationNotes}"
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button type="button"
                            onClick={() => handleBookingAction(b.id, 'Accepted')}
                            className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-green-700 transition-colors shadow-sm"
                          >
                            ទទួល (Accept)
                          </button>
                          <button type="button"
                            onClick={() => handleBookingAction(b.id, 'Rejected')}
                            className="flex-1 bg-white border border-gray-200 text-red-600 font-bold py-2 rounded-lg text-xs hover:bg-red-50 transition-colors"
                          >
                            បដិសេធ (Reject)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active & Past Section */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> ថ្នាក់រៀន (Active &
                  History)
                </h3>
                {activeBookings.length === 0 && pastBookings.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                    មិនទាន់មានថ្នាក់រៀនទេ។
                  </div>
                )}
                <div className="space-y-3">
                  {[...activeBookings, ...pastBookings].map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-center gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 w-full">
                        <div
                          className={`w-2 h-12 rounded-full ${b.status === 'Accepted' ? 'bg-green-500' : 'bg-gray-300'}`}
                        ></div>
                        <img
                          src={
                            b.studentAvatar || `https://ui-avatars.com/api/?name=${b.studentName}`
                          }
                          className="w-10 h-10 rounded-full bg-gray-200"
                          alt="Avatar"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900">{b.studentName}</h4>
                          <p className="text-xs text-gray-500">
                            {b.subject} • {b.scheduledTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            b.status === 'Accepted'
                              ? 'bg-green-100 text-green-700'
                              : b.status === 'Completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.status === 'Accepted' && (
                          <Link
                            to={`/classroom/${b.id}`}
                            className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center hover:bg-black transition-colors"
                          >
                            <Video className="h-3 w-3 mr-2" /> ចូលថ្នាក់ (Classroom)
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" /> សំណើសិស្សថ្មីៗ (New Requests)
                </h3>
                <button type="button" className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm text-gray-600 hover:text-primary">
                  <Filter className="h-4 w-4" />
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-400 mb-2">មិនទាន់មានសំណើសិស្សថ្មីទេ។</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((req) => (
                    <TutorRequestCard
                      key={req.id}
                      request={req}
                      showApply={true}
                      onApply={handleOpenApplyModal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">ដាក់ពាក្យបង្រៀន</h3>
              <button type="button" onClick={() => setShowApplyModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
              <p className="text-xs text-blue-500 font-bold uppercase mb-1">TO:</p>
              <p className="font-bold text-blue-900 text-sm">{selectedRequest.name}</p>
              <p className="text-xs text-blue-700 mt-1">
                {selectedRequest.subject} • {selectedRequest.grade}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="applyMessage" className="block text-xs font-bold text-gray-500 mb-1">
                  សារខ្លីៗ (Message)
                </label>
                <textarea
                  id="applyMessage"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="ណែនាំខ្លួនអ្នក និងមូលហេតុដែលសិស្សគួរជ្រើសរើសអ្នក..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                />
              </div>

              <button type="button"
                onClick={handleSubmitApplication}
                disabled={applying || !applyMessage.trim()}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> ផ្ញើសារ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
