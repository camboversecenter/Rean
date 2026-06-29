
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MissionWorkspace from '../components/MissionWorkspace';
import { fetchMissionById } from '../services/missionService';
import { getMyMissionEnrollment, enrollInMission } from '../services/missionProgressService';
import { getCurrentUser } from '../services/authService';
import { Mission, MissionModuleStatus } from '../types';
import { 
    Loader2, Users2, Target, Brain, 
    CheckCircle, PlayCircle, ChevronLeft,
    Clock, Award, Lock, DollarSign, X, Image, Share2
} from '../components/Icons';
import { formatRiel } from '../utils/formatHelper';
import { SUPABASE_URL } from '../services/supabaseClient';
import toast from 'react-hot-toast';

// Helper to construct the Edge Function URL
const getShareLink = (missionId: string) => {
    // Robust fallback to ensure we never get "undefined/functions..."
    const baseUrl = SUPABASE_URL || 'https://oficlnrazfeswkdrpzjh.supabase.co';
    // Ensure no double slashes if base url has trailing slash
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}/functions/v1/og-mission?id=${missionId}`;
};

const MissionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    // Persistence State
    const [enrollment, setEnrollment] = useState<any>(null);
    const [started, setStarted] = useState(false);
    const [pending, setPending] = useState(false);
    
    // Payment / Join State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            
            try {
                // Parallel fetch not ideal here because enrollment depends on user
                const [data, user] = await Promise.all([
                    fetchMissionById(id),
                    getCurrentUser()
                ]);
                
                setMission(data);
                setCurrentUser(user);
                
                // Only check enrollment if user is logged in
                if (user) {
                    const existingEnrollment = await getMyMissionEnrollment(id);
                    if (existingEnrollment) {
                        setEnrollment(existingEnrollment);
                        if (existingEnrollment.status === 'In Progress' || existingEnrollment.status === 'Completed') {
                            setStarted(true);
                        } else if (existingEnrollment.status === 'Pending') {
                            setPending(true);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load mission details");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleJoinClick = () => {
        if (!mission) return;
        
        // Redirect to login if guest
        if (!currentUser) {
            toast("សូមចូលគណនីដើម្បីចុះឈ្មោះ (Please login to join)", { icon: '🔒' });
            navigate('/login', { state: { from: location } });
            return;
        }

        if (mission.price > 0) {
            setShowPaymentModal(true);
        } else {
            // Direct join for free
            processEnrollment(null);
        }
    };

    const processEnrollment = async (receipt: File | null) => {
        if (!mission) return;
        if (!currentUser) return; // Guard

        setJoining(true);
        try {
            const newEnrollment = await enrollInMission(mission.id, receipt);
            setEnrollment(newEnrollment);
            
            if (newEnrollment.status === 'In Progress') {
                setStarted(true);
                toast.success("បេសកកម្មបានចាប់ផ្តើម! សូមសំណាងល្អ។", { icon: '🚀' });
            } else {
                setPending(true);
                toast.success("សំណើត្រូវបានផ្ញើ! កំពុងរង់ចាំការត្រួតពិនិត្យ។", { icon: '⏳' });
            }
            setShowPaymentModal(false);
        } catch (error: any) {
            console.error("Enrollment error:", error);
            toast.error(error.message || "មិនអាចចាប់ផ្តើមបេសកកម្មបានទេ។");
        } finally {
            setJoining(false);
        }
    };

    const handleShare = async () => {
        if (!mission) return;
        const link = getShareLink(mission.id);
        try {
            await navigator.clipboard.writeText(link);
            toast.success("បានចម្លងតំណភ្ជាប់! (Link Copied)", {
                icon: '🔗',
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        } catch (err) {
            toast.error("បរាជ័យក្នុងការចម្លង");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!mission) return <div className="p-10 text-center">រកមិនឃើញបេសកកម្ម</div>;

    // View 1: Workspace (If started)
    // Only show workspace if logged in AND started
    if (currentUser && started) {
        return (
            <>
                <div className="fixed bottom-4 left-4 z-50 md:hidden">
                     <button onClick={() => navigate(-1)} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md">
                        <ChevronLeft className="h-5 w-5" />
                     </button>
                </div>
                <MissionWorkspace 
                    mission={mission} 
                    enrollmentId={enrollment?.id}
                    initialProgress={enrollment?.progress}
                    initialProgressDetails={enrollment?.progressDetails}
                    initialSquadNote={enrollment?.squad_note}
                    squadId={enrollment?.squadId}
                />
            </>
        );
    }

    // View 2: Landing Page (Sales/Enrollment View) - Publicly Accessible
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero */}
            <div className="relative h-64 md:h-80 bg-gray-900">
                <img src={mission.thumbnail || 'https://via.placeholder.com/1200x600'} alt={mission.title} className="w-full h-full object-cover opacity-60" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button onClick={handleShare} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors" title="ចែករំលែក (Share)">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="container mx-auto max-w-4xl">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg mb-3 uppercase tracking-wide shadow-lg shadow-primary/30">
                            {mission.category} • {mission.level}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight shadow-sm">{mission.title}</h1>
                        <div className="flex items-center text-gray-300 text-sm font-medium gap-6">
                            <span className="flex items-center"><Users2 className="h-4 w-4 mr-2" /> ក្រុមសិស្ស {mission.squadSize} នាក់</span>
                            <span className="flex items-center"><Target className="h-4 w-4 mr-2" /> {mission.modules.length} មេរៀន</span>
                            <span className="flex items-center"><Brain className="h-4 w-4 mr-2" /> គ្រូ AI៖ {mission.mentor}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="font-bold text-xl text-gray-900 mb-4">សង្ខេបបេសកកម្ម (Briefing)</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{mission.description}</p>
                        </div>

                        {/* Syllabus / Modules */}
                        <div>
                            <h2 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                                <Target className="h-6 w-6 mr-2 text-primary" /> ផែនទីមេរៀន (Roadmap)
                            </h2>
                            <div className="space-y-4">
                                {mission.modules.map((mod, idx) => (
                                    <div key={mod.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start group hover:border-primary/30 transition-colors">
                                        <div className="bg-gray-100 text-gray-500 font-bold w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">{mod.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2">{mod.task}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Action Card) */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 sticky top-24">
                            <div className="mb-6 text-center">
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">តម្លៃសរុប (Total Price)</p>
                                <p className="text-3xl font-bold text-gray-900">{mission.price === 0 ? 'ឥតគិតថ្លៃ' : formatRiel(mission.price)}</p>
                            </div>

                            {pending ? (
                                <div className="w-full bg-orange-50 border border-orange-100 text-orange-700 p-4 rounded-xl text-center mb-4">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                                    <h4 className="font-bold text-sm mb-1">កំពុងរង់ចាំការអនុញ្ញាត</h4>
                                    <p className="text-xs">
                                        {mission.price > 0 ? "ការបង់ប្រាក់កំពុងត្រូវបានត្រួតពិនិត្យ។" : "អ្នកបង្កើតនឹងត្រួតពិនិត្យសំណើរបស់អ្នក។"}
                                    </p>
                                </div>
                            ) : (
                                mission.enrollmentType === 'invite_only' ? (
                                    <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 p-4 rounded-xl text-center mb-4">
                                        <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <h4 className="font-bold text-sm mb-1">សម្រាប់តែអ្នកដែលត្រូវបានអញ្ជើញ</h4>
                                        <p className="text-xs">បេសកកម្មនេះជាឯកជន។ សូមទាក់ទងអ្នកបង្កើតដើម្បីចូលរៀន។</p>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleJoinClick}
                                        disabled={joining}
                                        className={`w-full text-white font-bold py-4 rounded-xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center mb-4 group ${
                                            mission.price > 0 ? 'bg-gradient-to-r from-emerald-600 to-green-500 shadow-emerald-200' : 'bg-gray-900 shadow-gray-900/20'
                                        }`}
                                    >
                                        {joining ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (
                                            mission.price > 0 ? <DollarSign className="h-5 w-5 mr-2" /> : <PlayCircle className="h-5 w-5 mr-2" />
                                        )}
                                        {mission.price > 0 ? "បង់ប្រាក់ & ចូលរៀន" : "ស្នើសុំចូលរៀន"}
                                    </button>
                                )
                            )}
                            
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                                    <span>មតិកែលម្អពី AI (Feedback)</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                                    <span>គម្រោងជាក់ស្តែង (Portfolio)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* PAYMENT MODAL (Only shows if logged in) */}
            {showPaymentModal && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <DollarSign className="h-5 w-5 mr-1 text-green-600" /> ការទូទាត់ប្រាក់
                            </h3>
                            <button onClick={() => setShowPaymentModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        <div className="p-5 space-y-5">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">សូមបង់ប្រាក់ចំនួន</p>
                                <p className="text-2xl font-bold text-primary">{formatRiel(mission.price)}</p>
                            </div>

                            {/* QR CODE DISPLAY */}
                            {mission.paymentQrUrl ? (
                                <div className="flex justify-center">
                                    <div className="p-2 border-2 border-primary/20 rounded-xl">
                                        <img src={mission.paymentQrUrl} className="w-48 h-48 object-cover rounded-lg" alt="QR Code" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-gray-400 py-4 bg-gray-50 rounded-xl">
                                    មិនមាន QR Code ទេ។ សូមទាក់ទងអ្នកបង្កើត។
                                </div>
                            )}

                            {/* Instructions */}
                            {mission.paymentInstruction && (
                                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
                                    <p className="font-bold text-xs uppercase mb-1 opacity-70">ការណែនាំ៖</p>
                                    {mission.paymentInstruction}
                                </div>
                            )}

                            {/* Upload Receipt */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">បញ្ចូលវិក្កយបត្រ (Upload Receipt)</label>
                                <div className="relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                        onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                                    />
                                    <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors ${paymentReceipt ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                                        {paymentReceipt ? (
                                            <>
                                                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                                <p className="text-xs font-bold text-green-700">{paymentReceipt.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Image className="h-8 w-8 text-gray-300 mb-2" />
                                                <p className="text-xs text-gray-500">ចុចដើម្បីបញ្ចូលរូបភាព</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => processEnrollment(paymentReceipt)}
                                disabled={joining || !paymentReceipt}
                                className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                            >
                                {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : 'បញ្ជាក់ការបង់ប្រាក់'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MissionDetailPage;
