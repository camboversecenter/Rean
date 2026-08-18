import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Gift,
  ShieldCheck,
  ChevronLeft,
  Brain,
  Ghost,
  CheckCircle,
  Award,
} from '../components/Icons';

const LazyLearningDoc: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-2 pb-20 pt-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/docs')}
          className="mb-6 flex items-center text-content-muted hover:text-content font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back to Docs)
        </button>

        <div className="bg-surface rounded-3xl shadow-sm border border-line overflow-hidden mb-8">
          <div className="bg-yellow-500 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-surface/20 p-3 rounded-2xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">មគ្គុទេសក៍ Lazy Learning (សហគមន៍)</h1>
            </div>
            <p className="text-yellow-50 max-w-2xl leading-relaxed">
              រៀនផ្លូវកាត់ដោយការសួរនិងឆ្លើយ។ ប្រើប្រាស់ AI ដើម្បីទទួលបានចម្លើយភ្លាមៗ
              ឬដាក់ប្រាក់រង្វាន់ (Bounty) ដើម្បីទទួលបានចម្លើយពីអ្នកជំនាញ។
            </p>
          </div>

          <div className="p-8">
            {/* SECTION 1: ASKING */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-content mb-6 flex items-center">
                <span className="bg-yellow-100 text-yellow-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                សម្រាប់អ្នកសួរ (Asking Questions)
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-surface-2 p-5 rounded-2xl border border-line">
                  <h3 className="font-bold text-content mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" /> ចម្លើយរហ័ស (Flash Answer)
                  </h3>
                  <p className="text-sm text-content-muted mb-4">
                    មិនបាច់រង់ចាំយូរ! រាល់សំណួរដែលអ្នកសួរ <strong>សុភាទន្សាយ (AI)</strong>{' '}
                    នឹងឆ្លើយតបភ្លាមៗក្នុងរយៈពេលប៉ុន្មានវិនាទី ដើម្បីផ្តល់គំនិតបឋម។
                  </p>
                </div>

                <div className="bg-surface-2 p-5 rounded-2xl border border-line">
                  <h3 className="font-bold text-content mb-2 flex items-center">
                    <Gift className="h-4 w-4 mr-2 text-pink-500" /> ប្រាក់រង្វាន់ (Bounty System)
                  </h3>
                  <p className="text-sm text-content-muted mb-4">
                    ត្រូវការចម្លើយលម្អិតពីមនុស្ស? អ្នកអាចដាក់ "ប្រាក់រង្វាន់" (១០-១០០ ពិន្ទុ)។
                    សំណួរដែលមានរង្វាន់នឹងទាក់ទាញអ្នកជំនាញមកឆ្លើយបានលឿនជាង។
                  </p>
                </div>

                <div className="bg-surface-2 p-5 rounded-2xl border border-line md:col-span-2">
                  <h3 className="font-bold text-content mb-2 flex items-center">
                    <Ghost className="h-4 w-4 mr-2 text-content-muted" /> មុខងារអនាមិក (Anonymous
                    Mode)
                  </h3>
                  <p className="text-sm text-content-muted mb-2">
                    ខ្មាស់គេមិនហ៊ានសួរ? បើកមុខងារ <strong>"អនាមិក (Ninja Mode)"</strong>។
                  </p>
                  <ul className="list-disc list-inside text-sm text-content-muted space-y-1 ml-2">
                    <li>ឈ្មោះរបស់អ្នកនឹងត្រូវបានលាក់ (បង្ហាញថា "សិស្សអនាមិក")។</li>
                    <li>អ្នកនៅតែទទួលបាន XP ពីការសួរសំណួរដដែល។</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-line my-8" />

            {/* SECTION 2: ANSWERING */}
            <div>
              <h2 className="text-xl font-bold text-content mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                សម្រាប់អ្នកឆ្លើយ (Earning Rewards)
              </h2>

              {/* ANTI-FARMING NOTICE */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900">របាំងគុណភាព AI (Quality Gate)</h4>
                  <p className="text-xs text-red-700 leading-relaxed mt-1">
                    ដើម្បីការពារការឆ្លើយយកតែលុយ (Spam/Farming) ប្រព័ន្ធប្រើ AI
                    ដើម្បីដាក់ពិន្ទុលើចម្លើយរបស់អ្នក។
                    <br />
                    <strong>លក្ខខណ្ឌទទួលបានពិន្ទុ៖</strong> ចម្លើយត្រូវមានពិន្ទុគុណភាព{' '}
                    <strong>≥ 70</strong>។ ចម្លើយខ្លីៗដូចជា "Good", "Thanks" នឹងមិនទទួលបានពិន្ទុទេ។
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 mt-1">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-content">ការទទួលបាន XP & Points</h3>
                    <div className="text-sm text-content-muted mt-1">
                      ប្រសិនបើចម្លើយរបស់អ្នកមានប្រយោជន៍ (ឆ្លងកាត់ Quality Gate)៖
                      <ul className="list-disc list-inside mt-1 ml-2 text-content-muted">
                        <li>
                          ទទួលបាន <strong>+2 XP</strong> និង <strong>+1 Point</strong> ភ្លាមៗ។
                        </li>
                        <li>ទទួលបាន XP បន្ថែមនៅពេលមានគេចុច Like។</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-content">ការទទួលយកចម្លើយ (Solution Accepted)</h3>
                    <div className="text-sm text-content-muted mt-1">
                      ប្រសិនបើម្ចាស់សំណួរចុច <strong>"ទទួលយក (Accept)"</strong> លើចម្លើយរបស់អ្នក៖
                      <ul className="list-disc list-inside mt-1 ml-2 text-content-muted">
                        <li>អ្នកនឹងទទួលបានប្រាក់រង្វាន់ Bounty ទាំងស្រុង (ប្រសិនបើមាន)។</li>
                        <li>ទទួលបាន XP បន្ថែមយ៉ាងច្រើន (+20 XP)។</li>
                      </ul>
                    </div>
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

export default LazyLearningDoc;
