import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Monitor,
  MapPin,
  Brain,
  ChevronLeft,
  Plus,
  CheckCircle,
  FileText,
  Layout,
  Zap,
} from '../components/Icons';

const ShortCoursesDoc: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/docs')}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back to Docs)
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">មគ្គុទេសក៍វគ្គសិក្សាជំនាញខ្លី (Short Courses)</h1>
            </div>
            <p className="text-indigo-100 max-w-2xl leading-relaxed">
              រៀនជំនាញជាក់លាក់ក្នុងរយៈពេលខ្លី (១-៦ ខែ)។ ស្វែងយល់ពីរបៀបប្រៀបធៀបវគ្គសិក្សា ចុះឈ្មោះ
              និងរបៀបដែលសាលាអាចបង្កើតកម្មវិធីសិក្សាដោយប្រើ AI។
            </p>
          </div>

          <div className="p-8">
            {/* SECTION 1: FOR STUDENTS */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                សម្រាប់សិស្ស (For Students)
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Search className="h-4 w-4 mr-2 text-primary" /> ស្វែងរកវគ្គសិក្សា
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ចូលទៅកាន់ទំព័រ <strong>"វគ្គសិក្សា (Explore)"</strong>។ អ្នកអាចស្វែងរកជំនាញដូចជា
                    Digital Marketing, Coding, ឬ ភាសាបរទេស។
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-white px-2 py-1 rounded border flex items-center">
                      <Monitor className="h-3 w-3 mr-1" /> Online
                    </span>
                    <span className="bg-white px-2 py-1 rounded border flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> On-Campus
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-orange-500" /> ការប្រៀបធៀប (Comparison)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    មិនដឹងរើសមួយណា? ចុចប៊ូតុង{' '}
                    <span className="inline-block bg-white border px-1 rounded mx-1 text-xs">
                      +
                    </span>{' '}
                    លើវគ្គសិក្សា ២ ដើម្បីប្រៀបធៀប។
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-500">
                    <strong>AI Analysis:</strong>{' '}
                    សុភាទន្សាយនឹងប្រាប់អ្នកថាវគ្គណាដែលសាកសមនឹងអ្នកបំផុត ដោយផ្អែកលើតម្លៃ
                    និងកម្មវិធីសិក្សា។
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> ការចុះឈ្មោះ (Enrollment)
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    នៅពេលអ្នកចុច <strong>"ចុះឈ្មោះរៀន"</strong>៖
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>បំពេញឈ្មោះ និងលេខទូរស័ព្ទ។</li>
                    <li>សំណើនឹងត្រូវបានផ្ញើទៅសាលាភ្លាមៗ។</li>
                    <li>សាលានឹងទាក់ទងមកអ្នកដើម្បីបញ្ជាក់ការបង់ប្រាក់ និងកាលបរិច្ឆេទចូលរៀន។</li>
                  </ol>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-8" />

            {/* SECTION 2: FOR SCHOOLS */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                សម្រាប់សាលារៀន (For Schools)
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                សាលារៀនអាចប្រើប្រាស់ <strong>School Dashboard</strong> ដើម្បីគ្រប់គ្រងវគ្គសិក្សា។
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-1">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">បង្កើតវគ្គសិក្សា (Add Course)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      កំណត់ព័ត៌មានលម្អិតដូចជា តម្លៃ កាលវិភាគ (សៅរ៍-អាទិត្យ ឬ ថ្ងៃធម្មតា)
                      និងរូបភាពគម្រប។ អ្នកអាចប្រើ <strong>AI Imagine</strong>{' '}
                      ដើម្បីបង្កើតរូបភាពគម្របបាន។
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">AI Syllabus Architect</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      សាលាមិនចាំបាច់សរសេរកម្មវិធីសិក្សាដោយដៃទេ។ គ្រាន់តែវាយចំណងជើងវគ្គ (ឧ. "Advanced
                      Excel") ហើយចុច <strong>"AI Syllabus Architect"</strong>{' '}
                      ប្រព័ន្ធនឹងរៀបចំមេរៀនលម្អិតជូនភ្លាមៗ។
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">គ្រប់គ្រងការចុះឈ្មោះ (Enrollments)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      មើលបញ្ជីសិស្សដែលបានចុះឈ្មោះក្នុងតារាង "Enrollments"។ សាលាអាចចុច{' '}
                      <strong>Approve</strong> ដើម្បីបញ្ជាក់ការចុះឈ្មោះ ឬ <strong>Reject</strong>។
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

export default ShortCoursesDoc;
