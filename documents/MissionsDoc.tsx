import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Users2,
  Brain,
  CheckCircle,
  ChevronLeft,
  Plus,
  PlayCircle,
  Zap,
  ShieldCheck,
  DollarSign,
  Award,
  AlertCircle,
  RefreshCw,
} from '../components/Icons';

const MissionsDoc: React.FC = () => {
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
          <div className="bg-red-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">មគ្គុទេសក៍បេសកកម្ម (Missions)</h1>
            </div>
            <p className="text-red-100 max-w-2xl leading-relaxed">
              ការរៀនតាមរយៈការអនុវត្តជាក់ស្តែង (Project-Based Learning)។ ធ្វើការជាក្រុម មាន AI
              ជាជំនួយការ និងបង្កើតស្នាដៃពិតប្រាកដ។
            </p>
          </div>

          <div className="p-8">
            {/* SECTION 1: FOR STUDENTS */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                សម្រាប់សិស្ស (For Students)
              </h2>

              {/* Study Process */}
              <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-primary" /> ដំណើរការសិក្សា (Study
                  Process)
                </h3>
                <div className="space-y-4 border-l-2 border-gray-100 pl-4 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-200 border-2 border-white"></span>
                    <h4 className="font-bold text-sm text-gray-900">
                      ១. ចុះឈ្មោះ & ចូលក្រុម (Enroll & Squad)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ចុះឈ្មោះចូលរៀន។ ប្រព័ន្ធនឹងដាក់អ្នកចូលក្នុង "ក្រុមតូច" (Squad)
                      ជាមួយសិស្សដទៃទៀត ឬអ្នកអាចរៀនតែឯងបាន។
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-200 border-2 border-white"></span>
                    <h4 className="font-bold text-sm text-gray-900">
                      ២. សិក្សាមេរៀន (Brief & Learn)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      អានសង្ខេបមេរៀន។ ប្រើប្រាស់មុខងារ <strong>"រៀន (Learn)"</strong> ដើម្បីឱ្យ AI
                      ពន្យល់ទ្រឹស្តីបន្ថែមបើចាំបាច់។
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-200 border-2 border-white"></span>
                    <h4 className="font-bold text-sm text-gray-900">
                      ៣. អនុវត្ត (Practice in Studio)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      ចូលទៅកាន់ <strong>"Studio"</strong> ដើម្បីសរសេរចម្លើយ ឬធ្វើកិច្ចការ។
                      អ្នកអាចពិភាក្សាជាមួយ AI Mentor បានគ្រប់ពេល។
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluation Process */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> ការដាក់ពិន្ទុ (Evaluation
                  & Grading)
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-2">
                      លក្ខខណ្ឌជាប់ (Pass Criteria)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center text-green-700 font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" /> ពិន្ទុចាប់ពី ៧០ ឡើងទៅ (Score ≥ 70)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-400" /> AI
                        ពិនិត្យថាចម្លើយត្រូវនឹងប្រធានបទ
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-400" /> មិនមានការលួចចម្លង
                        (Plagiarism Free)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-2">បើធ្លាក់? (If Failed)</h4>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <div className="flex items-center text-orange-600 font-bold text-sm mb-1">
                        <AlertCircle className="h-4 w-4 mr-2" /> ពិន្ទុក្រោម ៧០ (Score &lt; 70)
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        អ្នកមិនអាចបន្តទៅមេរៀនបន្ទាប់បានទេ។
                      </p>
                      <div className="flex items-center text-primary text-xs font-bold bg-primary/5 p-2 rounded-lg">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Retry Until Pass (អាចដាក់ស្នើឡើងវិញបាន)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">AI Feedback:</span> មិនថាជាប់
                    ឬធ្លាក់ទេ AI នឹងផ្តល់មតិកែលម្អលម្អិត ដើម្បីឱ្យអ្នកដឹងពីចំណុចខ្វះខាត។
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-8" />

            {/* SECTION 2: FOR CREATORS (Keep summary) */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                សម្រាប់អ្នកបង្កើត (For Creators)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-sm mb-2">1. AI Persona</h3>
                  <p className="text-xs text-gray-500">
                    កំណត់តួនាទី AI (ឧ. Marketing Manager) ដើម្បីឱ្យការដាក់ពិន្ទុមានស្តង់ដារ។
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-sm mb-2">2. Plagiarism Check</h3>
                  <p className="text-xs text-gray-500">
                    បើកមុខងារនេះដើម្បីឱ្យ AI ផ្ទៀងផ្ទាត់ចម្លើយសិស្សជាមួយគ្នា។
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-sm mb-2">3. Manual Review</h3>
                  <p className="text-xs text-gray-500">
                    គ្រូអាចចូលកែពិន្ទុ ឬផ្តល់មតិបន្ថែមពីលើ AI បានតាមរយៈ Dashboard។
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionsDoc;
