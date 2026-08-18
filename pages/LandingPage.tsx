import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Bot,
  Building2,
  Users,
  User,
  Zap,
  Gift,
  Sparkles,
  GraduationCap,
  CheckCircle,
  ChevronRight,
  Compass,
  ShieldCheck,
  Brain,
  Award,
  MessageCircle,
} from '../components/Icons';

const FEATURES = [
  {
    icon: Target,
    color: 'bg-red-50 text-red-500',
    title: 'បេសកកម្មសិក្សា (Missions)',
    desc: 'រៀនតាមរយៈគម្រោងជាក់ស្តែង។ ធ្វើកិច្ចការ ដាក់ស្នើ និងទទួលការវាយតម្លៃពី AI ភ្លាមៗ។',
    en: 'Project-based learning with AI grading.',
  },
  {
    icon: Bot,
    color: 'bg-teal-50 text-primary',
    title: 'គ្រូ AI (Kru Rean)',
    desc: 'ជំនួយការ AI ដែលបង្រៀន ឆ្លើយសំណួរ និងជួយអ្នករៀនគ្រប់ពេលវេលា។',
    en: 'A Gemini-powered AI tutor, available 24/7.',
  },
  {
    icon: Building2,
    color: 'bg-purple-50 text-purple-600',
    title: 'សាលារៀន (Schools)',
    desc: 'ស្វែងរកសាលា ការជ្រើសរើសសិស្សថ្មី អាហារូបករណ៍ និងវគ្គសិក្សាខ្លីៗ។',
    en: 'Discover schools, admissions, and scholarships.',
  },
  {
    icon: Users,
    color: 'bg-orange-50 text-orange-500',
    title: 'គ្រូបង្រៀន (Tutors)',
    desc: 'ស្វែងរក និងកក់គ្រូបង្រៀនឯកជនតាមមុខវិជ្ជាដែលអ្នកចង់រៀន។',
    en: 'Find and book private tutors by subject.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'សហគមន៍ (Lazy Learning)',
    desc: 'សួរសំណួរ ឆ្លើយ និងជួយគ្នាទៅវិញទៅមក។ សន្សំពិន្ទុ និងកេរ្តិ៍ឈ្មោះ។',
    en: 'A Q&A community where helping earns rewards.',
  },
  {
    icon: Gift,
    color: 'bg-pink-50 text-pink-500',
    title: 'ពិន្ទុ និងរង្វាន់ (Rewards)',
    desc: 'ទទួលបានពិន្ទុពីការរៀន ឡើងកម្រិត បើកប្រអប់អាថ៌កំបាំង និងប្តូរយករង្វាន់។',
    en: 'Earn points, level up, and redeem rewards.',
  },
];

const STEPS = [
  {
    icon: GraduationCap,
    title: 'បង្កើតគណនី',
    en: 'Create a free account',
    desc: 'ចុះឈ្មោះដោយឥតគិតថ្លៃ ហើយជ្រើសរើសតួនាទីរបស់អ្នក (សិស្ស, គ្រូ, សាលា, ឬដៃគូ)។',
  },
  {
    icon: Compass,
    title: 'រុករក និងចាប់ផ្តើម',
    en: 'Explore and start learning',
    desc: 'ជ្រើសរើសបេសកកម្ម វគ្គសិក្សា ឬគ្រូបង្រៀន រួចចាប់ផ្តើមធ្វើកិច្ចការភ្លាមៗ។',
  },
  {
    icon: Award,
    title: 'រៀន សន្សំពិន្ទុ និងរីកចម្រើន',
    en: 'Learn, earn, and grow',
    desc: 'បញ្ចប់កិច្ចការ ទទួលពិន្ទុ ឡើងកម្រិត និងស្ថាបនាទម្លាប់សិក្សារបស់អ្នក។',
  },
];

