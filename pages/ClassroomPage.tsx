import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, fetchClassroomLogs, createClassroomLog, fetchHomeworks, assignHomework, submitHomework, updateBookingStatus } from '../services/tutorService';
import { getCurrentUser } from '../services/authService';
import { TutorBooking } from '../types';
import { Loader2, Clock, CheckCircle, Plus, FileText, Send, User, GraduationCap, X, Calendar, Video, LogOut, Star, DollarSign, ChevronRight } from '../components/Icons';
import { formatRiel } from '../utils/formatHelper';
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
        nextSteps: ''
    });
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const user = await getCurrentUser();
            const bookingData = await getBookingById(id!);
            
            if (!bookingData) {
                toast.error("រកមិនឃើញការកក់");
                navigate('/account');
                return;
            }

            // Verify access
            if (user?.id !== bookingData.studentId && user?.id !== bookingData.tutorId) {
                toast.error("គ្មានសិទ្ធិចូលប្រើ (Unauthorized)");
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

    const handleLogSession = async (type: 'Session Start' | 'Note') => {
        if (type === 'Note' && !newNote.trim()) return;
        
        try {
            await createClassroomLog(id!, type, type === 'Note' ? newNote : undefined);
            setNewNote('');
            if (type === 'Session Start') toast.success("ថ្នាក់រៀនបានចាប់ផ្តើម!");
            
            // Refresh logs
            const freshLogs = await fetchClassroomLogs(id!);
            setLogs(freshLogs);
        } catch (e) {
            toast.error("បរាជ័យ");
        }
    };

    const handleOpenReportModal = () => {
        setShowReportModal(true);
    };

    const handleSubmitReport = async () => {
        if (!reportForm.summary || !reportForm.duration) {
            toast.error("សូមបំពេញសេចក្តីសង្ខេប និងរយៈពេល។");
            return;
        }
        setSubmittingReport(true);
        try {
            const reportData = JSON.stringify(reportForm);
            await createClassroomLog(id!, 'Session Report', reportData);
            
            toast.success("របាយការណ៍ត្រូវបានផ្ញើ! ថ្នាក់រៀនបញ្ចប់។");
            setShowReportModal(false);
            
            // Refresh logs
            const freshLogs = await fetchClassroomLogs(id!);
            setLogs(freshLogs);
        } catch (e) {
            toast.error("បរាជ័យក្នុងការផ្ញើរបាយការណ៍។");
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
            toast.success("បានដាក់កិច្ចការផ្ទះ");
            const freshHw = await fetchHomeworks(id!);
            setHomeworks(freshHw);
        } catch (e) {
            toast.error("Failed");
        }
    };

    const handleSubmitHomework = async (hwId: string) => {
        if (!submitText.trim()) return;
        try {
            await submitHomework(hwId, submitText);
            setSubmitText('');
            setSubmittingHwId(null);
            toast.success("បានដាក់កិច្ចការ!");
            const freshHw = await fetchHomeworks(id!);
            setHomeworks(freshHw);
        } catch (e) {
            toast.error("Failed");
        }
    };

    const handlePayment = async () => {
        if (!window.confirm("យល់ព្រមលើរបាយការណ៍ និងបង់ប្រាក់? (Confirm Payment)")) return;
        try {
            await updateBookingStatus(id!, 'Completed');
            setBooking(prev => prev ? ({...prev, status: 'Completed'}) : null);
            toast.success("ការបង់ប្រាក់ជោគជ័យ! អរគុណ។", { icon: '💸' });
        } catch (e) {
            toast.error("Payment failed");
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
    const isReportPendingReview = !isTutor && booking?.status !== 'Completed' && latestLog?.action_type === 'Session Report';

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8"/></div>;
    if (!booking) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/account')} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5 text-gray-500" /></button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-gray-900 text-lg">{booking.subject}</h1>
                                {booking.status === 'Completed' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">បានបញ្ចប់ (Paid)</span>}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center">
                                {isTutor ? <User className="h-3 w-3 mr-1" /> : <GraduationCap className="h-3 w-3 mr-1" />}
                                {isTutor ? `សិស្ស: ${booking.studentName}` : `គ្រូ: ${booking.tutorName}`}
                            </p>
                        </div>
                    </div>
                    {isTutor && booking.status !== 'Completed' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleLogSession('Session Start')}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center shadow-md hover:bg-green-700 transition-colors"
                            >
                                <Video className="h-3 w-3 mr-1.5" /> ចាប់ផ្តើម
                            </button>
                            <button 
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
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-4">
                    <button 
                        onClick={() => setActiveTab('timeline')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'timeline' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                    >
                        សកម្មភាព (Timeline)
                    </button>
                    <button 
                        onClick={() => setActiveTab('homework')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'homework' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                    >
                        កិច្ចការផ្ទះ ({homeworks.filter(h => h.status === 'Pending').length})
                    </button>
                </div>

                {/* TIMELINE TAB */}
                {activeTab === 'timeline' && (
                    <div className="flex-1 flex flex-col">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1 overflow-y-auto mb-4 min-h-[300px]">
                            {logs.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">មិនទាន់មានសកម្មភាពទេ។</p>}
                            <div className="space-y-6">
                                {logs.map(log => {
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
                                                        <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                                    </div>
                                                    
                                                    <div className="space-y-3 text-sm text-gray-700">
                                                        <div className="bg-white/80 p-2 rounded-lg border border-primary/5">
                                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">សេចក្តីសង្ខេប (Summary)</p>
                                                            <p>{reportData.summary}</p>
                                                        </div>
                                                        
                                                        <div className="flex gap-4">
                                                            <div className="bg-white/80 p-2 rounded-lg border border-primary/5 flex-1">
                                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">រយៈពេល</p>
                                                                <p className="font-bold">{reportData.duration} នាទី</p>
                                                            </div>
                                                            <div className="bg-white/80 p-2 rounded-lg border border-primary/5 flex-1">
                                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">ការវាយតម្លៃ</p>
                                                                <p className="font-bold text-primary">{reportData.performance}</p>
                                                            </div>
                                                        </div>

                                                        {reportData.nextSteps && (
                                                            <div className="bg-white/80 p-2 rounded-lg border border-primary/5">
                                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">ជំហានបន្ទាប់</p>
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
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                                log.action_type === 'Session Start' ? 'bg-green-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">
                                                    {log.action_type === 'Session Start' ? 'ចាប់ផ្តើមថ្នាក់' : 'កំណត់ហេតុ'}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-1">{new Date(log.created_at).toLocaleString()}</p>
                                                {log.note && !isReport && <div className="bg-gray-50 p-2 rounded-lg text-sm text-gray-700">{log.note}</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Note Input */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 flex gap-2">
                            <input 
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="កត់ត្រាសកម្មភាព..."
                                className="flex-1 bg-gray-50 rounded-lg px-3 text-sm focus:outline-none"
                            />
                            <button onClick={() => handleLogSession('Note')} className="p-2 bg-gray-900 text-white rounded-lg">
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
                                onClick={() => setShowHomeworkModal(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
                            >
                                <Plus className="h-4 w-4 mr-2" /> ដាក់កិច្ចការផ្ទះថ្មី
                            </button>
                        )}

                        {homeworks.map(hw => (
                            <div key={hw.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900">{hw.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                        hw.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>{hw.status === 'Submitted' ? 'បានដាក់' : 'រង់ចាំ'}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{hw.description}</p>
                                
                                {hw.status === 'Pending' && !isTutor && (
                                    <div>
                                        {submittingHwId === hw.id ? (
                                            <div className="mt-3">
                                                <textarea 
                                                    className="w-full p-2 border rounded-lg text-sm mb-2"
                                                    placeholder="សរសេរចម្លើយ ឬដាក់ Link..."
                                                    value={submitText}
                                                    onChange={e => setSubmitText(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSubmittingHwId(null)} className="text-xs font-bold text-gray-500">បោះបង់</button>
                                                    <button onClick={() => handleSubmitHomework(hw.id)} className="text-xs bg-primary text-white px-3 py-1.5 rounded font-bold">បញ្ជូន</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setSubmittingHwId(hw.id)} className="text-xs bg-gray-900 text-white px-3 py-2 rounded-lg font-bold w-full">ដាក់កិច្ចការ (Submit)</button>
                                        )}
                                    </div>
                                )}

                                {hw.status === 'Submitted' && (
                                    <div className="bg-green-50 p-3 rounded-lg mt-3">
                                        <p className="text-xs font-bold text-green-800 mb-1">កិច្ចការសិស្ស៖</p>
                                        <p className="text-sm text-green-900">{hw.student_attachment}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- PAYMENT BUTTON (Sticky Bottom) --- */}
            {isReportPendingReview && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">រង់ចាំការបង់ប្រាក់</p>
                            <p className="text-sm text-gray-700">សូមពិនិត្យរបាយការណ៍ខាងលើ។</p>
                        </div>
                        <button 
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
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">បង្កើតរបាយការណ៍ (Session Report)</h3>
                            <button onClick={() => setShowReportModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">សេចក្តីសង្ខេបមេរៀន (Lesson Summary)</label>
                                <textarea 
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm h-20 resize-none focus:ring-2 focus:ring-primary/20 outline-none" 
                                    placeholder="តើបានរៀនអ្វីខ្លះថ្ងៃនេះ?"
                                    value={reportForm.summary}
                                    onChange={e => setReportForm({...reportForm, summary: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">រយៈពេល (នាទី)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm"
                                        value={reportForm.duration}
                                        onChange={e => setReportForm({...reportForm, duration: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">ការវាយតម្លៃ</label>
                                    <select 
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm"
                                        value={reportForm.performance}
                                        onChange={e => setReportForm({...reportForm, performance: e.target.value})}
                                    >
                                        <option value="Excellent">ល្អប្រសើរ (Excellent)</option>
                                        <option value="Good">ល្អ (Good)</option>
                                        <option value="Fair">មធ្យម (Fair)</option>
                                        <option value="Poor">ខ្សោយ (Poor)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">ជំហានបន្ទាប់ / កិច្ចការផ្ទះ</label>
                                <input 
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm" 
                                    placeholder="តើត្រូវធ្វើអ្វីបន្ត?"
                                    value={reportForm.nextSteps}
                                    onChange={e => setReportForm({...reportForm, nextSteps: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleSubmitReport}
                                disabled={submittingReport}
                                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                            >
                                {submittingReport ? <Loader2 className="h-5 w-5 animate-spin" /> : 'បញ្ជូន & បញ្ចប់ថ្នាក់'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Homework Modal */}
            {showHomeworkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">ដាក់កិច្ចការផ្ទះ</h3>
                        <input className="w-full p-3 border rounded-xl mb-3 text-sm" placeholder="ចំណងជើង" value={hwForm.title} onChange={e => setHwForm({...hwForm, title: e.target.value})} />
                        <textarea className="w-full p-3 border rounded-xl mb-4 text-sm h-24" placeholder="ការពិពណ៌នា..." value={hwForm.description} onChange={e => setHwForm({...hwForm, description: e.target.value})} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowHomeworkModal(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">បោះបង់</button>
                            <button onClick={handleAssignHomework} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">ដាក់កិច្ចការ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomPage;