import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Bot,
  Building2,
  Users,
  Zap,
  Gift,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Heart,
  Github,
  Code2,
  Globe,
  BookOpen,
  Layout,
  FileText,
  Award,
  Brain,
} from '../components/Icons';

const REPO_URL = 'https://github.com/camboversecenter/Rean';
const SITE_URL = 'https://rean.camboverse.world';

/** Mirrors the "Core Feature Areas" section of README.md. */
const FEATURES = [
  {
    icon: Target,
    color: 'bg-red-50 text-red-500',
    title: 'បេសកកម្មសិក្សា (Missions)',
    desc: 'វគ្គសិក្សាតាមគម្រោង បែងចែកជាមេរៀនតូចៗ។ សិស្សរៀនពី AI ធ្វើកិច្ចការ រួចដាក់ស្នើសម្រាប់ការវាយតម្លៃ។',
    en: 'Project-based courses with modules, squads, classes, and AI grading.',
  },
  {
    icon: Building2,
    color: 'bg-purple-50 text-purple-600',
    title: 'សាលារៀន (Schools)',
    desc: 'ប្រវត្តិរូបសាលា ការជ្រើសរើសសិស្សថ្មី ការគ្រប់គ្រងការចុះឈ្មោះ និងអាហារូបករណ៍។',
    en: 'School profiles, admissions, enrollments, inquiries, and scholarships.',
  },
  {
    icon: Users,
    color: 'bg-orange-50 text-orange-500',
    title: 'គ្រូបង្រៀន (Tutors)',
    desc: 'ប្រវត្តិរូបគ្រូ ការកក់ម៉ោងរៀន និងសំណើពីសិស្ស។',
    en: 'Tutor profiles, bookings, and student tutor requests.',
  },
  {
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    title: 'វគ្គសិក្សាខ្លី (Short Courses)',
    desc: 'ទីផ្សារវគ្គសិក្សាខ្លីៗ សម្រាប់ការរៀនរហ័ស។',
    en: 'A lighter marketplace product alongside Missions.',
  },
  {
    icon: Bot,
    color: 'bg-teal-50 text-primary',
    title: 'គ្រូ AI (Kru Rean)',
    desc: 'ជំនួយការ AI ដែលបង្រៀន ឆ្លើយសំណួរ វាយតម្លៃកិច្ចការ និងមានមុខងារសន្ទនាដោយសំឡេង។',
    en: 'A Gemini-powered chat tutor plus a live voice tutor.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'សហគមន៍ (Lazy Learning)',
    desc: 'វេទិកាសួរឆ្លើយ ដែលមានប្រតិកម្ម ចម្លើយដែលទទួលយក និងរង្វាន់ជម្រុញ។',
    en: 'A Q&A feed with reactions, accepted answers, and bounties.',
  },
  {
    icon: Gift,
    color: 'bg-pink-50 text-pink-500',
    title: 'ពិន្ទុ និងរង្វាន់ (Rewards)',
    desc: 'តារាងចំណាត់ថ្នាក់ សមិទ្ធិផល ប្រអប់អាថ៌កំបាំង និងការប្តូរយករង្វាន់។',
    en: 'Leaderboards, achievements, mystery boxes, and redeemable rewards.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
    title: 'តួនាទី និងសុវត្ថិភាព (Roles & Auth)',
    desc: 'ចូលប្រើដោយគណនី Google និងជ្រើសរើសតួនាទី មុនពេលចាប់ផ្តើមប្រើប្រាស់។',
    en: 'Google sign-in with role selection and role-gated dashboards.',
  },
];

/** Mirrors the "Tech Stack" section of README.md. */
const TECH_STACK = [
  { icon: Layout, label: 'Frontend', value: 'React 18, TypeScript, Tailwind CSS, Vite' },
  {
    icon: Building2,
    label: 'Backend',
    value: 'Supabase (PostgreSQL, Auth, Storage, Edge Functions)',
  },
  { icon: Brain, label: 'AI', value: 'Google Gemini via @google/genai' },
  { icon: Globe, label: 'Hosting', value: 'Cloudflare Pages' },
];

