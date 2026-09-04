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
  Github,
  Code2,
  Globe,
  BookOpen,
  Layout,
  FileText,
  Award,
  Brain,
  Send,
  MessageCircle,
} from '../components/Icons';
import { TELEGRAM_COMMUNITY_URL } from '../constants';

const REPO_URL = 'https://github.com/camboversecenter/Rean';
const SITE_URL = 'https://rean.camboverse.world';

/**
 * How to reach the team. Telegram is first and highlighted because it is the
 * channel students actually use, and it is the only one that does not require
 * a GitHub account.
 */
const CONTACT_CHANNELS = [
  {
    icon: Send,
    title: 'Telegram community',
    desc: 'Ask questions and get help from the team and other learners. This is the fastest way to reach us.',
    url: TELEGRAM_COMMUNITY_URL,
    primary: true,
  },
  {
    icon: MessageCircle,
    title: 'Report a bug or idea',
    desc: 'Open an issue on GitHub for anything broken, confusing, or missing.',
    url: `${REPO_URL}/issues/new/choose`,
    primary: false,
  },
  {
    icon: ShieldCheck,
    title: 'Report a security problem',
    desc: 'Found a vulnerability? Report it privately so it can be fixed before it is public.',
    url: `${REPO_URL}/security/advisories/new`,
    primary: false,
  },
];

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
    en: 'Tutor profiles, bookings, and requests from students looking for a tutor.',
  },
  {
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    title: 'វគ្គសិក្សាខ្លី (Short Courses)',
    desc: 'ទីផ្សារវគ្គសិក្សាខ្លីៗ សម្រាប់ការរៀនរហ័ស។',
    en: 'Shorter courses for quick, focused learning, alongside the full missions.',
  },
  {
    icon: Bot,
    color: 'bg-teal-50 text-primary',
    title: 'គ្រូ AI (Kru Rean)',
    desc: 'ជំនួយការ AI ដែលបង្រៀន ឆ្លើយសំណួរ វាយតម្លៃកិច្ចការ និងមានមុខងារសន្ទនាដោយសំឡេង។',
    en: 'A Gemini-powered chat tutor, plus a live voice tutor.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'សហគមន៍ (Lazy Learning)',
    desc: 'ថ្នាលសួរឆ្លើយ ដែលមានប្រតិកម្ម ចម្លើយដែលទទួលយក និងរង្វាន់ជម្រុញ។',
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
    en: 'Google sign-in, role selection, and a dashboard for each role.',
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
    desc: 'The CamboVerse Center at NUM incubates REAN and supports Cambodian technology projects.',
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
 * The people behind REAN. Names, roles, photos, and profile links mirror
 * about-us.md, which the team maintains. Placeholder LinkedIn URLs
 * (linkedin.com/in/username) are omitted rather than rendered as dead links.
 *
 * All ten portraits in public/team/ are now assigned, one per member.
 *
 * Seven pairings are confirmed, either from sopha's corrections in about-us.md
 * (8fbabad) or from a filename that names the person outright.
 *
 * Three are marked UNVERIFIED below. Those files arrived as photo-N with no
 * name attached, and the remaining candidates are hard to tell apart at a
 * glance. If one is wrong, swap the `photo` values between the two members
 * involved. Nothing else needs to change: the test deliberately does not pin
 * a name to a specific file, so corrections here will not fail CI.
 */
const TEAM_SIZE = 10;

const TEAM: {
  name: string;
  role?: string;
  photo?: string;
  github?: string;
  linkedin?: string;
}[] = [
  {
    name: 'Van sopha',
    role: 'Member',
    photo: '/team/photo-1.webp',
    github: 'https://github.com/vsopha9664-design',
    linkedin: 'https://www.linkedin.com/in/sopha-van-84a7653a4',
  },
  {
    name: 'Phorn sreytey',
    role: 'Member',
    photo: '/team/photo-6.webp',
    github: 'https://github.com/phornsreytey2-bot',
    linkedin: 'https://www.linkedin.com/in/phorn-sreytey-a856bb428',
  },
  {
    name: 'Tie Porching',
    role: 'Member',
    photo: '/team/photo-4.jpg',
    github: 'https://github.com/tieporching-debug',
  },
  {
    name: 'Khorn Aliza',
    role: 'Member',
    // UNVERIFIED: swap with Cheat Mouyyean if this is the wrong person.
    photo: '/team/photo-3.webp',
    github: 'https://github.com/zakitty112233-cell',
  },
  {
    name: 'Hong hana',
    role: 'Member',
    photo: '/team/honghana.webp',
    github: 'https://github.com/hanahong070707-design',
    linkedin: 'https://www.linkedin.com/in/hana-hong-774713428',
  },
  {
    name: 'Soeun Chanliza',
    role: 'Member',
    // UNVERIFIED, but likely right: this is the only remaining portrait with a
    // blue background and a short bob, matching the photo you labelled
    // "chanliza".
    photo: '/team/photo-8.jpg',
    github: 'https://github.com/chanlizasoeun-netizen',
  },
  {
    name: 'Cheat Mouyyean',
    role: 'Member',
    // UNVERIFIED: swap with Khorn Aliza if this is the wrong person.
    photo: '/team/photo-5.jpg',
    github: 'https://github.com/mouyyeancheat-coder',
  },
  {
    name: 'Eng leakhena',
    role: 'Member',
    photo: '/team/leakhena.jpg',
    github: 'https://github.com/englakna157-lang',
  },
  {
    name: 'Soeun somera',
    role: 'Member',
    photo: '/team/photo-2.jpg',
    github: 'https://github.com/Somera-Soeun',
    linkedin: 'https://www.linkedin.com/in/somera-soeun-a75716428',
  },
  {
    name: 'Chiv chan seyha',
    role: 'Member',
    photo: '/team/photo-7.jpg',
    github: 'https://github.com/chivchanseyha3066-user',
  },
];

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
        className="h-24 w-24 rounded-full object-cover bg-surface-3 ring-4 ring-white shadow-md"
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
    <div className="bg-surface font-['Kantumruy_Pro']">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-[#0B4F49] text-white">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-surface/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center animate-fade-in">
          <span className="inline-flex items-center bg-surface/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-secondary" />
            អំពីយើង (About REAN)
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-5">
            ថ្នាលសិក្សាឥតគិតថ្លៃ សម្រាប់កម្ពុជា
          </h1>

          <p className="text-teal-50 text-base md:text-lg leading-relaxed mb-6">
            REAN (រៀន) means "to learn" in Khmer. It is a free education platform for Cambodia,
            connecting students with schools, tutors, and AI-guided learning missions — and
            rewarding them for helping one another along the way.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-surface/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl hover:bg-surface/20 transition-colors"
            >
              <Globe className="h-4 w-4 mr-2" /> rean.camboverse.world
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-surface/10 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl hover:bg-surface/20 transition-colors"
            >
              <Github className="h-4 w-4 mr-2" /> Open source on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
            បេសកកម្មរបស់យើង (Our mission)
          </h2>
        </div>
        <div className="prose prose-gray max-w-none text-content-muted leading-relaxed space-y-4">
          <p>
            REAN exists so that anyone in Cambodia can keep learning without paying for it. Students
            learn by doing: they work through project-based missions, an AI tutor teaches and grades
            their work in Khmer or English, and the community answers whatever the tutor cannot.
            Helping a classmate earns real recognition here, not just thanks.
          </p>
          <p>
            The platform is free for everyone in Cambodia. The project supports itself through
            community backing, donations, grants, and training partnerships rather than by selling
            the software.
          </p>
        </div>
      </section>

      {/* ===== WHAT REAN OFFERS ===== */}
      <section className="bg-surface-2 py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
              អ្វីដែល REAN ផ្តល់ជូន (What REAN offers)
            </h2>
            <p className="text-content-muted max-w-2xl mx-auto">
              The platform is built around {FEATURES.length} areas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.en}
                className="bg-surface border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-content text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-content-muted leading-relaxed mb-2">{f.desc}</p>
                <p className="text-[11px] text-content-faint leading-relaxed">{f.en}</p>
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
            Every member holds two balances. <strong>XP</strong> is reputation and is never spent.{' '}
            <strong>Points</strong> are the currency you spend on AI features.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-surface/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="font-bold mb-1">ការទទួលបាន (Earning)</p>
              <p className="text-orange-50 leading-relaxed">
                Points come from posting questions, writing helpful replies, collecting likes,
                having an answer accepted, and the daily Lucky Drop. Daily limits keep it fair.
              </p>
            </div>
            <div className="bg-surface/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="font-bold mb-1">ការចំណាយ (Spending)</p>
              <p className="text-orange-50 leading-relaxed">
                Points go on AI features: chat, answer evaluation, lesson generation, image
                generation, and live voice sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="bg-surface-2 py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
              បច្ចេកវិទ្យា (Tech stack)
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TECH_STACK.map((t) => (
              <div
                key={t.label}
                className="bg-surface border border-line rounded-2xl p-5 shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center flex-shrink-0">
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-content text-sm">{t.label}</p>
                  <p className="text-sm text-content-muted leading-relaxed">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OPEN SOURCE & LICENSE ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
            កម្មវិធីប្រភពបើកចំហ (Open source)
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto">
            REAN is a community project. The source code is public and anyone may read, run, and
            build on it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <Code2 className="h-6 w-6 text-primary mb-3" />
            <p className="font-bold text-content text-sm mb-1">Application code</p>
            <p className="text-sm text-content-muted leading-relaxed">
              Licensed under the <strong>Apache License 2.0</strong>. Anyone may use, modify, and
              redistribute it, including commercially, as long as the license and copyright notices
              stay in place.
            </p>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <FileText className="h-6 w-6 text-indigo-500 mb-3" />
            <p className="font-bold text-content text-sm mb-1">Documentation</p>
            <p className="text-sm text-content-muted leading-relaxed">
              Written content is licensed under{' '}
              <strong>Creative Commons Attribution-ShareAlike 4.0</strong> (CC BY-SA 4.0).
            </p>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-amber-500 mb-3" />
            <p className="font-bold text-content text-sm mb-1">Name and logo</p>
            <p className="text-sm text-content-muted leading-relaxed">
              The REAN name and logo are trademarks and are <strong>not</strong> covered by the code
              license. Forks must use a different name.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-surface border border-line-strong text-content-soft font-bold px-6 py-3 rounded-xl hover:bg-surface-2 transition-colors"
          >
            <Github className="h-4 w-4 mr-2" /> View the source
          </a>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="max-w-5xl mx-auto px-4 py-14 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
            ក្រុមការងាររបស់យើង (Meet the team)
          </h2>
          <p className="text-content-muted max-w-2xl mx-auto">
            REAN is built by a team of {TEAM_SIZE}. A few profiles are still being filled in.
          </p>
        </div>

        {/* A centred wrap rather than a fixed grid, so a short list stays centred
            instead of hugging the left edge as the team fills out. */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10">
          {TEAM.map((member) => (
            <div key={member.name} className="w-32 flex flex-col items-center text-center">
              <TeamAvatar name={member.name} photo={member.photo} />
              <p className="font-bold text-content text-sm mt-4">{member.name}</p>
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
                      className="text-content-faint hover:text-primary transition-colors"
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
                      className="text-content-faint hover:text-primary transition-colors"
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
      <section className="bg-surface-2 py-14 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
              ដៃគូ និងអ្នកគាំទ្រ (Partners and supporters)
            </h2>
            <p className="text-content-muted max-w-2xl mx-auto">
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
                className="bg-surface border border-line rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center text-center"
              >
                <div className="h-20 w-full flex items-center justify-center mb-4">
                  <PartnerLogo name={p.name} initials={p.initials} logo={p.logo} />
                </div>
                <p className="font-bold text-content text-sm mb-1">{p.name}</p>
                <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                  {p.role}
                </p>
                <p className="text-xs text-content-muted leading-relaxed">{p.desc}</p>
                <span className="mt-3 text-xs font-bold text-content-faint inline-flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  {new URL(p.url).hostname.replace(/^www\./, '')}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT AND SUPPORT ===== */}
      <section className="bg-surface border-t border-line">
        <div className="max-w-5xl mx-auto px-4 py-14 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-content mb-3">
              ទាក់ទង និងជំនួយ (Contact and support)
            </h2>
            <p className="text-content-muted max-w-2xl mx-auto leading-relaxed">
              Stuck on a mission, found a bug, or want to work with us? Here is how to reach the
              team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTACT_CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.title}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col p-5 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                    c.primary
                      ? 'bg-primary text-white border-primary shadow-lg hover:bg-accent'
                      : 'bg-surface-2 border-line hover:bg-surface hover:shadow-md'
                  }`}
                >
                  <span
                    className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${
                      c.primary ? 'bg-surface/20' : 'bg-surface border border-line'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${c.primary ? 'text-white' : 'text-primary'}`} />
                  </span>
                  <span
                    className={`font-bold mb-1 ${c.primary ? 'text-white' : 'text-content'} flex items-center`}
                  >
                    {c.title}
                    <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </span>
                  <span
                    className={`text-sm leading-relaxed ${c.primary ? 'text-white/90' : 'text-content-muted'}`}
                  >
                    {c.desc}
                  </span>
                </a>
              );
            })}
          </div>

          <p className="text-center text-xs text-content-faint mt-8 leading-relaxed">
            Please do not post security problems publicly. Use the security link above so the issue
            can be fixed before it becomes known.
          </p>
        </div>
      </section>

      {/* ===== CONTRIBUTE / CTA ===== */}
      <section className="bg-gray-900 dark:bg-surface-3 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-16 text-center">
          <GraduationCap className="h-10 w-10 mx-auto mb-4 text-secondary" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            ចូលរួមជាមួយយើង (Get involved)
          </h2>
          <p className="text-content-faint dark:text-content-soft mb-8 max-w-xl mx-auto leading-relaxed">
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
              className="w-full sm:w-auto inline-flex items-center justify-center bg-surface/10 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-surface/20 transition-all active:scale-95"
            >
              <Code2 className="h-5 w-5 mr-2" /> Contributing guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
