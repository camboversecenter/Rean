import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from '../components/Icons';

const SITE_URL = 'https://rean.camboverse.world';
const CONTACT_EMAIL = 'camboversecenter@gmail.com';

const PrivacyPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-surface-2 pb-20 font-sans">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/about"
        className="inline-flex items-center text-sm text-content-muted hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to About
      </Link>

      <h1 className="text-2xl font-bold text-content mb-2">Privacy Policy</h1>
      <p className="text-sm text-content-muted mb-8">Last updated: 7 September 2026</p>

      <div className="bg-surface rounded-2xl border border-line p-6 md:p-8 space-y-6 text-sm text-content-soft leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-content mb-3">1. Who we are</h2>
          <p>
            REAN ({SITE_URL}) is a free, open-source educational platform operated by
            CamboVerse Center, incubated at the National University of Management (NUM),
            Phnom Penh, Cambodia. In this policy, "we", "us", and "our" refer to the REAN
            project team.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">2. What we collect</h2>
          <p className="mb-2">When you create an account or use the platform, we may collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information from your Google sign-in (name, email address, profile photo).</li>
            <li>Content you create: mission submissions, community posts, questions, and comments.</li>
            <li>Progress data: mission completion, XP earned, course enrollments, and quiz results.</li>
            <li>Basic usage data: pages visited, features used, and timestamps of activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">3. How we use your data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the learning experience (progress tracking, AI tutoring, leaderboards).</li>
            <li>To let you participate in the community (posts, questions, reactions).</li>
            <li>To communicate important changes to the platform.</li>
            <li>To maintain security and prevent abuse.</li>
          </ul>
          <p className="mt-2">We do not sell your personal data. We do not run advertising on the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">4. AI-generated content</h2>
          <p>
            REAN uses third-party AI services (such as Google Gemini) to generate lessons,
            provide tutoring, and grade submissions. When you interact with AI features, the
            text you submit and the context of your current mission may be sent to these services
            to generate a response. We do not send your email address or account credentials to
            AI providers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">5. Data storage</h2>
          <p>
            Your data is stored in Supabase-hosted databases. Files you upload (profile photos,
            mission attachments) are stored in Supabase Storage. Both are hosted on infrastructure
            managed by Supabase, Inc. We retain your data for as long as your account is active.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">6. Data sharing</h2>
          <p className="mb-2">We share data only in these circumstances:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>With service providers that help run the platform (Supabase for hosting, Google for authentication, AI providers for tutoring features).</li>
            <li>When required by law or to protect the safety of our users.</li>
            <li>Public profile information (name, avatar, XP, completed missions) is visible to other users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">7. Your rights</h2>
          <p className="mb-2">You can:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>View and update your profile information from your account page.</li>
            <li>Request a copy of your data by contacting us.</li>
            <li>Request deletion of your account and associated data by contacting us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">8. Cookies and local storage</h2>
          <p>
            We use browser local storage to remember your theme preference and authentication
            session. We do not use third-party tracking cookies or analytics services that track
            you across other websites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">9. Children</h2>
          <p>
            REAN is designed for learners of all ages in Cambodia. If you are under 13, please
            have a parent or guardian review this policy. We do not knowingly collect data from
            children under 13 without parental consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">10. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted on this page
            with a revised date. Continued use of the platform after changes constitutes
            acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">11. Contact</h2>
          <p>
            Questions about this policy? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
