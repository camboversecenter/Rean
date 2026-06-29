
import React, { useEffect, useState } from 'react';
import { 
    Target, Plus, Edit, Trash2, Zap, 
    Loader2, Users, PlayCircle,
    Gift,
} from '../components/Icons';
import { 
    getMyMissions, createMission, updateMission, deleteMission
} from '../services/missionService';
import { 
    getMissionEnrollmentCount
} from '../services/missionProgressService';
import { uploadFile } from '../services/storageService';
import { getCurrentUser } from '../services/authService';
import { Mission, MissionCategory } from '../types';
import MissionForm from '../components/MissionForm';
import MissionManager from '../components/MissionManager';
import MysteryBoxManager from '../components/MysteryBoxManager';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const base64ToBlob = (base64: string, mimeType: string = 'image/png') => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

const CreatorDashboard: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [dashboardTab, setDashboardTab] = useState<'missions' | 'rewards'>('missions');
    const [view, setView] = useState<'list' | 'editor' | 'manager'>('list');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentMission, setCurrentMission] = useState<Partial<Mission>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const user = await getCurrentUser();
        if (user) setCurrentUserId(user.id);
        const missionsData = await getMyMissions();
        setMissions(missionsData);
        setLoading(false);
    };

    const handleCreateNewMission = () => {
        setCurrentMission({
            title: '',
            category: MissionCategory.TECH,
            level: 'Beginner',
            price: 0,
            squadSize: 3,
            squadCreation: 'auto',
            enrollmentType: 'open',
            description: '',
            modules: []
        });
        setView('editor');
    };

    const handleEditMission = (mission: Mission) => {
        setCurrentMission(mission);
        setView('editor');
    };

    const handleManageMission = (mission: Mission) => {
        setCurrentMission(mission);
        setView('manager');
    };

    const handleSaveMission = async (payload: Partial<Mission>, thumbFile: File | null, thumbBase64: string | null, qrFile: File | null) => {
        setIsSaving(true);
        try {
            let thumbUrl = payload.thumbnail || '';
            let qrUrl = payload.paymentQrUrl || '';
            
            if (thumbBase64) {
                const blob = base64ToBlob(thumbBase64);
                thumbUrl = (await uploadFile(blob, 'missions')) || thumbUrl;
            } else if (thumbFile) {
                thumbUrl = (await uploadFile(thumbFile, 'missions')) || thumbUrl;
            }

            if (qrFile) {
                qrUrl = (await uploadFile(qrFile, 'mission-qrs')) || qrUrl;
            }

            const finalPayload = { ...payload, thumbnail: thumbUrl, paymentQrUrl: qrUrl };

            if (payload.id) {
                await updateMission(payload.id, finalPayload);
                toast.success("បេសកកម្មត្រូវបានកែប្រែ!");
            } else {
                await createMission(finalPayload);
                toast.success("បេសកកម្មត្រូវបានបង្កើត!");
            }

            await loadData();
            setView('list');
        } catch (error) {
            console.error(error);
            toast.error("បរាជ័យក្នុងការរក្សាទុក។");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMission = async (id: string) => {
        const count = await getMissionEnrollmentCount(id);
        if (count > 0) {
            toast.error(`មិនអាចលុបបានទេ! មានសិស្ស ${count} នាក់កំពុងសិក្សា។`);
            return;
        }

        if (!window.confirm("តើអ្នកពិតជាចង់លុបបេសកកម្មនេះមែនទេ?")) return;
        try {
            await deleteMission(id);
            setMissions(prev => prev.filter(m => m.id !== id));
            toast.success("បានលុបបេសកកម្ម");
        } catch (e) {
            toast.error("បរាជ័យក្នុងការលុប");
        }
    };

    if (view === 'editor') {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 pt-6 px-4">
                <MissionForm 
                    initialMission={currentMission}
                    currentUserId={currentUserId}
                    isSaving={isSaving}
                    onSave={handleSaveMission}
                    onCancel={() => setView('list')}
                />
            </div>
        );
    }

    if (view === 'manager') {
        return <MissionManager 
            mission={currentMission as Mission} 
            currentUserId={currentUserId}
            onBack={() => setView('list')} 
            onEdit={() => setView('editor')} 
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Zap className="h-6 w-6 mr-2 text-secondary fill-secondary" />
                            ស្ទូឌីយោអ្នកបង្កើត (Creator Studio)
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">គ្រប់គ្រងបេសកកម្ម និងរង្វាន់របស់អ្នក។</p>
                    </div>
                </div>

                <div className="flex space-x-4 mb-8 border-b border-gray-200">
                    <button onClick={() => setDashboardTab('missions')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center ${dashboardTab === 'missions' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Target className="h-4 w-4 mr-2" /> បេសកកម្ម
                    </button>
                    <button onClick={() => setDashboardTab('rewards')} className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center ${dashboardTab === 'rewards' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <Gift className="h-4 w-4 mr-2" /> រង្វាន់
                    </button>
                </div>

                {dashboardTab === 'rewards' ? (
                    <MysteryBoxManager />
                ) : (
                    loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-300 h-8 w-8" /></div>
                    ) : (
                        <>
                            <div className="flex justify-end mb-4">
                                <button onClick={handleCreateNewMission} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center hover:scale-105 transition-transform text-sm">
                                    <Plus className="h-4 w-4 mr-2" /> បង្កើតបេសកកម្ម
                                </button>
                            </div>

                            {missions.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                                    <h3 className="font-bold text-gray-900 text-lg">មិនទាន់មានបេសកកម្ម</h3>
                                    <button onClick={handleCreateNewMission} className="text-primary font-bold hover:underline">ចាប់ផ្តើម</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {missions.map(m => {
                                        const isOwner = m.ownerId === currentUserId;
                                        const isMentor = m.mentorId === currentUserId;
                                        const canEdit = isOwner || isMentor;

                                        return (
                                            <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col relative">
                                                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold z-10 ${isOwner ? 'bg-black/60 text-white' : 'bg-green-500 text-white'}`}>
                                                    {isOwner ? 'Owner' : 'Teacher'}
                                                </div>
                                                <div className="relative h-40 bg-gray-100">
                                                    <img src={m.thumbnail || 'https://via.placeholder.com/400x200'} alt={m.title} className="w-full h-full object-cover" />
                                                    {canEdit && (
                                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleEditMission(m)} className="bg-white p-2 rounded-full shadow-sm hover:text-blue-600" title="Edit"><Edit className="h-4 w-4" /></button>
                                                            {isOwner && (
                                                                <button onClick={() => handleDeleteMission(m.id)} className="bg-white p-2 rounded-full shadow-sm hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">{m.level}</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded">{m.modules?.length || 0} Modules</span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{m.title}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{m.description}</p>
                                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                                        <button onClick={() => handleManageMission(m)} className="bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center hover:bg-gray-200 transition-colors">
                                                            <Users className="h-3.5 w-3.5 mr-1.5" /> គ្រប់គ្រង
                                                        </button>
                                                        <Link to={`/mission/${m.id}`} className="bg-primary/10 text-primary py-2 rounded-lg font-bold text-xs flex items-center justify-center hover:bg-primary/20 transition-colors">
                                                            <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> មើលជាមុន
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default CreatorDashboard;
