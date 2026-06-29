
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, Search, Filter, Award, MessageCircle, 
    ChevronLeft, Plus, Users, CheckCircle, Calendar
} from '../components/Icons';

const AdmissionsDoc: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-4 font-['Kantumruy_Pro']">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button onClick={() => navigate('/docs')} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
                    <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back to Docs)
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-blue-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">មគ្គុទេសក៍ការជ្រើសរើសសិស្ស (Admission Market)</h1>
                        </div>
                        <p className="text-blue-100 max-w-2xl leading-relaxed">
                            ប្រព័ន្ធផ្សារភ្ជាប់សិស្សទៅកាន់គ្រឹះស្ថានសិក្សា។ ស្វែងយល់ពីរបៀបស្វែងរកសាលា អាហារូបករណ៍ និងរបៀបដែលសាលាអាចគ្រប់គ្រងការជ្រើសរើសសិស្ស។
                        </p>
                    </div>

                    <div className="p-8">
                        {/* SECTION 1: FOR STUDENTS */}
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                សម្រាប់សិស្ស (For Students)
                            </h2>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-2 flex items-center"><Search className="h-4 w-4 mr-2 text-primary"/> ស្វែងរកសាលា</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        ចូលទៅកាន់ទំព័រ <strong>"សាលារៀន"</strong> ដើម្បីស្វែងរកសាកលវិទ្យាល័យ ឬវិទ្យាល័យ។ អ្នកអាចប្រើប្រាស់តម្រង (Filter) ដើម្បីស្វែងរកតាមប្រភេទ (University, Vocational)។
                                    </p>
                                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-500">
                                        Tip: វាយឈ្មោះជំនាញ (ឧ. IT, Architecture) ក្នុងប្រអប់ស្វែងរក ដើម្បីរកសាលាដែលមានជំនាញនោះ។
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-800 mb-2 flex items-center"><Award className="h-4 w-4 mr-2 text-yellow-500"/> អាហារូបករណ៍</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        សាលានីមួយៗនឹងបង្ហាញ "Admission Campaign" ដែលកំពុងបើក។ ប្រសិនបើមាននិមិត្តសញ្ញា <span className="inline-block bg-yellow-100 text-yellow-800 text-[10px] px-1 rounded font-bold">Scholarship</span> មានន័យថាសាលានោះកំពុងផ្តល់អាហារូបករណ៍។
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
                                    <h3 className="font-bold text-gray-800 mb-2 flex items-center"><MessageCircle className="h-4 w-4 mr-2 text-green-500"/> ការសាកសួរព័ត៌មាន (Inquiry)</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        នៅពេលចូលមើលព័ត៌មានលម្អិតរបស់សាលា អ្នកអាចចុចប៊ូតុង <strong>"ទាក់ទង (Contact)"</strong> ឬ <strong>"ចាប់អារម្មណ៍ (Interested)"</strong>។
                                    </p>
                                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-2">
                                        <li>ប្រព័ន្ធនឹងផ្ញើឈ្មោះ និងលេខទូរស័ព្ទរបស់អ្នកទៅកាន់សាលាដោយផ្ទាល់។</li>
                                        <li>សាលានឹងទាក់ទងមកអ្នកវិញតាមរយៈទូរស័ព្ទដើម្បីផ្តល់ព័ត៌មានបន្ថែម។</li>
                                        <li>អ្នកមិនចាំបាច់ទៅសាលាផ្ទាល់ដើម្បីសួរព័ត៌មានបឋមឡើយ។</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 my-8"/>

                        {/* SECTION 2: FOR SCHOOLS */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                សម្រាប់សាលារៀន (For Schools)
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                សាលារៀនអាចប្រើប្រាស់ <strong>School Dashboard</strong> ដើម្បីគ្រប់គ្រងទិន្នន័យ។
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-1"><Plus className="h-5 w-5"/></div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">បង្កើតការជ្រើសរើស (Create Admission)</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            ជំនួសឱ្យការបង្ហោះរូបភាព Poster តែមួយមុខ សាលាអាចបង្កើត "Admission Digital" ដែលមានព័ត៌មានច្បាស់លាស់អំពី៖
                                            <ul className="list-disc list-inside mt-1 ml-2 text-gray-500">
                                                <li>ឈ្មោះជំនាន់ (Batch/Gen)</li>
                                                <li>កាលបរិច្ឆេទផុតកំណត់ (Deadline)</li>
                                                <li>ជំនាញដែលបើកទទួល (Majors)</li>
                                                <li>ប្រភេទអាហារូបករណ៍ (Manage Scholarships)</li>
                                            </ul>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1"><Users className="h-5 w-5"/></div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">គ្រប់គ្រងសំណួរ (Leads Management)</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            រាល់ពេលសិស្សចុច "Contact" ទិន្នន័យនឹងធ្លាក់ចូលក្នុងតារាង <strong>"Inquiries"</strong> ក្នុង Dashboard។
                                            អ្នកអាចមើលឃើញលេខទូរស័ព្ទ និងសាររបស់សិស្ស ហើយចុចសម្គាល់ថា <span className="font-bold text-green-600">Contacted</span> ពេលបានទាក់ទងរួចរាល់។
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionsDoc;
