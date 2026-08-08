import React from 'react';
import {
  ShieldCheck,
  ChevronLeft,
  Gift,
  Code2,
  FileText,
  AlertCircle,
  Github,
} from '../components/Icons';
import { useNavigate, Link } from 'react-router-dom';

const REPO_URL = 'https://github.com/camboversecenter/Rean';

const CommunityLicensePage: React.FC = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back)
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-primary/5 p-8 text-center border-b border-gray-100">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              អាជ្ញាប័ណ្ណសហគមន៍ (Community License)
            </h1>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Open Source: Apache-2.0
            </span>
          </div>

          <div className="p-6 md:p-10 space-y-10">
            {/* Section 1: Free to use */}
            <section className="relative pl-4 md:pl-0">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex bg-green-100 text-green-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    ១. សិទ្ធិប្រើប្រាស់ និងការគាំទ្រ (Usage & Support)
                  </h2>
                  <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                    <p>
                      កម្មវិធីនេះអនុញ្ញាតឱ្យប្រើប្រាស់ដោយ{' '}
                      <span className="font-bold text-green-600 bg-green-50 px-1 rounded">
                        ឥតគិតថ្លៃ (Free to Use)
                      </span>{' '}
                      សម្រាប់អ្នករាល់គ្នានៅកម្ពុជា។ គម្រោងនេះទ្រទ្រង់ខ្លួនឯងតាមរយៈការគាំទ្រពីសហគមន៍
                      ការបរិច្ចាគ ជំនួយឧបត្ថម្ភ (Grants) និងការបណ្តុះបណ្តាល
                      មិនមែនតាមរយៈការលក់កម្មវិធីនេះទេ។
                    </p>
                    <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                      REAN is free for everyone in Cambodia to use. The project sustains itself
                      through community support, donations, grants, and training rather than by
                      selling the software.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: The code is open source */}
            <section className="relative pl-4 md:pl-0">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex bg-blue-100 text-blue-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                  <Code2 className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    ២. កូដជាប្រភពបើកចំហ (Open Source Code)
                  </h2>
                  <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                    <p>
                      កូដប្រភព (Source Code) របស់ REAN គឺជាសាធារណៈ ក្រោមអាជ្ញាប័ណ្ណ{' '}
                      <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">
                        Apache License 2.0
                      </span>
                      ។ នេះជាអាជ្ញាប័ណ្ណបែបអនុញ្ញាត៖ អ្នកគ្រប់គ្នាអាចប្រើប្រាស់ កែប្រែ
                      និងចែកចាយកូដឡើងវិញបាន រួមទាំងក្នុងផលិតផលពាណិជ្ជកម្មផងដែរ
                      ដរាបណានៅរក្សាការជូនដំណឹងអំពីអាជ្ញាប័ណ្ណ និងសិទ្ធិអ្នកនិពន្ធ។
                      អាជ្ញាប័ណ្ណនេះក៏ផ្តល់សិទ្ធិប៉ាតង់យ៉ាងច្បាស់លាស់ពីអ្នករួមចំណែកផងដែរ។
                    </p>
                    <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                      The REAN source code is public under the Apache License 2.0. Anyone may use,
                      modify, and redistribute it, including in closed-source or commercial
                      products, as long as the license and copyright notices are kept. It also
                      grants an explicit patent license from contributors.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Github className="h-3.5 w-3.5 mr-1.5" /> View the source
                      </a>
                      <a
                        href={`${REPO_URL}/blob/main/LICENSE`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" /> Full licence text
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Docs and trademark */}
            <section className="relative pl-4 md:pl-0">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    ៣. ឯកសារ ឈ្មោះ និងឡូហ្គោ (Documentation & Trademark)
                  </h2>
                  <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                    <p>
                      ឯកសារ និងអត្ថបទសរសេរ ត្រូវបានផ្តល់ជូនក្រោមអាជ្ញាប័ណ្ណ{' '}
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                        CC BY-SA 4.0
                      </span>
                      ។ ប៉ុន្តែ{' '}
                      <span className="font-bold text-amber-700 bg-amber-50 px-1 rounded">
                        ឈ្មោះ "REAN" និងឡូហ្គោ មិនស្ថិតក្នុងអាជ្ញាប័ណ្ណកូដទេ
                      </span>
                      ។ អ្នកអាចប្រើកូដដើម្បីបង្កើតសេវាកម្មផ្ទាល់ខ្លួន
                      ប៉ុន្តែត្រូវប្រើឈ្មោះនិងឡូហ្គោផ្សេង។
                    </p>
                    <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                      Documentation and written content are licensed under Creative Commons
                      Attribution-ShareAlike 4.0. The REAN name and logo are trademarks and are not
                      covered by the code license (Apache-2.0 section 6 does not grant trademark
                      rights). Forks and derivatives must use a different name and logo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Warranty disclaimer */}
            <section className="relative pl-4 md:pl-0">
              <div className="flex items-start gap-4">
                <div className="hidden md:flex bg-orange-100 text-orange-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    ៤. ការបដិសេធការទទួលខុសត្រូវ (Limitation of Liability)
                  </h2>
                  <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                    <p>
                      កម្មវិធីនេះត្រូវបានផ្តល់ជូន "ដូចដែលបានមាន" (AS IS) ដោយគ្មានការធានាណាមួយឡើយ
                      ស្របតាមផ្នែកទី ៧ និង ៨ នៃអាជ្ញាប័ណ្ណ Apache 2.0។
                      អ្នករួមចំណែកមិនទទួលខុសត្រូវចំពោះការបាត់បង់ទិន្នន័យ
                      ឬការខូចខាតណាមួយដែលកើតឡើងពីការប្រើប្រាស់កម្មវិធីនេះឡើយ។
                    </p>
                    <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                      The software is provided "AS IS" without warranty of any kind, as set out in
                      sections 7 and 8 of the Apache License 2.0. Contributors are not liable for
                      any damages or losses arising from the use of this platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gray-50 p-6 text-center border-t border-gray-100 space-y-2">
            <p className="text-xs text-gray-500">
              Incubated by CamboVerse Center, National University of Management (NUM).
            </p>
            <p className="text-xs text-gray-400">
              © {year} REAN contributors. Code licensed under Apache-2.0.
            </p>
            <Link
              to="/about"
              className="inline-block text-xs font-bold text-primary hover:underline pt-1"
            >
              អំពី REAN (About REAN)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommunityLicensePage;
