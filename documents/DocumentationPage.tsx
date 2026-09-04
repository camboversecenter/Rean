import React from 'react';
import {
  User,
  GraduationCap,
  Building2,
  Briefcase,
  Zap,
  Target,
  Gift,
  Award,
  ShieldCheck,
  BookOpen,
  Brain,
  Users,
  CheckCircle,
  ChevronRight,
} from '../components/Icons';
import { Link } from 'react-router-dom';

const DocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-2 pb-24 pt-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-surface rounded-2xl shadow-sm mb-4">
            <BookOpen className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-content">ឯកសារណែនាំ REAN (Documentation)</h1>
          </div>
          <p className="text-content-muted max-w-2xl mx-auto leading-relaxed">
            ស្វាគមន៍មកកាន់ REAN! នេះជាការណែនាំលម្អិតអំពីរបៀបប្រើប្រាស់មុខងារសំខាន់ៗ តួនាទីរបស់អ្នក
            និងរបៀបដែលប្រព័ន្ធសេដ្ឋកិច្ច (Economy) ដំណើរការ។
          </p>
        </div>

        <div className="space-y-12">
          {/* 1. USER ROLES */}
          <section
            id="roles"
            className="bg-surface rounded-3xl shadow-sm border border-line overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-line">
              <h2 className="text-xl font-bold text-content flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-lg shadow-primary/30">
                  1
                </span>
                តួនាទីអ្នកប្រើប្រាស់ (User Roles)
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <RoleCard
                icon={<User className="h-6 w-6 text-blue-600" />}
                title="សិស្ស (Student)"
                color="bg-blue-50"
                desc="អ្នកសិក្សាទូទៅ។ អាចចុះឈ្មោះរៀនវគ្គសិក្សា ស្វែងរកគ្រូ សួរក្នុងសហគមន៍ និងបំពេញបេសកកម្ម។"
              />
              <RoleCard
                icon={<GraduationCap className="h-6 w-6 text-green-600" />}
                title="គ្រូបង្រៀន (Tutor)"
                color="bg-green-50"
                desc="អ្នកជំនាញឯករាជ្យ។ អាចបង្កើតប្រវត្តិរូបបង្រៀន (Profile) កំណត់តម្លៃម៉ោង និងទទួលការកក់ពីសិស្ស។"
              />
              <RoleCard
                icon={<Building2 className="h-6 w-6 text-purple-600" />}
                title="សាលារៀន (School)"
                color="bg-purple-50"
                desc="ស្ថាប័នអប់រំ។ អាចបង្កើតទំព័រសាលា គ្រប់គ្រងការចុះឈ្មោះ (Admission) និងវគ្គសិក្សាខ្លី។"
              />
              <RoleCard
                icon={<Briefcase className="h-6 w-6 text-orange-600" />}
                title="ដៃគូ/ក្រុមហ៊ុន (Partner)"
                color="bg-orange-50"
                desc="ក្រុមហ៊ុនដែលចង់ស្វែងរកបុគ្គលិក។ អាចបង្កើត 'បេសកកម្ម' ដើម្បីស្វែងរកអ្នកមានសមត្ថភាពពិតប្រាកដ។"
              />
            </div>
          </section>

          {/* 2. CORE FUNCTIONS */}
          <section id="functions" className="space-y-6">
            <div className="flex items-center space-x-4 px-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/30">
                2
              </span>
              <h2 className="text-2xl font-bold text-content">មុខងារសំខាន់ៗ (Core Functions)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Function 1: Admissions */}
              <FunctionCard
                icon={<Building2 className="h-6 w-6 text-blue-600" />}
                title="ទីផ្សារសាលារៀន (Admission Market)"
                color="bg-blue-50"
              >
                <ul className="space-y-3 text-sm text-content-muted mt-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>ស្វែងរកសាលា៖</strong> ស្វែងរកសាកលវិទ្យាល័យ ឬវិទ្យាល័យ តាមរយៈជំនាញ
                      និងទីតាំង។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>អាហារូបករណ៍៖</strong> ដាក់ពាក្យស្នើសុំអាហារូបករណ៍
                      និងសួរព័ត៌មានដោយផ្ទាល់ទៅកាន់សាលា។
                    </span>
                  </li>
                </ul>
                <Link
                  to="/docs/admissions"
                  className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  អានលម្អិត <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </FunctionCard>

              {/* Function 2: Short Courses */}
              <FunctionCard
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
                title="វគ្គសិក្សាជំនាញខ្លី (Short Courses)"
                color="bg-indigo-50"
              >
                <ul className="space-y-3 text-sm text-content-muted mt-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>ជំនាញជាក់លាក់៖</strong> រៀនជំនាញរយៈពេលខ្លី (១-៣ ខែ) ដូចជា Digital
                      Marketing, Coding, ឬ ភាសា។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>ប្រៀបធៀប៖</strong> ប្រើ AI ដើម្បីប្រៀបធៀបតម្លៃ
                      និងកម្មវិធីសិក្សារវាងសាលាពីរ។
                    </span>
                  </li>
                </ul>
                <Link
                  to="/docs/short-courses"
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  អានលម្អិត <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </FunctionCard>

              {/* Function 3: Tutor Market */}
              <FunctionCard
                icon={<Users className="h-6 w-6 text-green-600" />}
                title="ទីផ្សារគ្រូបង្រៀន (Tutor Market)"
                color="bg-green-50"
              >
                <ul className="space-y-3 text-sm text-content-muted mt-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>កក់គ្រូ (Booking):</strong> ស្វែងរកគ្រូតាមជំនាញ (គណិត, រូប, អង់គ្លេស)
                      និងកក់ម៉ោងសិក្សា (Online/Home)។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>ប្រកាសស្វែងរក (Job Board):</strong> សិស្សអាចប្រកាស "សំណើសុំរៀន"
                      ហើយគ្រូអាចដាក់ពាក្យបង្រៀនបាន។
                    </span>
                  </li>
                </ul>
                <Link
                  to="/docs/tutor"
                  className="inline-flex items-center text-xs font-bold text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  អានលម្អិត <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </FunctionCard>

              {/* Function 4: Missions */}
              <FunctionCard
                icon={<Target className="h-6 w-6 text-red-600" />}
                title="បេសកកម្ម (Missions)"
                color="bg-red-50"
              >
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                  Project-Based Learning
                </p>
                <ul className="space-y-3 text-sm text-content-muted mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Squad System:</strong> សិស្សត្រូវបានដាក់ចូលក្នុងក្រុមតូចៗ (Squad)
                      ដើម្បីជួយគ្នា។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>AI Mentor:</strong> គ្រប់បេសកកម្មមាន AI ជំនួយការ
                      ដែលផ្តល់មតិកែលម្អលើកិច្ចការរបស់អ្នកភ្លាមៗ។
                    </span>
                  </li>
                </ul>
                <Link
                  to="/docs/missions"
                  className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  អានលម្អិត <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </FunctionCard>

              {/* Function 5: Lazy Learning */}
              <FunctionCard
                icon={<Zap className="h-6 w-6 text-yellow-600" />}
                title="សហគមន៍ (Lazy Learning)"
                color="bg-yellow-50"
              >
                <ul className="space-y-3 text-sm text-content-muted mt-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>សួរ-ឆ្លើយរហ័ស៖</strong> កន្លែងសម្រាប់សួរសំណួរដែលមាន AI (សុភាទន្សាយ)
                      ឆ្លើយតបភ្លាមៗ។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Bounty System:</strong> អ្នកសួរអាចដាក់ "ប្រាក់រង្វាន់" (Points)
                      សម្រាប់ចម្លើយដែលល្អបំផុត។
                    </span>
                  </li>
                </ul>
                <Link
                  to="/docs/lazy-learning"
                  className="inline-flex items-center text-xs font-bold text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  អានលម្អិត <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </FunctionCard>

              {/* Function 6: AI Assistant */}
              <FunctionCard
                icon={<Brain className="h-6 w-6 text-teal-600" />}
                title="សុភាទន្សាយ (AI Assistant)"
                color="bg-teal-50"
              >
                <ul className="space-y-3 text-sm text-content-muted mt-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Chat & Ask:</strong> ជំនួយការឆ្លាតវៃដែលអាចឆ្លើយសំណួរទូទៅ
                      ឬបង្កើតរូបភាព។
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Live Tutor:</strong> មុខងារនិយាយផ្ទាល់ជាមួយ AI (Voice Mode)
                      ដើម្បីហ្វឹកហាត់ភាសា។
                    </span>
                  </li>
                </ul>
              </FunctionCard>
            </div>
          </section>

          {/* 3. ECONOMY SYSTEM */}
          <section
            id="economy"
            className="bg-surface rounded-3xl shadow-lg dark:shadow-surface-3/20/50 border border-line overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-32 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

            <div className="bg-surface p-6 border-b border-line relative z-10">
              <h2 className="text-xl font-bold text-content flex items-center">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-lg shadow-primary/30">
                  3
                </span>
                ប្រព័ន្ធសេដ្ឋកិច្ច (Economy & Rewards)
              </h2>
              <p className="text-content-muted text-sm mt-1 ml-11">
                ស្វែងយល់ពីភាពខុសគ្នារវាង XP និង Points
              </p>
            </div>

            <div className="p-6 relative z-10">
              {/* NEW: Anti-Farming Notice */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-0.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900">
                    Anti-Farming Policy (Zero-Sum + AI Audit)
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed mt-1">
                    ដើម្បីការពារការក្លែងបន្លំ (Farming) ប្រព័ន្ធប្រើប្រាស់{' '}
                    <strong>AI Quality Gate</strong>។ រាល់ចម្លើយនឹងត្រូវបានដាក់ពិន្ទុដោយ AI
                    ដោយស្វ័យប្រវត្តិ។ អ្នកនឹងទទួលបានពិន្ទុតែនៅពេលពិន្ទុគុណភាព <strong>≥ 70</strong>{' '}
                    ប៉ុណ្ណោះ។
                    <br />
                    <br />
                    នេះធានាថា App អាចឈានទៅរក Web3 ដោយសុវត្ថិភាព។
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* XP CARD */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-700 mr-3 shadow-sm">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-900 text-lg">XP (បទពិសោធន៍)</h3>
                      <span className="text-[10px] uppercase font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                        Reputation
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-800 leading-relaxed mb-4">
                    ជារង្វាន់សម្រាប់ភាពសកម្មរបស់អ្នក។ XP កំណត់ <strong>កម្រិត (Level)</strong>{' '}
                    និងចំណាត់ថ្នាក់របស់អ្នកក្នុង Leaderboard។
                  </p>
                  <div className="bg-surface/60 p-3 rounded-xl space-y-2 text-xs font-medium text-yellow-900">
                    <div className="flex justify-between">
                      <span>• មិនអាចចាយបាន</span> <span>🚫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• កើនឡើងរហូត</span> <span>📈</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• បង្ហាញពីភាពជឿជាក់</span> <span>⭐</span>
                    </div>
                  </div>
                </div>

                {/* POINTS CARD */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-700 mr-3 shadow-sm">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">Points (ពិន្ទុ)</h3>
                      <span className="text-[10px] uppercase font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded">
                        Currency
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed mb-4">
                    ជារូបិយប័ណ្ណឌីជីថលក្នុង App។ អ្នកអាចប្រើវាដើម្បីទិញសេវាកម្ម ឬដូរយករង្វាន់។
                  </p>
                  <div className="bg-surface/60 p-3 rounded-xl space-y-2 text-xs font-medium text-green-900">
                    <div className="flex justify-between">
                      <span>• អាចចាយបាន</span> <span>💰</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• អាចថយចុះពេលប្រើ</span> <span>📉</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• បានពី Bounty & Rewards</span> <span>🎁</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-line-strong shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-2 text-content-soft font-bold uppercase text-xs">
                    <tr>
                      <th className="p-4">សកម្មភាព (Action)</th>
                      <th className="p-4 text-center">XP (កេរ្តិ៍ឈ្មោះ)</th>
                      <th className="p-4 text-center">Points (លុយ)</th>
                      <th className="p-4 text-right">លក្ខខណ្ឌ (Requirement)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-surface">
                    {/* EARNINGS */}
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">សួរសំណួរក្នុងសហគមន៍</td>
                      <td className="p-4 text-center font-bold text-yellow-600">+5 XP</td>
                      <td className="p-4 text-center text-content-faint">0</td>
                      <td className="p-4 text-right text-content-muted">5 ដង/ថ្ងៃ</td>
                    </tr>
                    <tr className="hover:bg-surface-2 bg-green-50/20">
                      <td className="p-4 font-medium text-content">ឆ្លើយតបដែលមានប្រយោជន៍</td>
                      <td className="p-4 text-center font-bold text-yellow-600">+2 XP</td>
                      <td className="p-4 text-center font-bold text-green-600">+1 Point</td>
                      <td className="p-4 text-right text-red-600 font-bold">AI Score ≥ 70</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        ចម្លើយត្រូវបានទទួលយក (Accepted)
                      </td>
                      <td className="p-4 text-center font-bold text-yellow-600">+20 XP</td>
                      <td className="p-4 text-center text-content-faint italic">Bounty Only*</td>
                      <td className="p-4 text-right text-content-muted">គ្មានកំណត់</td>
                    </tr>
                    <tr className="hover:bg-surface-2 bg-yellow-50/30">
                      <td className="p-4 font-medium text-content">ឈ្នះ Bounty (ចម្លើយល្អបំផុត)</td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-green-600">Varies</td>
                      <td className="p-4 text-right text-content-muted">Paid by User</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">កាដូសំណាង (Lucky Drop)</td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-green-600">+5 ~ 20 Points</td>
                      <td className="p-4 text-right text-content-muted">3 ដង/ថ្ងៃ (Random)</td>
                    </tr>

                    {/* SPENDING */}
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">ប្រើ AI Chat (សុភាទន្សាយ)</td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">-1 Point / សារ</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        ឱ្យ AI ពិនិត្យកិច្ចការ (Evaluate)
                      </td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">-5 Points</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">Live Tutor (Voice)</td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">
                        -10 Points / Session
                      </td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        បង្កើតមេរៀន AI (Generate Lesson)
                      </td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">-10 Points</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">បង្កើតរូបភាព AI (Image Gen)</td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">-25 Points</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        បង្កើតបេសកកម្ម AI (Mission Gen)
                      </td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">-10 Points</td>
                      <td className="p-4 text-right text-content-muted">For Creators</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        ទិញប្រអប់រង្វាន់ (Mystery Box)
                      </td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">Varies (e.g. 100)</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                    <tr className="hover:bg-surface-2">
                      <td className="p-4 font-medium text-content">
                        ដាក់ប្រាក់រង្វាន់ (Create Bounty)
                      </td>
                      <td className="p-4 text-center text-content-faint">-</td>
                      <td className="p-4 text-center font-bold text-red-500">Varies (User Set)</td>
                      <td className="p-4 text-right text-content-muted">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-content-faint mt-3 text-right italic">
                * Quality Control (Web3 Ready): រាល់ចម្លើយត្រូវឆ្លងកាត់ការត្រួតពិនិត្យដោយ AI។
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---

const RoleCard: React.FC<{ icon: any; title: string; desc: string; color: string }> = ({
  icon,
  title,
  desc,
  color,
}) => (
  <div className="flex gap-4 items-start p-4 rounded-2xl border border-line hover:shadow-md transition-shadow bg-surface h-full">
    <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>{icon}</div>
    <div>
      <h3 className="font-bold text-content text-base mb-2">{title}</h3>
      <p className="text-content-muted text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FunctionCard: React.FC<{
  icon: any;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ icon, title, color, children }) => (
  <div className="bg-surface rounded-2xl p-5 border border-line shadow-sm hover:border-primary/20 transition-colors h-full">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      <h3 className="font-bold text-content text-lg">{title}</h3>
    </div>
    <div className="pl-1">{children}</div>
  </div>
);

export default DocumentationPage;