const ROLES = [
  { icon: User, label: 'សិស្ស / និស្សិត', en: 'Students' },
  { icon: GraduationCap, label: 'គ្រូបង្រៀន', en: 'Tutors' },
  { icon: Building2, label: 'សាលារៀន', en: 'Schools' },
  { icon: ShieldCheck, label: 'ក្រុមហ៊ុន / ដៃគូ', en: 'Businesses' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="bg-surface">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-[#0B4F49] text-white">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-surface/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center animate-fade-in">
          <span className="inline-flex items-center bg-surface/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-secondary" />
            ថ្នាលសិក្សាឥតគិតថ្លៃសម្រាប់កម្ពុជា
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            រៀនតាមរយៈការអនុវត្ត
            <br />
            <span className="text-secondary">Learn by doing.</span>
          </h1>

          <p className="text-teal-50 text-base md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            REAN ភ្ជាប់សិស្ស ជាមួយសាលា គ្រូបង្រៀន និងបេសកកម្មសិក្សាដែលដំណើរការដោយ AI។ រៀន
            សន្សំពិន្ទុ និងរីកចម្រើនជាមួយសហគមន៍។
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-surface text-primary font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-teal-50 transition-all active:scale-95 flex items-center justify-center"
            >
              ចាប់ផ្តើមឥឡូវនេះ (Get Started)
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto bg-surface/10 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-surface/20 transition-all active:scale-95 flex items-center justify-center"
            >
              <Compass className="h-5 w-5 mr-2" />
              រុករកវគ្គសិក្សា (Explore)
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto bg-surface/10 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-surface/20 transition-all active:scale-95 flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              អំពីយើង (About us)
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-teal-100 text-sm">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 text-secondary" /> ឥតគិតថ្លៃ (Free to use)
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 text-secondary" /> ភាសាខ្មែរ និងអង់គ្លេស
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1.5 text-secondary" /> ដំណើរការដោយ AI
            </span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-content mb-3">
            អ្វីៗគ្រប់យ៉ាងសម្រាប់ការសិក្សា
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto">
            Everything you need to learn, teach, and grow — in one platform built for Cambodia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-surface border border-line rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-content mb-2">{f.title}</h3>
              <p className="text-sm text-content-muted leading-relaxed mb-2">{f.desc}</p>
              <p className="text-xs text-content-faint">{f.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-surface-2 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-content mb-3">
              របៀបចាប់ផ្តើម (How it works)
            </h2>
            <p className="text-content-muted">បីជំហានងាយៗ ដើម្បីចាប់ផ្តើមដំណើរសិក្សារបស់អ្នក។</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.en} className="relative bg-surface rounded-2xl p-6 shadow-sm text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-primary flex items-center justify-center mb-4 mt-2">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-content mb-1">{s.title}</h3>
                <p className="text-xs text-primary font-medium mb-2">{s.en}</p>
                <p className="text-sm text-content-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROLES ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-content mb-3">
            សម្រាប់អ្នករាល់គ្នា (For everyone)
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto">
            REAN is built for students, tutors, schools, and partners alike.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ROLES.map((r) => (
            <div
              key={r.en}
              className="bg-surface border border-line rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center mb-3">
                <r.icon className="h-6 w-6" />
              </div>
              <p className="font-bold text-content text-sm">{r.label}</p>
              <p className="text-xs text-content-faint mt-0.5">{r.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMMUNITY / ECONOMY BANNER ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-20">
        <div className="bg-gradient-to-r from-secondary to-orange-500 rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-surface/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 flex items-center">
                <Brain className="h-7 w-7 mr-2" />
                រៀនកាន់តែសប្បាយ ជាមួយពិន្ទុ និងរង្វាន់
              </h2>
              <p className="text-orange-50 leading-relaxed max-w-xl">
                រាល់ការសួរ ការឆ្លើយ និងការជួយ អ្នកនឹងទទួលបានពិន្ទុ (XP) និងកេរ្តិ៍ឈ្មោះ។ ឡើងកម្រិត
                បើកប្រអប់អាថ៌កំបាំង និងឈានទៅមុខលើតារាងចំណាត់ថ្នាក់។
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                to="/login"
                className="bg-surface text-orange-600 font-bold px-7 py-3.5 rounded-xl shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center whitespace-nowrap"
              >
                <MessageCircle className="h-5 w-5 mr-2" /> ចូលរួមសហគមន៍
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">ត្រៀមខ្លួនចាប់ផ្តើមហើយឬនៅ?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join REAN today — free, and built for learners in Cambodia.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center bg-primary hover:bg-accent text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
          >
            ចាប់ផ្តើមឥឡូវនេះ (Get Started Free)
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
