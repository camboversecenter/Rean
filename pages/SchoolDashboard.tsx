
import React, { useEffect, useState } from 'react';
import { 
    Building2, GraduationCap, BookOpen, 
    Plus, Loader2,
    MessageCircle, CheckCircle, Layout,
    Calendar, User, Phone
} from '../components/Icons';
import { 
    getMySchool, updateSchoolProfile, createMySchool,
    getMyInquiries,
    getSchoolEnrollments
} from '../services/schoolService';
import { uploadFile, deleteFileFromUrl } from '../services/storageService';
import { School, SchoolInquiry } from '../types';
import SchoolForm from '../components/SchoolForm';
import SchoolAdmissionManager from '../components/SchoolAdmissionManager';
import SchoolInquiryManager from '../components/SchoolInquiryManager';
import SchoolEnrollmentManager from '../components/SchoolEnrollmentManager';
import SchoolCourseManager from '../components/SchoolCourseManager';
import toast from 'react-hot-toast';

const SchoolDashboard: React.FC = () => {
    const [school, setSchool] = useState<School | null>(null);
    const [inquiries, setInquiries] = useState<SchoolInquiry[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'admissions' | 'courses' | 'leads' | 'enrollments'>('profile');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const schoolData = await getMySchool();
            setSchool(schoolData);
            if (schoolData) {
                const [leads, apps] = await Promise.all([
                    getMyInquiries(schoolData.id),
                    getSchoolEnrollments(schoolData.id)
                ]);
                setInquiries(leads);
                setEnrollments(apps);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCreateSchool = async () => {
        setSaving(true);
        try {
            const newSchool = await createMySchool("សាលារបស់ខ្ញុំ (My School)");
            setSchool(newSchool);
            toast.success("បានបង្កើតសាលារៀនជោគជ័យ!");
            await loadData();
        } catch (e: any) { toast.error(e.message || "បរាជ័យក្នុងការបង្កើតសាលា។"); } finally { setSaving(false); }
    };

    const handleSaveProfile = async (updates: Partial<School>, files: { logo: File | Blob | null, cover: File | Blob | null }) => {
        if (!school) return;
        setSaving(true);
        try {
            let logoUrl = school.logo;
            let coverUrl = school.coverImage;

            if (files.logo) {
                if (logoUrl?.includes('supabase')) await deleteFileFromUrl(logoUrl);
                logoUrl = (await uploadFile(files.logo, 'school-logos')) || logoUrl;
            }
            
            if (files.cover) {
                if (coverUrl?.includes('supabase')) await deleteFileFromUrl(coverUrl);
                coverUrl = (await uploadFile(files.cover, 'school-covers')) || coverUrl;
            }

            await updateSchoolProfile(school.id, { ...updates, logo: logoUrl, coverImage: coverUrl });
            toast.success("រក្សាទុកជោគជ័យ!");
            await loadData();
        } catch (e) { 
            toast.error("បរាជ័យក្នុងការរក្សាទុក"); 
        } finally { 
            setSaving(false); 
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8"/></div>;
    
    if (!school) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <Building2 className="h-16 w-16 mx-auto text-gray-200 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">មិនទាន់មានព័ត៌មានសាលារៀន</h2>
                    <p className="text-gray-500 text-sm mb-6">អ្នកមិនទាន់បានបង្កើតទំព័រសាលារៀននៅឡើយទេ។</p>
                    <button onClick={handleCreateSchool} disabled={saving} className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                        {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                        បង្កើតសាលារៀនឥឡូវនេះ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Nav Bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center"><Building2 className="h-5 w-5 mr-2 text-primary" />គ្រប់គ្រងសាលា</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Custom Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    {[
                        { id: 'profile', icon: Layout, label: 'ប្រវត្តិរូប' },
                        { id: 'admissions', icon: GraduationCap, label: 'ការជ្រើសរើស' },
                        { id: 'courses', icon: BookOpen, label: 'វគ្គសិក្សា' },
                        { id: 'leads', icon: MessageCircle, label: 'សំណួរ' },
                        { id: 'enrollments', icon: CheckCircle, label: 'ការចុះឈ្មោះ' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}>
                            <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {activeTab === 'profile' && (
                        <SchoolForm school={school} isSaving={saving} onSave={handleSaveProfile} />
                    )}

                    {activeTab === 'admissions' && (
                        <SchoolAdmissionManager 
                            schoolId={school.id} 
                            admissions={school.admissions} 
                            onUpdate={loadData} 
                        />
                    )}

                    {activeTab === 'courses' && (
                        <SchoolCourseManager 
                            schoolId={school.id} 
                            courses={school.shortCourses} 
                            onUpdate={loadData} 
                        />
                    )}

                    {activeTab === 'leads' && (
                        <SchoolInquiryManager 
                            inquiries={inquiries}
                            onUpdate={loadData}
                        />
                    )}

                    {activeTab === 'enrollments' && (
                        <SchoolEnrollmentManager 
                            enrollments={enrollments}
                            onUpdate={loadData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchoolDashboard;
