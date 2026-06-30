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

const TutorListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tutors' | 'requests'>('tutors');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 10;

  // Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<TutorRequest>>({});
  const [submitting, setSubmitting] = useState(false);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    // Initial Load user
    getCurrentUserProfile().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // Effect to handle tab/filter changes = Reset List
  useEffect(() => {
    setPage(1);
    setTutors([]);
    setRequests([]);
    setHasMore(true);
    loadData(1, true);
  }, [activeTab, subjectFilter]);

  const loadData = async (pageToLoad: number, isReset: boolean = false) => {
    if (!isReset) setLoadingMore(true);
    else setLoading(true);

    try {
      if (activeTab === 'tutors') {
        const data = await fetchAllTutors(pageToLoad, LIMIT, subjectFilter);
        if (data.length < LIMIT) setHasMore(false);

        if (isReset) setTutors(data);
        else setTutors((prev) => [...prev, ...data]);
      } else {
        const data = await fetchStudentRequests(pageToLoad, LIMIT);
        if (data.length < LIMIT) setHasMore(false);

        if (isReset) setRequests(data);
        else setRequests((prev) => [...prev, ...data]);
      }
    } catch (e) {
      console.error('Failed to load data', e);
      toast.error('បរាជ័យក្នុងការផ្ទុកទិន្នន័យ។');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage);
  };

  // --- Student Actions ---

  const handleCreateRequest = async () => {
    if (!newRequest.subject || !newRequest.budget) return;
    setSubmitting(true);
    try {
      await createStudentRequest(newRequest);
      toast.success('សំណើត្រូវបានបង្កើត!');
      setShowRequestModal(false);
      setNewRequest({});
      handleRefresh();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការបង្កើតសំណើ។');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('តើអ្នកចង់លុបសំណើនេះមែនទេ?')) return;
    try {
      await deleteStudentRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success('បានលុបសំណើ។');
    } catch (e) {
      toast.error('បរាជ័យក្នុងការលុប។');
    }
  };

  // --- Tutor Actions ---

  const handleOpenApplyModal = (req: TutorRequest) => {
    if (!currentUser) {
      toast.error('សូមចូលគណនីជាមុនសិន។');
      return;
    }
    if (currentUser.id === req.studentId) {
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

  // Extract subjects for filter from loaded tutors (Client side extraction for filter list only)
  // Ideally this list should come from a static config or separate DB call for scalability,
  // but extracting from current list is okay for MVP.
  const allSubjects = Array.from(new Set(tutors.flatMap((t) => t.subjects || [])));
  const subjects = ['All', ...allSubjects];

  const isTutor = currentUser?.role === 'tutor' || currentUser?.role === 'admin';

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
            onClick={handleRefresh}
            className={`p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-primary transition-colors ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Top Toggle Switch */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 flex max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('tutors')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'tutors' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            ស្វែងរកគ្រូ (Browse Tutors)
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${activeTab === 'requests' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            សំណើសិស្ស (Requests)
          </button>
        </div>

        {activeTab === 'tutors' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 flex-shrink-0">
                <Filter className="h-4 w-4 text-gray-500" />
              </div>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    subjectFilter === s
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-xs text-gray-400">កំពុងផ្ទុកទិន្នន័យ...</p>
          </div>
        ) : activeTab === 'tutors' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tutors.length === 0 && (
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
            {tutors.map((tutor) => (
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
                  onClick={() => setShowRequestModal(true)}
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

            {requests.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">មិនទាន់មានសំណើទេ។</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <TutorRequestCard
                  key={req.id}
                  request={req}
                  isOwner={currentUser?.id === req.studentId}
                  showApply={isTutor}
                  onDelete={handleDeleteRequest}
                  onApply={handleOpenApplyModal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="pt-8 pb-4 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 flex items-center text-sm"
            >
              {loadingMore ? (
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
      {showApplyModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">ទាក់ទងសិស្ស (Contact)</h3>
              <button onClick={() => setShowApplyModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">ដាក់ពាក្យសម្រាប់</p>
              <p className="font-bold text-gray-900 text-sm">{selectedRequest.subject}</p>
              <p className="text-xs text-gray-600">{selectedRequest.grade}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  សារខ្លីៗទៅកាន់សិស្ស
                </label>
                <textarea
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="ណែនាំខ្លួនអ្នក និងបទពិសោធន៍..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                />
              </div>

              <button
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

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900">ប្រកាសសំណើសិក្សា</h3>
                <p className="text-xs text-gray-500">ស្វែងរកគ្រូដែលសាកសមនឹងអ្នក</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">មុខវិជ្ជា</label>
                <input
                  placeholder="ឧ. គណិតវិទ្យា, រូបវិទ្យា..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                  onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">កម្រិត</label>
                  <input
                    placeholder="ឧ. ថ្នាក់ទី១២"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) => setNewRequest({ ...newRequest, grade: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ថវិកា (រៀល)</label>
                  <input
                    type="number"
                    placeholder="ឧ. 20000"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                    onChange={(e) => setNewRequest({ ...newRequest, budget: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ទីតាំង</label>
                <input
                  placeholder="ទីតាំង ឬ អនឡាញ"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ព័ត៌មានលម្អិត</label>
                <textarea
                  placeholder="ពណ៌នាអំពីតម្រូវការរបស់អ្នក..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                />
              </div>
              <button
                onClick={handleCreateRequest}
                disabled={submitting}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ប្រកាសសំណើ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorListPage;
