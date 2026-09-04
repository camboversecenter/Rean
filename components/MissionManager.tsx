import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Loader2,
  Eye,
  X,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  BookOpen,
  CheckSquare,
  Save,
  FileText,
  ChevronRight,
  Plus,
} from './Icons';
import {
  getMissionEnrollments,
  MissionEnrollment,
  updateEnrollmentStatus,
  removeStudentFromMission,
  updateStudentSquad,
  updateStudentClass,
  getReceiptSignedUrl,
  approvePayment,
  rejectPayment,
  reviewSubmission,
  addStudentByEmail,
} from '../services/missionProgressService';
import { getMissionClasses } from '../services/missionService';
import { Mission, MissionClass } from '../types';
import MissionClassManager from './MissionClassManager';
import MarkdownText from './MarkdownText';
import toast from 'react-hot-toast';

interface MissionManagerProps {
  mission: Mission;
  currentUserId: string | null;
  onBack: () => void;
  onEdit: (mission: Mission) => void;
}

const MissionManager: React.FC<MissionManagerProps> = ({
  mission,
  currentUserId,
  onBack,
  onEdit,
}) => {
  const [state, setState] = useState({
    enrollments: [] as MissionEnrollment[],
    classes: [] as MissionClass[],
    loading: true,
    viewState: {
      activeTab: 'unassigned' as 'unassigned' | 'classes' | 'grading',
      selectedClassId: null as string | null,
      searchStudent: '',
      viewingReceipt: null as string | null,
    },
    selectedStudentId: null as string | null,
    submissionToReview: null as {
      enrollmentId: string;
      moduleId: string;
      moduleTitle: string;
      content: string;
      feedback: string;
    } | null,
    reviewFeedback: '',
    isSubmittingReview: false,
    showAddStudentModal: false,
    newStudentEmail: '',
    isAddingStudent: false,
  });

  const {
    enrollments,
    classes,
    loading,
    viewState,
    selectedStudentId,
    submissionToReview,
    reviewFeedback,
    isSubmittingReview,
    showAddStudentModal,
    newStudentEmail,
    isAddingStudent,
  } = state;

  const setViewState = (newViewState: any) =>
    setState((prev) => ({
      ...prev,
      viewState: typeof newViewState === 'function' ? newViewState(prev.viewState) : newViewState,
    }));

  const loadManagerData = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      // Load ALL enrollments initially for client-side filtering (optimization: fetch by tab later if list huge)
      const [enrollmentRes, classesRes] = await Promise.all([
        getMissionEnrollments(mission.id, 1, 500, null), // Fetching larger batch
        getMissionClasses(mission.id),
      ]);
      setState((prev) => ({ ...prev, enrollments: enrollmentRes.data, classes: classesRes }));
    } catch (e) {
      toast.error('Failed to load management data');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [mission.id]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

  // --- ACTIONS ---

  const handleUpdateStatus = async (eid: string, status: any) => {
    try {
      await updateEnrollmentStatus(eid, status);
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) => (e.id === eid ? { ...e, status } : e)),
      }));
      toast.success('Status updated');
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleApprovePayment = async (eid: string) => {
    if (!window.confirm('Confirm payment approval?')) return;
    try {
      await approvePayment(eid);
      toast.success('Payment approved');
      // Refresh data to ensure all flags update
      loadManagerData();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleRejectPayment = async (eid: string) => {
    if (!window.confirm('Reject this payment?')) return;
    try {
      await rejectPayment(eid);
      toast.success('Payment rejected');
      loadManagerData();
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleUpdateSquad = async (eid: string, squadId: number | null) => {
    try {
      await updateStudentSquad(eid, squadId);
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) =>
          e.id === eid ? { ...e, squadId: squadId || undefined } : e
        ),
      }));
      toast.success('Squad updated');
    } catch (e) {
      toast.error('Failed to update squad');
    }
  };

  const handleUpdateClass = async (eid: string, classId: string | null) => {
    try {
      await updateStudentClass(eid, classId);
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) =>
          e.id === eid
            ? {
                ...e,
                classId: classId || undefined,
                className: prev.classes.find((c) => c.id === classId)?.title,
              }
            : e
        ),
      }));
      toast.success('Class updated');
    } catch (e) {
      toast.error('Failed to update class');
    }
  };

  const handleRemove = async (eid: string) => {
    if (!window.confirm('Remove this student from the mission? This cannot be undone.')) return;
    try {
      await removeStudentFromMission(eid);
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.filter((e) => e.id !== eid),
        selectedStudentId: prev.selectedStudentId === eid ? null : prev.selectedStudentId,
      }));
      toast.success('Student removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const handleViewReceipt = async (url: string) => {
    const signedUrl = await getReceiptSignedUrl(url);
    if (signedUrl) {
      setState((prev) => ({
        ...prev,
        viewState: { ...prev.viewState, viewingReceipt: signedUrl },
      }));
    } else {
      toast.error('Could not load receipt');
    }
  };

  const handleOpenReview = (enrollment: MissionEnrollment, moduleId: string) => {
    const module = mission.modules.find((m) => m.id === moduleId);
    const detail = enrollment.progressDetails[moduleId];
    setState((prev) => ({
      ...prev,
      submissionToReview: {
        enrollmentId: enrollment.id,
        moduleId,
        moduleTitle: module?.title || 'Unknown Module',
        content: detail?.submission || 'No content',
        feedback: detail?.feedback || '',
      },
      reviewFeedback: detail?.feedback || '',
    }));
  };

  const handleSubmitReview = async (status: 'completed' | 'active') => {
    if (!submissionToReview) return;
    setState((prev) => ({ ...prev, isSubmittingReview: true }));
    try {
      await reviewSubmission(
        submissionToReview.enrollmentId,
        submissionToReview.moduleId,
        status,
        reviewFeedback
      );
      toast.success(status === 'completed' ? 'Marked as Completed!' : 'Returned for revision.');

      // Update local state
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) => {
          if (e.id === submissionToReview.enrollmentId) {
            const newDetails = {
              ...e.progressDetails,
              [submissionToReview.moduleId]: {
                status,
                submission: submissionToReview.content,
                feedback: reviewFeedback,
              },
            };
            const newProgress = { ...e.progress, [submissionToReview.moduleId]: status };
            return { ...e, progressDetails: newDetails, progress: newProgress };
          }
          return e;
        }),
        submissionToReview: null,
      }));
    } catch (e) {
      toast.error('Review failed');
    } finally {
      setState((prev) => ({ ...prev, isSubmittingReview: false }));
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) return;
    setState((prev) => ({ ...prev, isAddingStudent: true }));
    try {
      await addStudentByEmail(mission.id, newStudentEmail);
      toast.success(`Student ${newStudentEmail} added successfully`);
      setState((prev) => ({ ...prev, showAddStudentModal: false, newStudentEmail: '' }));
      loadManagerData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add student');
    } finally {
      setState((prev) => ({ ...prev, isAddingStudent: false }));
    }
  };

  // --- FILTERING ---

  const getFilteredEnrollments = () => {
    let filtered = enrollments;

    // 1. Search Filter
    if (viewState.searchStudent) {
      const lower = viewState.searchStudent.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.student?.full_name?.toLowerCase().includes(lower) ||
          e.student?.email?.toLowerCase().includes(lower)
      );
    }

    // 2. Tab Filter
    if (viewState.activeTab === 'unassigned') {
      return filtered.filter((e) => !e.classId);
    } else if (viewState.activeTab === 'classes') {
      if (!viewState.selectedClassId) return []; // Don't show students until class selected
      return filtered.filter((e) => e.classId === viewState.selectedClassId);
    } else if (viewState.activeTab === 'grading') {
      // Show any enrollment that has activity (In Progress)
      return filtered.filter((e) => e.status === 'In Progress');
    }

    return filtered;
  };

  const displayEnrollments = getFilteredEnrollments();
  const selectedStudent = enrollments.find((e) => e.id === selectedStudentId);

  // Helper function for table rows
  const renderStudentRow = (e: MissionEnrollment) => {
    const completedCount = Object.values(e.progress || {}).filter((s) => s === 'completed').length;
    const totalCount = mission.modules.length;

    return (
      <tr
        key={e.id}
        className="hover:bg-surface-2 transition-colors group border-b border-line cursor-pointer"
        onClick={() => {
          if (viewState.activeTab === 'grading')
            setState((prev) => ({ ...prev, selectedStudentId: e.id }));
        }}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={
                e.student?.avatar_url || `https://ui-avatars.com/api/?name=${e.student?.full_name}`
              }
              className="w-9 h-9 rounded-full border border-line-strong object-cover"
              alt="Avatar"
            />
            <div>
              <div className="font-bold text-content">{e.student?.full_name || 'Unknown'}</div>
              <div className="text-[10px] text-content-faint">{e.student?.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div onClick={(ev) => ev.stopPropagation()}>
            <select
              aria-label="Update Status"
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none ${
                e.status === 'In Progress'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : e.status === 'Pending'
                    ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                    : e.status === 'Completed'
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              }`}
              value={e.status}
              onChange={(ev) => handleUpdateStatus(e.id, ev.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">Active</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </td>
        {viewState.activeTab === 'unassigned' && (
          <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
            {e.paymentStatus === 'pending' ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-orange-600 font-bold flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> Review Needed
                </span>
                <div className="flex gap-1">
                  {e.paymentReceiptUrl && (
                    <button
                      type="button"
                      onClick={() => handleViewReceipt(e.paymentReceiptUrl!)}
                      className="p-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100"
                      title="View Receipt"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleApprovePayment(e.id)}
                    className="p-1 bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded hover:bg-green-100"
                    title="Approve"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectPayment(e.id)}
                    className="p-1 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded hover:bg-red-100"
                    title="Reject"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : e.paymentStatus === 'paid' ? (
              <span className="text-[10px] font-bold text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> Paid
              </span>
            ) : e.paymentStatus === 'rejected' ? (
              <span className="text-[10px] font-bold text-red-500">Rejected</span>
            ) : (
              <span className="text-[10px] text-content-faint">Free/None</span>
            )}
          </td>
        )}
        <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
          <input
            type="number"
            aria-label="Squad ID"
            className="w-16 p-1.5 border border-line-strong rounded-lg text-xs text-center focus:ring-2 focus:ring-primary/20 outline-none"
            value={e.squadId || ''}
            onChange={(ev) =>
              handleUpdateSquad(e.id, ev.target.value ? parseInt(ev.target.value) : null)
            }
            placeholder="-"
          />
        </td>
        {viewState.activeTab !== 'grading' && (
          <td className="px-6 py-4" onClick={(ev) => ev.stopPropagation()}>
            <select
              aria-label="Assign Class"
              className="w-32 text-xs p-1.5 border border-line-strong rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 outline-none truncate"
              value={e.classId || ''}
              onChange={(ev) => handleUpdateClass(e.id, ev.target.value || null)}
            >
              <option value="">Unassigned</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </td>
        )}
        {viewState.activeTab === 'grading' && (
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  setState((prev) => ({ ...prev, selectedStudentId: e.id }));
                }}
                className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileText className="h-3 w-3 mr-1.5" />
                Gradebook
              </button>
              <span className="text-[10px] font-bold text-content-muted bg-surface-3 px-2 py-1 rounded border border-line-strong">
                {completedCount} / {totalCount}
              </span>
            </div>
          </td>
        )}
        <td className="px-6 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleRemove(e.id)}
            className="p-2 text-content-faint hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Student"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-surface-2 pb-24 pt-6 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="bg-surface p-2.5 hover:bg-surface-3 rounded-xl border border-line-strong shadow-sm transition-colors text-content-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-content leading-tight">{mission.title}</h1>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded font-bold uppercase">
                  {mission.level}
                </span>
              </div>
              <p className="text-sm text-content-muted mt-1 flex items-center">
                <Users className="h-4 w-4 mr-1" /> {enrollments.length} Total Students
              </p>
            </div>
          </div>
          {/* Removed Edit Button */}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-surface p-1 rounded-xl border border-line-strong w-fit">
          <button
            type="button"
            onClick={() => setViewState((prev: any) => ({ ...prev, activeTab: 'unassigned' }))}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${viewState.activeTab === 'unassigned' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            <Users className="h-4 w-4 mr-2" /> សិស្សថ្មី (Unassigned)
          </button>
          <button
            type="button"
            onClick={() => setViewState((prev: any) => ({ ...prev, activeTab: 'classes' }))}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${viewState.activeTab === 'classes' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            <BookOpen className="h-4 w-4 mr-2" /> ថ្នាក់រៀន (Classes)
          </button>
          <button
            type="button"
            onClick={() => setViewState((prev: any) => ({ ...prev, activeTab: 'grading' }))}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center ${viewState.activeTab === 'grading' ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content-soft'}`}
          >
            <CheckSquare className="h-4 w-4 mr-2" /> ដាក់ពិន្ទុ (Grading)
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT PANEL (Only for Classes Tab) */}
          {viewState.activeTab === 'classes' && (
            <div className="lg:col-span-1">
              <MissionClassManager
                missionId={mission.id}
                classes={classes}
                selectedClassId={viewState.selectedClassId}
                onSelectClass={(classId) =>
                  setViewState((prev: any) => ({ ...prev, selectedClassId: classId }))
                }
                onUpdate={loadManagerData}
              />
            </div>
          )}

          {/* RIGHT PANEL (Data Table) */}
          <div className={viewState.activeTab === 'classes' ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden flex flex-col min-h-[500px]">
              {/* Toolbar */}
              <div className="p-4 border-b border-line flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-2/50">
                <h3 className="font-bold text-content text-lg flex items-center">
                  {viewState.activeTab === 'unassigned'
                    ? 'សិស្សមិនទាន់មានថ្នាក់'
                    : viewState.activeTab === 'classes'
                      ? viewState.selectedClassId
                        ? `សិស្សក្នុងថ្នាក់ ${classes.find((c) => c.id === viewState.selectedClassId)?.title}`
                        : 'សូមជ្រើសរើសថ្នាក់'
                      : 'បញ្ជីសិស្ស (Click to Grade)'}
                  <span className="ml-2 bg-line-strong text-content-muted text-xs px-2 py-0.5 rounded-full">
                    {displayEnrollments.length}
                  </span>
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Add Student Button */}
                  <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, showAddStudentModal: true }))}
                    className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Student
                  </button>
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-content-faint" />
                    <label htmlFor="searchStudent" className="sr-only">
                      ស្វែងរកសិស្ស
                    </label>
                    <input
                      id="searchStudent"
                      type="text"
                      placeholder="ស្វែងរកសិស្ស..."
                      className="w-full pl-9 pr-4 py-2 border border-line-strong rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface"
                      value={viewState.searchStudent}
                      onChange={(e) =>
                        setViewState((prev: any) => ({ ...prev, searchStudent: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                {viewState.activeTab === 'classes' && !viewState.selectedClassId ? (
                  <div className="flex flex-col items-center justify-center h-64 text-content-faint">
                    <BookOpen className="h-12 w-12 mb-2 opacity-20" />
                    <p>សូមជ្រើសរើសថ្នាក់រៀននៅខាងឆ្វេង</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-surface-2 text-content-muted font-bold text-xs uppercase sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Status</th>
                        {viewState.activeTab === 'unassigned' && (
                          <th className="px-6 py-4">Payment</th>
                        )}
                        <th className="px-6 py-4">Squad</th>
                        {viewState.activeTab !== 'grading' && <th className="px-6 py-4">Class</th>}
                        {viewState.activeTab === 'grading' && (
                          <th className="px-6 py-4">Actions</th>
                        )}
                        <th className="px-6 py-4 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-20">
                            <Loader2 className="animate-spin h-8 w-8 mx-auto text-content-faint" />
                          </td>
                        </tr>
                      ) : displayEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-20 text-content-faint">
                            No students found in this view.
                          </td>
                        </tr>
                      ) : (
                        displayEnrollments.map(renderStudentRow)
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal (Quick View) */}
      {viewState.viewingReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setViewState((prev: any) => ({ ...prev, viewingReceipt: null }))}
        >
          <div className="relative max-w-2xl w-full">
            <img
              src={viewState.viewingReceipt}
              className="w-full h-auto rounded-xl shadow-2xl"
              alt="Receipt"
            />
            <button
              type="button"
              onClick={() => setViewState((prev: any) => ({ ...prev, viewingReceipt: null }))}
              className="absolute -top-12 right-0 text-white flex items-center hover:text-content-faint transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}

      {/* STUDENT GRADEBOOK MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-surface-2 border-b border-line p-5 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedStudent.student?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${selectedStudent.student?.full_name}`
                  }
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  alt="Avatar"
                />
                <div>
                  <h3 className="font-bold text-lg text-content leading-tight">
                    {selectedStudent.student?.full_name}
                  </h3>
                  <p className="text-xs text-content-muted">{selectedStudent.student?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-surface border border-line-strong px-2 py-0.5 rounded text-content-muted">
                      Squad {selectedStudent.squadId || '-'}
                    </span>
                    {selectedStudent.className && (
                      <span className="text-[10px] bg-surface border border-line-strong px-2 py-0.5 rounded text-content-muted">
                        {selectedStudent.className}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, selectedStudentId: null }))}
                  className="text-content-faint hover:text-content-muted p-1"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Payment Status in Gradebook */}
                <div className="flex items-center gap-2">
                  {selectedStudent.paymentReceiptUrl && (
                    <button
                      type="button"
                      onClick={() => handleViewReceipt(selectedStudent.paymentReceiptUrl!)}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded flex items-center hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Receipt
                    </button>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      selectedStudent.paymentStatus === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : selectedStudent.paymentStatus === 'pending'
                          ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                          : 'bg-surface-3 text-content-muted'
                    }`}
                  >
                    {selectedStudent.paymentStatus === 'paid'
                      ? 'Paid'
                      : selectedStudent.paymentStatus === 'pending'
                        ? 'Pending Payment'
                        : 'No Payment'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                Modules Progress
              </h4>
              {mission.modules.map((m, idx) => {
                const status = selectedStudent.progress[m.id];
                const detail = selectedStudent.progressDetails[m.id];
                const hasSubmission = detail?.submission && detail.submission.length > 0;
                const isPassed = status === 'completed';

                return (
                  <div
                    key={m.id}
                    className={`border rounded-xl p-4 transition-colors ${isPassed ? 'bg-green-50/50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-surface border-line hover:border-line-strong'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPassed ? 'bg-green-500 text-white' : 'bg-surface-3 text-content-muted'}`}
                        >
                          {isPassed ? <CheckCircle className="h-3 w-3" /> : idx + 1}
                        </div>
                        <h5
                          className={`font-bold text-sm ${isPassed ? 'text-green-900 dark:text-green-300' : 'text-content'}`}
                        >
                          {m.title}
                        </h5>
                      </div>

                      {hasSubmission ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(selectedStudent, m.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center ${
                            isPassed
                              ? 'bg-surface text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30'
                              : 'bg-primary text-white hover:bg-primary/90'
                          }`}
                        >
                          {isPassed ? 'View Result' : 'Review & Grade'}{' '}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-content-faint font-medium bg-surface-2 px-2 py-1 rounded">
                          No Submission
                        </span>
                      )}
                    </div>

                    {/* Quick Summary if Passed */}
                    {isPassed && detail?.feedback && (
                      <div className="ml-9 text-xs text-green-700 dark:text-green-300 bg-green-100/50 dark:bg-green-900/30 p-2 rounded-lg border border-green-100 dark:border-green-800">
                        <p className="line-clamp-2">{detail.feedback.replace(/\*\*/g, '')}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submission Review Modal (Stacked on top of Gradebook) */}
      {submissionToReview && selectedStudent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-line bg-surface-2 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-lg text-content">
                  Review: {submissionToReview.moduleTitle}
                </h3>
                <p className="text-xs text-content-muted">
                  Student: {selectedStudent.student?.full_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, submissionToReview: null }))}
              >
                <X className="h-6 w-6 text-content-faint" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-content-muted uppercase mb-2">
                  Student Submission
                </h4>
                <div className="bg-surface-2 p-4 rounded-xl border border-line-strong text-sm leading-relaxed whitespace-pre-wrap font-mono text-content">
                  {submissionToReview.content}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-content-muted uppercase mb-2">
                  Mentor Feedback
                </h4>
                <textarea
                  className="w-full p-4 border border-line-strong rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[150px]"
                  placeholder="Write your feedback here..."
                  value={reviewFeedback}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, reviewFeedback: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="p-4 border-t border-line bg-surface-2 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => handleSubmitReview('active')}
                disabled={isSubmittingReview}
                className="px-5 py-2.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 font-bold rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/70 disabled:opacity-50"
              >
                Request Changes
              </button>
              <button
                type="button"
                onClick={() => handleSubmitReview('completed')}
                disabled={isSubmittingReview}
                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isSubmittingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Pass & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add Student Manually</h3>
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, showAddStudentModal: false }))}
              >
                <X className="h-5 w-5 text-content-faint" />
              </button>
            </div>
            <p className="text-sm text-content-muted mb-4">
              Enter the email of the student you want to enroll. They must have a REAN account.
            </p>
            <label htmlFor="newStudentEmailInput" className="sr-only">
              Student Email
            </label>
            <input
              id="newStudentEmailInput"
              className="w-full p-3 border border-line-strong rounded-xl text-sm mb-4 focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="student@example.com"
              value={newStudentEmail}
              onChange={(e) => setState((prev) => ({ ...prev, newStudentEmail: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, showAddStudentModal: false }))}
                className="px-4 py-2 text-content-muted font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStudent}
                disabled={isAddingStudent || !newStudentEmail.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center disabled:opacity-50"
              >
                {isAddingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionManager;
