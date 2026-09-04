import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getBookingById,
  fetchClassroomLogs,
  createClassroomLog,
  fetchHomeworks,
  assignHomework,
  submitHomework,
  updateBookingStatus,
} from '../services/tutorService';
import { getCurrentUser } from '../services/authService';
import { TutorBooking } from '../types';
import {
  Loader2,
  CheckCircle,
  Plus,
  FileText,
  Send,
  User,
  GraduationCap,
  X,
  Video,
  LogOut,
} from '../components/Icons';
import toast from 'react-hot-toast';

const ClassroomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<TutorBooking | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTutor, setIsTutor] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'homework'>('timeline');

  // Action State
  const [newNote, setNewNote] = useState('');
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [hwForm, setHwForm] = useState({ title: '', description: '' });
  const [submitText, setSubmitText] = useState('');
  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);

  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    summary: '',
    duration: '60',
    performance: 'Good',
    nextSteps: '',
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        const bookingData = await getBookingById(id!);

        if (!bookingData) {
          toast.error('រកមិនឃើញការកក់');
          navigate('/account');
          return;
        }

        // Verify access
        if (user?.id !== bookingData.studentId && user?.id !== bookingData.tutorId) {
          toast.error('គ្មានសិទ្ធិចូលប្រើ (Unauthorized)');
          navigate('/');
          return;
        }

        setBooking(bookingData);
        setIsTutor(user?.id === bookingData.tutorId);

        // Fetch Sub-data
        const logData = await fetchClassroomLogs(id!);
        setLogs(logData);
        const hwData = await fetchHomeworks(id!);
        setHomeworks(hwData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id, navigate]);

  const handleLogSession = async (type: 'Session Start' | 'Note') => {
    if (type === 'Note' && !newNote.trim()) return;

    try {
      await createClassroomLog(id!, type, type === 'Note' ? newNote : undefined);
      setNewNote('');
      if (type === 'Session Start') toast.success('ថ្នាក់រៀនបានចាប់ផ្តើម!');

      // Refresh logs
      const freshLogs = await fetchClassroomLogs(id!);
      setLogs(freshLogs);
    } catch (e) {
      toast.error('បរាជ័យ');
    }
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportForm.summary || !reportForm.duration) {
      toast.error('សូមបំពេញសេចក្តីសង្ខេប និងរយៈពេល។');
      return;
    }
    setSubmittingReport(true);
    try {
      const reportData = JSON.stringify(reportForm);
      await createClassroomLog(id!, 'Session Report', reportData);

      toast.success('របាយការណ៍ត្រូវបានផ្ញើ! ថ្នាក់រៀនបញ្ចប់។');
      setShowReportModal(false);

      // Refresh logs
      const freshLogs = await fetchClassroomLogs(id!);
      setLogs(freshLogs);
    } catch (e) {
      toast.error('បរាជ័យក្នុងការផ្ញើរបាយការណ៍។');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleAssignHomework = async () => {
    if (!hwForm.title) return;
    try {
      await assignHomework(id!, hwForm.title, hwForm.description);
      setShowHomeworkModal(false);
      setHwForm({ title: '', description: '' });
      toast.success('បានដាក់កិច្ចការផ្ទះ');
      const freshHw = await fetchHomeworks(id!);
      setHomeworks(freshHw);
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleSubmitHomework = async (hwId: string) => {
    if (!submitText.trim()) return;
    try {
      await submitHomework(hwId, submitText);
      setSubmitText('');
      setSubmittingHwId(null);
      toast.success('បានដាក់កិច្ចការ!');
      const freshHw = await fetchHomeworks(id!);
      setHomeworks(freshHw);
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handlePayment = async () => {
    if (!window.confirm('យល់ព្រមលើរបាយការណ៍ និងបង់ប្រាក់? (Confirm Payment)')) return;
    try {
      await updateBookingStatus(id!, 'Completed');
      setBooking((prev) => (prev ? { ...prev, status: 'Completed' } : null));
      toast.success('ការបង់ប្រាក់ជោគជ័យ! អរគុណ។', { icon: '💸' });
    } catch (e) {
      toast.error('Payment failed');
    }
  };

  // Helper to parse report JSON safely
  const parseReport = (json: string) => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // Check if the latest log is a report to show Payment Button
  const latestLog = logs[0];
  const isReportPendingReview =
    !isTutor && booking?.status !== 'Completed' && latestLog?.action_type === 'Session Report';

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-surface-2 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-line-strong px-4 py-3 shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="p-2 hover:bg-surface-3 rounded-full"
            >
              <X className="h-5 w-5 text-content-muted" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-content text-lg">{booking.subject}</h1>
                {booking.status === 'Completed' && (
                  <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    បានបញ្ចប់ (Paid)
                  </span>
                )}
              </div>
              <p className="text-xs text-content-muted flex items-center">
                {isTutor ? (
                  <User className="h-3 w-3 mr-1" />
                ) : (
                  <GraduationCap className="h-3 w-3 mr-1" />
                )}
                {isTutor ? `សិស្ស: ${booking.studentName}` : `គ្រូ: ${booking.tutorName}`}
              </p>
            </div>
          </div>
          {isTutor && booking.status !== 'Completed' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLogSession('Session Start')}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-md hover:bg-green-700 transition-colors"
              >
                <Video className="h-3 w-3 mr-1.5" /> ចាប់ផ្តើម
              </button>
              <button
                type="button"
                onClick={handleOpenReportModal}
                className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-md hover:bg-red-600 transition-colors"
              >
                <LogOut className="h-3 w-3 mr-1.5" /> បញ្ចប់ & របាយការណ៍
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full flex-1 p-4 flex flex-col">
        {/* Tabs */}
        <div className="flex bg-surface rounded-xl p-1 shadow-sm border border-line mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'timeline' ? 'bg-surface-3 text-content' : 'text-content-muted'}`}
          >
            សកម្មភាព (Timeline)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('homework')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'homework' ? 'bg-surface-3 text-content' : 'text-content-muted'}`}
          >
            កិច្ចការផ្ទះ ({homeworks.filter((h) => h.status === 'Pending').length})
          </button>
        </div>

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-surface rounded-2xl shadow-sm border border-line p-4 flex-1 overflow-y-auto mb-4 min-h-[300px]">
              {logs.length === 0 && (
                <p className="text-center text-content-faint py-10 text-sm">
                  មិនទាន់មានសកម្មភាពទេ។
                </p>
              )}
              <div className="space-y-6">
                {logs.map((log) => {
                  const isReport = log.action_type === 'Session Report';
                  const reportData = isReport ? parseReport(log.note) : null;

                  if (isReport && reportData) {
                    return (
                      <div key={log.id} className="relative pl-6 border-l-2 border-primary/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                        <div className="bg-gradient-to-r from-primary/5 to-white border border-primary/10 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-primary flex items-center">
                              <FileText className="h-4 w-4 mr-2" /> របាយការណ៍បញ្ចប់ថ្នាក់
                            </h3>
                            <span className="text-[10px] text-content-faint">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-3 text-sm text-content-soft">
                            <div className="bg-surface/80 p-2 rounded-lg border border-primary/5">
                              <p className="text-xs font-bold text-content-muted uppercase mb-1">
                                សេចក្តីសង្ខេប (Summary)
                              </p>
                              <p>{reportData.summary}</p>
                            </div>

                            <div className="flex gap-4">
                              <div className="bg-surface/80 p-2 rounded-lg border border-primary/5 flex-1">
                                <p className="text-xs font-bold text-content-muted uppercase mb-1">
                                  រយៈពេល
                                </p>
                                <p className="font-bold">{reportData.duration} នាទី</p>
                              </div>
                              <div className="bg-surface/80 p-2 rounded-lg border border-primary/5 flex-1">
                                <p className="text-xs font-bold text-content-muted uppercase mb-1">
                                  ការវាយតម្លៃ
                                </p>
                                <p className="font-bold text-primary">{reportData.performance}</p>
                              </div>
                            </div>

                            {reportData.nextSteps && (
                              <div className="bg-surface/80 p-2 rounded-lg border border-primary/5">
                                <p className="text-xs font-bold text-content-muted uppercase mb-1">
                                  ជំហានបន្ទាប់
                                </p>
                                <p>{reportData.nextSteps}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={log.id} className="flex gap-3">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          log.action_type === 'Session Start' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      ></div>
                      <div>
                        <p className="text-xs font-bold text-content">
                          {log.action_type === 'Session Start' ? 'ចាប់ផ្តើមថ្នាក់' : 'កំណត់ហេតុ'}
                        </p>
                        <p className="text-xs text-content-muted mb-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.note && !isReport && (
                          <div className="bg-surface-2 p-2 rounded-lg text-sm text-content-soft">
                            {log.note}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Note Input */}
            <div className="bg-surface p-3 rounded-xl border border-line-strong flex gap-2">
              <input
                aria-label="កត់ត្រាសកម្មភាព..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="កត់ត្រាសកម្មភាព..."
                className="flex-1 bg-surface-2 rounded-lg px-3 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleLogSession('Note')}
                className="p-2 bg-gray-900 dark:bg-surface-3 text-white rounded-lg"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* HOMEWORK TAB */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            {isTutor && (
              <button
                type="button"
                onClick={() => setShowHomeworkModal(true)}
                className="w-full py-3 border-2 border-dashed border-line-strong rounded-xl text-content-muted font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" /> ដាក់កិច្ចការផ្ទះថ្មី
              </button>
            )}

            {homeworks.map((hw) => (
              <div key={hw.id} className="bg-surface rounded-xl shadow-sm border border-line p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-content">{hw.title}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      hw.status === 'Submitted'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {hw.status === 'Submitted' ? 'បានដាក់' : 'រង់ចាំ'}
                  </span>
                </div>
                <p className="text-sm text-content-muted mb-4">{hw.description}</p>

                {hw.status === 'Pending' && !isTutor && (
                  <div>
                    {submittingHwId === hw.id ? (
                      <div className="mt-3">
                        <textarea
                          aria-label="សរសេរចម្លើយ ឬដាក់ Link..."
                          className="w-full p-2 border rounded-lg text-sm mb-2"
                          placeholder="សរសេរចម្លើយ ឬដាក់ Link..."
                          value={submitText}
                          onChange={(e) => setSubmitText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSubmittingHwId(null)}
                            className="text-xs font-bold text-content-muted"
                          >
                            បោះបង់
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitHomework(hw.id)}
                            className="text-xs bg-primary text-white px-3 py-1.5 rounded font-bold"
                          >
                            បញ្ជូន
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmittingHwId(hw.id)}
                        className="text-xs bg-gray-900 dark:bg-surface-3 text-white px-3 py-2 rounded-lg font-bold w-full"
                      >
                        ដាក់កិច្ចការ (Submit)
                      </button>
                    )}
                  </div>
                )}

                {hw.status === 'Submitted' && (
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg mt-3">
                    <p className="text-xs font-bold text-green-800 dark:text-green-300 mb-1">កិច្ចការសិស្ស៖</p>
                    <p className="text-sm text-green-900 dark:text-green-200">{hw.student_attachment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PAYMENT BUTTON (Sticky Bottom) --- */}
      {isReportPendingReview && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line-strong p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-content-muted font-bold uppercase">រង់ចាំការបង់ប្រាក់</p>
              <p className="text-sm text-content-soft">សូមពិនិត្យរបាយការណ៍ខាងលើ។</p>
            </div>
            <button
              type="button"
              onClick={handlePayment}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors flex items-center animate-pulse"
            >
              <CheckCircle className="h-5 w-5 mr-2" /> យល់ព្រម & បង់ប្រាក់
            </button>
          </div>
        </div>
      )}

      {/* --- REPORT MODAL --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="bg-surface-2 px-4 py-3 border-b border-line flex justify-between items-center">
              <h3 className="font-bold text-content">បង្កើតរបាយការណ៍ (Session Report)</h3>
              <button type="button" onClick={() => setShowReportModal(false)}>
                <X className="h-5 w-5 text-content-faint" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label
                  htmlFor="report-summary"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  សេចក្តីសង្ខេបមេរៀន (Lesson Summary)
                </label>
                <textarea
                  id="report-summary"
                  className="w-full p-3 bg-surface border border-line-strong rounded-xl text-sm h-20 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="តើបានរៀនអ្វីខ្លះថ្ងៃនេះ?"
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="report-duration"
                    className="block text-xs font-bold text-content-muted mb-1"
                  >
                    រយៈពេល (នាទី)
                  </label>
                  <input
                    id="report-duration"
                    type="number"
                    className="w-full p-3 bg-surface border border-line-strong rounded-xl text-sm"
                    value={reportForm.duration}
                    onChange={(e) => setReportForm({ ...reportForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="report-performance"
                    className="block text-xs font-bold text-content-muted mb-1"
                  >
                    ការវាយតម្លៃ
                  </label>
                  <select
                    id="report-performance"
                    className="w-full p-3 bg-surface border border-line-strong rounded-xl text-sm"
                    value={reportForm.performance}
                    onChange={(e) => setReportForm({ ...reportForm, performance: e.target.value })}
                  >
                    <option value="Excellent">ល្អប្រសើរ (Excellent)</option>
                    <option value="Good">ល្អ (Good)</option>
                    <option value="Fair">មធ្យម (Fair)</option>
                    <option value="Poor">ខ្សោយ (Poor)</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="report-nextsteps"
                  className="block text-xs font-bold text-content-muted mb-1"
                >
                  ជំហានបន្ទាប់ / កិច្ចការផ្ទះ
                </label>
                <input
                  id="report-nextsteps"
                  className="w-full p-3 bg-surface border border-line-strong rounded-xl text-sm"
                  placeholder="តើត្រូវធ្វើអ្វីបន្ត?"
                  value={reportForm.nextSteps}
                  onChange={(e) => setReportForm({ ...reportForm, nextSteps: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submittingReport}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {submittingReport ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'បញ្ជូន & បញ្ចប់ថ្នាក់'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Homework Modal */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">ដាក់កិច្ចការផ្ទះ</h3>
            <input
              aria-label="ចំណងជើង"
              className="w-full p-3 border rounded-xl mb-3 text-sm"
              placeholder="ចំណងជើង"
              value={hwForm.title}
              onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
            />
            <textarea
              aria-label="ការពិពណ៌នា..."
              className="w-full p-3 border rounded-xl mb-4 text-sm h-24"
              placeholder="ការពិពណ៌នា..."
              value={hwForm.description}
              onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowHomeworkModal(false)}
                className="px-4 py-2 text-content-muted font-bold text-sm"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleAssignHomework}
                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
              >
                ដាក់កិច្ចការ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;