const PARTNERS = [
  {
    name: 'National University of Management',
    short: 'NUM',
    initials: 'NUM',
    role: 'សាកលវិទ្យាល័យម្ចាស់ផ្ទះ (Host university)',
    desc: 'REAN is hosted at the National University of Management in Phnom Penh.',
    url: 'https://num.edu.kh/',
    logo: '/partners/num.webp',
  },
  {
    name: 'CamboVerse Center',
    short: 'CamboVerse',
    initials: 'CV',
    role: 'អ្នកបណ្តុះបណ្តាលគម្រោង (Incubator)',
    desc: 'REAN is incubated by the CamboVerse Center at NUM, which supports Cambodian technology projects.',
    url: 'https://camboverse.world/',
    logo: '/partners/camboverse.png',
  },
  {
    name: 'E-KHMER Technology Co., Ltd.',
    short: 'E-KHMER',
    initials: 'EK',
    role: 'ដៃគូបច្ចេកវិទ្យា (Technology partner)',
    desc: 'E-KHMER contributes engineering and technical support to the platform.',
    url: 'https://www.e-khmer.com/en',
    logo: '/partners/e-khmer.png',
  },
];

/**
 * The people behind REAN. Only members whose real name is known are listed, so
 * that the "Member N Name" placeholders in about-us.md never reach the public
 * site. Add an entry as each person confirms how they want to be credited.
 *
 * To add a portrait, put the file in `public/team/` and set `photo` to its path
 * (for example `/team/van-sopha.jpg`). Leave `photo` unset while no file exists,
 * otherwise every visitor requests an image that 404s before the initials
 * fallback takes over. `role`, `github`, and `linkedin` are optional and are
 * simply not rendered when absent.
 */
const TEAM_SIZE = 11;

const TEAM: {
  name: string;
  role?: string;
  photo?: string;
  github?: string;
  linkedin?: string;
}[] = [{ name: 'Van sopha' }, { name: 'Tie Porching' }];

/** "Van sopha" becomes "VS". Used when a member has no photo yet. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * A circular team portrait. Falls back to the member's initials when no photo
 * has been added, so the row stays a clean circle rather than a broken image.
 */
const TeamAvatar: React.FC<{ name: string; photo?: string }> = ({ name, photo }) => {
  const [failed, setFailed] = useState(false);

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setFailed(true)}
        loading="lazy"
        className="h-24 w-24 rounded-full object-cover bg-gray-100 ring-4 ring-white shadow-md"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-2xl font-extrabold tracking-tight ring-4 ring-white shadow-md"
    >
      {initialsOf(name)}
    </div>
  );
};

/**
 * Renders a partner logo when the image file exists in `public/partners/`, and
 * falls back to a lettermark otherwise. This keeps the page intact whether or
 * not the logo assets have been added yet.
 *
 * The three marks have very different shapes: the NUM emblem is square, while
 * the E-KHMER and CamboVerse logos are wide wordmarks. Constraining height and
 * width separately and letting the image keep its own ratio means a square mark
 * fills the row height and a wide one scales down to fit instead of squashing.
 */
