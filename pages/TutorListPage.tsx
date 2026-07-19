import React, { useState, useEffect } from 'react';
import TutorCard from '../components/TutorCard';
import TutorRequestCard from '../components/TutorRequestCard';
import {
  fetchAllTutors,
  fetchStudentRequests,
  createStudentRequest,
  deleteStudentRequest,
  applyToRequest,
} from '../services/tutorService';
import { getCurrentUserProfile } from '../services/authService';
import { TutorProfile, TutorRequest } from '../types';
import {
  Loader2,
  Plus,
  X,
  Clock,
  RefreshCw,
  Filter,
  Search,
  Send,
  ChevronDown,
} from '../components/Icons';
import toast from 'react-hot-toast';

const LIMIT = 10;

const TutorListPage: React.FC = () => {
  const [state, setState] = useState({
    activeTab: 'tutors' as 'tutors' | 'requests',
    subjectFilter: 'All',
    tutors: [] as TutorProfile[],
    requests: [] as TutorRequest[],
    loading: true,
    refreshing: false,
    currentUser: null as any,
    page: 1,
    hasMore: true,
    loadingMore: false,
    showRequestModal: false,
    newRequest: {} as Partial<TutorRequest>,
    submitting: false,
    showApplyModal: false,
    selectedRequest: null as TutorRequest | null,
    applyMessage: '',
    applying: false,
  });

  useEffect(() => {
    // Initial Load user
    getCurrentUserProfile().then((user) => {
      if (user) setState((s) => ({ ...s, currentUser: user }));
    });
  }, []);

  const loadData = React.useCallback(
    async (pageToLoad: number, isReset: boolean = false, tab: string, filter: string) => {
      if (!isReset) setState((s) => ({ ...s, loadingMore: true }));
      else setState((s) => ({ ...s, loading: true }));

      try {
        if (tab === 'tutors') {
          const data = await fetchAllTutors(pageToLoad, LIMIT, filter);
          setState((s) => ({
            ...s,
            hasMore: data.length >= LIMIT,
            tutors: isReset ? data : [...s.tutors, ...data],
            loading: false,
            loadingMore: false,
            refreshing: false,
          }));
        } else {
          const data = await fetchStudentRequests(pageToLoad, LIMIT);
          setState((s) => ({
            ...s,
            hasMore: data.length >= LIMIT,
            requests: isReset ? data : [...s.requests, ...data],
            loading: false,
            loadingMore: false,
            refreshing: false,
          }));
        }
      } catch (e) {
        console.error('Failed to load data', e);
        toast.error('បរាជ័យក្នុងការផ្ទុកទិន្នន័យ។');
        setState((s) => ({ ...s, loading: false, loadingMore: false, refreshing: false }));
      }
    },
    []
  );

  // Effect to handle tab/filter changes = Reset List
  useEffect(() => {
    setState((s) => ({ ...s, page: 1, tutors: [], requests: [], hasMore: true }));
    loadData(1, true, state.activeTab, state.subjectFilter);
  }, [state.activeTab, state.subjectFilter, loadData]);

  const handleRefresh = () => {
    setState((s) => ({ ...s, refreshing: true, page: 1, hasMore: true }));
    loadData(1, true, state.activeTab, state.subjectFilter);
  };

  const handleLoadMore = () => {
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    loadData(nextPage, false, state.activeTab, state.subjectFilter);
  };

  // --- Student Actions ---

  const handleCreateRequest = async () => {
    if (!state.newRequest.subject || !state.newRequest.budget) return;
    setState((s) => ({ ...s, submitting: true }));
    try {
      await createStudentRequest(state.newRequest);
      toast.success('សំណើត្រូវបានបង្កើត!');
      setState((s) => ({ ...s, showRequestModal: false, newRequest: {} }));
      handleRefresh();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការបង្កើតសំណើ។');
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('តើអ្នកចង់លុបសំណើនេះមែនទេ?')) return;
    try {
      await deleteStudentRequest(id);
      setState((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) }));
      toast.success('បានលុបសំណើ។');
    } catch (e) {
      toast.error('បរាជ័យក្នុងការលុប។');
    }
  };

  // --- Tutor Actions ---

  const handleOpenApplyModal = (req: TutorRequest) => {
    if (!state.currentUser) {
      toast.error('សូមចូលគណនីជាមុនសិន។');
      return;
    }
    if (state.currentUser.id === req.studentId) {
      toast.error('អ្នកមិនអាចដាក់ពាក្យលើសំណើខ្លួនឯងបានទេ។');
      return;
    }
    setState((s) => ({
      ...s,
      selectedRequest: req,
      applyMessage: `សួស្តី ${req.name}! ខ្ញុំចាប់អារម្មណ៍បង្រៀនមុខវិជ្ជា ${req.subject}។`,
      showApplyModal: true,
    }));
  };

  const handleSubmitApplication = async () => {
    if (!state.selectedRequest || !state.applyMessage.trim()) return;
    setState((s) => ({ ...s, applying: true }));
    try {
      await applyToRequest(state.selectedRequest, state.applyMessage);
      toast.success('បានផ្ញើសារទៅសិស្ស!', { icon: '📨' });
      setState((s) => ({ ...s, showApplyModal: false, applyMessage: '' }));
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការផ្ញើ។');
    } finally {
      setState((s) => ({ ...s, applying: false }));
    }
  };

  // Extract subjects for filter from loaded tutors (Client side extraction for filter list only)
  // Ideally this list should come from a static config or separate DB call for scalability,
  // but extracting from current list is okay for MVP.
  const allSubjects = Array.from(new Set(state.tutors.flatMap((t) => t.subjects || [])));
  const subjects = ['All', ...allSubjects];

  const isTutor = state.currentUser?.role === 'tutor' || state.currentUser?.role === 'admin';

  return (
    <div className="pb-24 pt-4 px-4 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ទីផ្សារគ្រូបង្រៀន</h1>
            <p className="text-xs text-gray-500 mt-1">
              ស្វែងរកគ្រូ ឬប្រកាសពីតម្រូវការសិក្សារបស់អ្នក
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-primary transition-colors ${state.refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Top Toggle Switch */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 flex max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'tutors' }))}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${state.activeTab === 'tutors' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            ស្វែងរកគ្រូ (Browse Tutors)
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, activeTab: 'requests' }))}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${state.activeTab === 'requests' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            សំណើសិស្ស (Requests)
          </button>
        </div>

        {state.activeTab === 'tutors' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 flex-shrink-0">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
              {subjects.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setState((st) => ({ ...st, subjectFilter: s }))}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    state.subjectFilter === s
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s === 'All' ? 'ទាំងអស់' : s}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-xs text-gray-400">កំពុងផ្ទុកទិន្នន័យ...</p>
          </div>
        ) : state.activeTab === 'tutors' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {state.tutors.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">មិនមានគ្រូបង្រៀនទេ</h3>
                <p className="text-gray-500 text-xs">
                  សូមព្យាយាមប្តូរប្រភេទស្វែងរក ឬត្រឡប់មកវិញពេលក្រោយ។
                </p>
              </div>
            )}
            {state.tutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Call to Action Card - Only show to Students */}
            {!isTutor && (
              <div className="bg-gradient-to-r from-primary/10 to-teal-100/50 border border-primary/10 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">ត្រូវការគ្រូបង្រៀនមែនទេ?</h3>
                  <p className="text-xs text-gray-600">
                    ប្រកាសពីតម្រូវការរបស់អ្នក ដើម្បីឱ្យគ្រូទាក់ទងមក។
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setState((s) => ({ ...s, showRequestModal: true }))}
                  className="relative z-10 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> ប្រកាសសំណើ
                </button>
                <div className="absolute -right-4 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                សំណើថ្មីៗ (Latest Requests)
              </h3>
            </div>

            {state.requests.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">មិនទាន់មានសំណើទេ។</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.requests.map((req) => (
                <TutorRequestCard
                  key={req.id}
                  request={req}
                  isOwner={state.currentUser?.id === req.studentId}
                  showApply={isTutor}
                  onDelete={handleDeleteRequest}
                  onApply={handleOpenApplyModal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {state.hasMore && !state.loading && (
          <div className="pt-8 pb-4 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={state.loadingMore}
              className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 flex items-center text-sm"
            >
              {state.loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              បង្ហាញបន្ថែម (Load More)
            </button>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {state.showApplyModal && state.selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">ទាក់ទងសិស្ស (Contact)</h3>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showApplyModal: false }))}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">ដាក់ពាក្យសម្រាប់</p>
              <p className="font-bold text-gray-900 text-sm">{state.selectedRequest.subject}</p>
              <p className="text-xs text-gray-600">{state.selectedRequest.grade}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="applyMessage"
                  className="block text-xs font-bold text-gray-500 mb-1"
                >
                  សារខ្លីៗទៅកាន់សិស្ស
                </label>
                <textarea
                  id="applyMessage"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="ណែនាំខ្លួនអ្នក និងបទពិសោធន៍..."
                  value={state.applyMessage}
                  onChange={(e) => setState((s) => ({ ...s, applyMessage: e.target.value }))}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={state.applying || !state.applyMessage.trim()}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
              >
                {state.applying ? (
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

      {/* Request Modal */}
      {state.showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">ប្រកាសសំណើសិក្សា</h3>
                <p className="text-xs text-gray-500">ស្វែងរកគ្រូដែលសាកសមនឹងអ្នក</p>
              </div>
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, showRequestModal: false }))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-gray-500 mb-1">
                  មុខវិជ្ជា
                </label>
                <input
                  id="subject"
                  placeholder="ឧ. គណិតវិទ្យា, រូបវិទ្យា..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      newRequest: { ...s.newRequest, subject: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="grade" className="block text-xs font-bold text-gray-500 mb-1">
                    កម្រិត
                  </label>
                  <input
                    id="grade"
                    placeholder="ឧ. ថ្នាក់ទី១២"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        newRequest: { ...s.newRequest, grade: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-xs font-bold text-gray-500 mb-1">
                    ថវិកា (រៀល)
                  </label>
                  <input
                    id="budget"
                    type="number"
                    placeholder="ឧ. 20000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        newRequest: { ...s.newRequest, budget: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-xs font-bold text-gray-500 mb-1">
                  ទីតាំង
                </label>
                <input
                  id="location"
                  placeholder="ទីតាំង ឬ អនឡាញ"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      newRequest: { ...s.newRequest, location: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-xs font-bold text-gray-500 mb-1">
                  ព័ត៌មានលម្អិត
                </label>
                <textarea
                  id="description"
                  placeholder="ពណ៌នាអំពីតម្រូវការរបស់អ្នក..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      newRequest: { ...s.newRequest, description: e.target.value },
                    }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleCreateRequest}
                disabled={state.submitting}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {state.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ប្រកាសសំណើ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorListPage;
