import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from '../components/Icons';

const SITE_URL = 'https://rean.camboverse.world';
const CONTACT_EMAIL = 'camboversecenter@gmail.com';

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-surface-2 pb-20 font-sans">
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/about"
        className="inline-flex items-center text-sm text-content-muted hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to About
      </Link>

      <h1 className="text-2xl font-bold text-content mb-2">Terms and Conditions</h1>
      <p className="text-sm text-content-muted mb-8">Last updated: 7 September 2026</p>

      <div className="bg-surface rounded-2xl border border-line p-6 md:p-8 space-y-6 text-sm text-content-soft leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-content mb-3">1. Acceptance</h2>
          <p>
            By accessing or using REAN ({SITE_URL}), you agree to these terms. If you do not
            agree, do not use the platform. REAN is operated by CamboVerse Center, incubated
            at the National University of Management (NUM), Phnom Penh, Cambodia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">2. Accounts</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must sign in with a valid Google account.</li>
            <li>You are responsible for all activity under your account.</li>
            <li>You must not share your account or impersonate another person.</li>
            <li>We may suspend or delete accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">3. Acceptable use</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Post content that is abusive, threatening, discriminatory, or illegal.</li>
            <li>Submit plagiarized work or misrepresent AI-generated content as your own where originality is required.</li>
            <li>Attempt to access other users' accounts or private data.</li>
            <li>Use automated tools to scrape content, spam the community, or abuse AI features.</li>
            <li>Interfere with the operation of the platform or its infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">4. Content you create</h2>
          <p>
            You retain ownership of the content you submit (posts, questions, mission work).
            By posting content publicly on REAN, you grant us a non-exclusive license to
            display it on the platform. You may delete your own content at any time, which
            removes it from public view.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">5. AI tutoring and grading</h2>
          <p>
            REAN uses AI to generate lessons, provide tutoring, and evaluate submissions.
            AI-generated content is provided for educational purposes and may contain errors.
            Grades and feedback from the AI tutor are advisory. REAN does not guarantee the
            accuracy of AI-generated content, and it should not be treated as professional or
            certified educational assessment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">6. Schools and tutors</h2>
          <p>
            Schools and tutors listed on REAN are independent entities. REAN provides the
            marketplace platform but does not employ tutors or operate schools. Enrollment
            decisions, course quality, and tutor qualifications are the responsibility of the
            respective school or tutor. Disputes between students and schools or tutors should
            be resolved directly between the parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">7. XP, levels, and rewards</h2>
          <p>
            XP (experience points), levels, and leaderboard positions are part of the learning
            experience and have no monetary value. We may adjust the XP system, reset
            leaderboards, or modify reward mechanics at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">8. Open-source license</h2>
          <p>
            The REAN platform source code is released under the Apache 2.0 license. This
            license applies to the code, not to user-generated content or personal data stored
            on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">9. Availability</h2>
          <p>
            REAN is provided free of charge. We aim to keep the platform available but do not
            guarantee uninterrupted access. We may modify, suspend, or discontinue features
            at any time without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">10. Limitation of liability</h2>
          <p>
            REAN is provided "as is" without warranties of any kind. To the fullest extent
            permitted by law, CamboVerse Center and the REAN project team are not liable for
            any damages arising from your use of the platform, including reliance on
            AI-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">11. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted on this page
            with a revised date. Continued use of the platform after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">12. Governing law</h2>
          <p>
            These terms are governed by the laws of the Kingdom of Cambodia. Any disputes
            will be resolved in the courts of Phnom Penh.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-content mb-3">13. Contact</h2>
          <p>
            Questions about these terms? Email us at{' '}
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

export default TermsPage;