const PartnerLogo: React.FC<{ name: string; initials: string; logo?: string }> = ({
  name,
  initials,
  logo,
}) => {
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        onError={() => setFailed(true)}
        className="max-h-[72px] max-w-[200px] w-auto h-auto object-contain"
        loading="lazy"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-extrabold tracking-tight"
    >
      {initials}
    </div>
  );
};

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white font-['Kantumruy_Pro']">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-[#0B4F49] text-white">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center animate-fade-in">
          <span className="inline-flex items-center bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-secondary" />
            អំពីយើង (About REAN)
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            វេទិកាសិក្សាឥតគិតថ្លៃ សម្រាប់កម្ពុជា
          </h1>

          <p className="text-teal-50 text-base md:text-lg leading-relaxed mb-6">
            REAN (រៀន means "to learn" in Khmer) is an educational platform for Cambodia that
            connects students with schools, tutors, and AI-driven learning missions, wrapped in a
            gamified community.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" /> rean.camboverse.world
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Github className="h-4 w-4 mr-2" /> Open source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            បេសកកម្មរបស់យើង (Our mission)
          </h2>
        </div>
        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
          <p>
            REAN exists so that any learner in Cambodia can study for free. Students learn by doing.
            They work through project-based missions, get taught and graded by an AI tutor in Khmer
            or English, and help each other in a community where answering questions earns
            recognition.
          </p>
          <p>
            The platform is free for everyone in Cambodia to use. The project sustains itself
            through community support, donations, grants, and training rather than by selling the
            software.
          </p>
        </div>
      </section>

      {/* ===== WHAT REAN OFFERS ===== */}
      <section className="bg-gray-50 py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              អ្វីដែល REAN ផ្តល់ជូន (What REAN offers)
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The platform is built around eight feature areas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.en}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{f.desc}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{f.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POINTS ECONOMY ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 md:py-16">
        <div className="bg-gradient-to-r from-secondary to-orange-500 rounded-3xl p-8 md:p-10 text-white shadow-lg">
          <h2 className="text-xl md:text-2xl font-extrabold mb-3 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            ប្រព័ន្ធពិន្ទុ (The points economy)
          </h2>
          <p className="text-orange-50 leading-relaxed mb-4">
            Members hold two balances. <strong>XP</strong> is reputation and is never spent.{' '}
            <strong>Points</strong> are the spendable currency.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="font-bold mb-1">ការទទួលបាន (Earning)</p>
              <p className="text-orange-50 leading-relaxed">
                Posting questions, writing helpful replies, receiving likes, having an answer
                accepted, and daily Lucky Drops. Daily limits keep it fair.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="font-bold mb-1">ការចំណាយ (Spending)</p>
              <p className="text-orange-50 leading-relaxed">
                AI features such as chat, answer evaluation, lesson generation, image generation,
                and live voice sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="bg-gray-50 py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              បច្ចេកវិទ្យា (Tech stack)
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TECH_STACK.map((t) => (
              <div
                key={t.label}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center flex-shrink-0">
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{t.label}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OPEN SOURCE & LICENSE ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            កម្មវិធីប្រភពបើកចំហ (Open source)
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            REAN is a community project. The source code is public and anyone may read, run, and
            build on it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <Code2 className="h-6 w-6 text-primary mb-3" />
            <p className="font-bold text-gray-900 text-sm mb-1">Application code</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Licensed under the <strong>Apache License 2.0</strong>. Use, modify, and redistribute
              it, including commercially, as long as the license and copyright notices stay in
              place.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <FileText className="h-6 w-6 text-indigo-500 mb-3" />
            <p className="font-bold text-gray-900 text-sm mb-1">Documentation</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Written content is licensed under{' '}
              <strong>Creative Commons Attribution-ShareAlike 4.0</strong> (CC BY-SA 4.0).
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-amber-500 mb-3" />
            <p className="font-bold text-gray-900 text-sm mb-1">Name and logo</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The REAN name and logo are trademarks and are <strong>not</strong> covered by the code
              license. Forks must use a different name.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/license"
            className="inline-flex items-center bg-primary text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-accent transition-colors"
          >
            <ShieldCheck className="h-4 w-4 mr-2" /> អានអាជ្ញាប័ណ្ណ (Read the license)
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Github className="h-4 w-4 mr-2" /> View the source
          </a>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="max-w-5xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
            ក្រុមការងាររបស់យើង (Meet the team)
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            REAN is built by a team of {TEAM_SIZE} people. More profiles are being added.
          </p>
        </div>

        {/* A centred wrap rather than a fixed grid, so a short list stays centred
            instead of hugging the left edge as the team fills out. */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
          {TEAM.map((member) => (
            <div key={member.name} className="w-32 flex flex-col items-center text-center">
              <TeamAvatar name={member.name} photo={member.photo} />
              <p className="font-bold text-gray-900 text-sm mt-4">{member.name}</p>
              {member.role && (
                <p className="text-xs text-primary font-medium mt-0.5">{member.role}</p>
              )}
              {(member.github || member.linkedin) && (
                <div className="flex items-center gap-3 mt-2">
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors"
                      aria-label={`${member.name} on GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section className="bg-gray-50 py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              ដៃគូ និងអ្នកគាំទ្រ (Partners and supporters)
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              REAN is incubated by the CamboVerse Center at the National University of Management.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {PARTNERS.map((p) => (
              <a
                key={p.short}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center"
              >
                <div className="h-20 w-full flex items-center justify-center mb-4">
                  <PartnerLogo name={p.name} initials={p.initials} logo={p.logo} />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{p.name}</p>
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                  {p.role}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                <span className="mt-3 text-xs font-bold text-gray-400 inline-flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {new URL(p.url).hostname.replace(/^www\./, '')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTRIBUTE / CTA ===== */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-16 text-center">
          <GraduationCap className="h-10 w-10 mx-auto mb-4 text-secondary" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            ចូលរួមជាមួយយើង (Get involved)
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Contributions of code, documentation, translations, and ideas are all welcome. You can
            also support REAN through donations, grants, and training partnerships.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-primary hover:bg-accent text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
            >
              ចាប់ផ្តើមឥឡូវនេះ (Get Started Free)
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
            <a
              href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all active:scale-95"
            >
              <Code2 className="h-5 w-5 mr-2" /> Contributing guide
            </a>
          </div>

          <p className="text-gray-500 text-sm mt-8 flex items-center justify-center">
            <Heart className="h-4 w-4 mr-1.5 text-red-400" />
            Incubated by CamboVerse Center, National University of Management (NUM)
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
