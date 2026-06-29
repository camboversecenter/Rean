
import React, { useState } from 'react';
import { 
    CheckCircle, X, User, Loader2, BookOpen, Search, Filter, Phone, Clock, Award
} from './Icons';
import { CourseEnrollment } from '../types';
import { updateEnrollmentStatus } from '../services/schoolService';
import toast from 'react-hot-toast';

interface SchoolEnrollmentManagerProps {
    enrollments: (CourseEnrollment & { courseTitle: string })[];
    onUpdate: () => void;
}

const SchoolEnrollmentManager: React.FC<SchoolEnrollmentManagerProps> = ({ enrollments, onUpdate }) => {
    const [selectedEnrollment, setSelectedEnrollment] = useState<(CourseEnrollment & { courseTitle: string }) | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('All');

    // Extract unique course titles for the filter dropdown
    const uniqueCourses = Array.from(new Set(enrollments.map(e => e.courseTitle)));

    const handleAction = async (id: string, status: 'Approved' | 'Rejected' | 'Completed') => {
        setProcessingId(id);
        try {
            await updateEnrollmentStatus(id, status);
            const msg = status === 'Approved' ? "អនុម័តការចុះឈ្មោះជោគជ័យ!" : 
                        status === 'Completed' ? "បានបញ្ចប់វគ្គសិក្សា! (Course Completed)" : 
                        "បានបដិសេធការចុះឈ្មោះ";
            toast.success(msg);
            onUpdate();
            setSelectedEnrollment(null); // Close modal on success
        } catch (e) {
            console.error(e);
            toast.error("ប្រតិបត្តិការបរាជ័យ (Permission Error)");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch = (e.studentName || '').toLowerCase().includes(searchStudent.toLowerCase());
        const matchesCourse = selectedCourse === 'All' || e.courseTitle === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">ការចុះឈ្មោះវគ្គសិក្សា (Enrollments)</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                        សរុប៖ {filteredEnrollments.length}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Student */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="ស្វែងរកឈ្មោះសិស្ស..." 
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                        />
                    </div>

                    {/* Filter Course */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select 
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white w-full sm:w-48 cursor-pointer"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="All">វគ្គសិក្សាទាំងអស់</option>
                            {uniqueCourses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">សិស្ស (Name)</th>
                                <th className="px-6 py-4">វគ្គសិក្សា (Course Title)</th>
                                <th className="px-6 py-4 text-right">ស្ថានភាព (Status)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEnrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <BookOpen className="h-12 w-12 mb-3 opacity-20" />
                                            <p>មិនទាន់មានទិន្នន័យ។</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredEnrollments.map(item => (
                                    <tr 
                                        key={item.id} 
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedEnrollment(item)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.studentName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700 font-medium line-clamp-1">{item.courseTitle}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                item.status === 'Pending' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                                item.status === 'Approved' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                                item.status === 'Completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                                {item.status === 'Pending' ? 'រង់ចាំ' : 
                                                 item.status === 'Approved' ? 'បានយល់ព្រម' : 
                                                 item.status === 'Completed' ? 'បានបញ្ចប់' : 'បដិសេធ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedEnrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-lg">ព័ត៌មានលម្អិត (Details)</h3>
                            <button onClick={() => setSelectedEnrollment(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                                    {selectedEnrollment.studentName?.charAt(0) || <User />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedEnrollment.studentName}</h4>
                                    <a href={`tel:${selectedEnrollment.studentPhone}`} className="flex items-center text-sm text-gray-500 hover:text-primary mt-1 font-medium bg-gray-50 px-2 py-1 rounded w-fit">
                                        <Phone className="h-3.5 w-3.5 mr-1.5" /> {selectedEnrollment.studentPhone}
                                    </a>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase">វគ្គសិក្សា</span>
                                    <span className="text-sm font-bold text-gray-900 text-right">{selectedEnrollment.courseTitle}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-gray-500 uppercase">កាលបរិច្ឆេទ</span>
                                    <span className="text-sm text-gray-700 flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-1" /> {selectedEnrollment.createdAt}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase">ស្ថានភាព</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        selectedEnrollment.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                                        selectedEnrollment.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 
                                        selectedEnrollment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedEnrollment.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedEnrollment.status === 'Pending' ? (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button 
                                        onClick={() => handleAction(selectedEnrollment.id, 'Approved')}
                                        disabled={!!processingId}
                                        className="bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        {processingId === selectedEnrollment.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                        អនុម័ត (Approve)
                                    </button>
                                    <button 
                                        onClick={() => handleAction(selectedEnrollment.id, 'Rejected')}
                                        disabled={!!processingId}
                                        className="bg-white border border-red-200 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        <X className="h-5 w-5 mr-2" />
                                        បដិសេធ (Reject)
                                    </button>
                                </div>
                            ) : selectedEnrollment.status === 'Approved' ? (
                                <div className="pt-2">
                                    <button 
                                        onClick={() => handleAction(selectedEnrollment.id, 'Completed')}
                                        disabled={!!processingId}
                                        className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        {processingId === selectedEnrollment.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Award className="h-5 w-5 mr-2" />}
                                        បញ្ចប់វគ្គសិក្សា (Mark Completed)
                                    </button>
                                    <p className="text-center text-xs text-gray-400 mt-2">
                                        ចុចដើម្បីបញ្ចប់វគ្គសិក្សា និងផ្តល់សញ្ញាបត្រដល់សិស្ស។
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 text-sm italic pt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {selectedEnrollment.status === 'Completed' 
                                        ? 'វគ្គសិក្សានេះបានបញ្ចប់ហើយ។ (Completed)' 
                                        : 'ការចុះឈ្មោះនេះត្រូវបានបដិសេធ។'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolEnrollmentManager;
