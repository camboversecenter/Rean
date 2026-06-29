
import React from 'react';
import { ShieldCheck, ChevronLeft, Lock, Gift, Terminal, AlertCircle } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

const CommunityLicensePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-3xl mx-auto">
         <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back)
         </button>

         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary/5 p-8 text-center border-b border-gray-100">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">អាជ្ញាប័ណ្ណសហគមន៍ (Community License)</h1>
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Phase: Development & Pre-Token
                </span>
            </div>

            <div className="p-6 md:p-10 space-y-10">
                {/* Section 1 */}
                <section className="relative pl-4 md:pl-0">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex bg-green-100 text-green-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                            <Gift className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">១. សិទ្ធិប្រើប្រាស់ និងការគាំទ្រ (Usage & Support)</h2>
                            <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                                <p>
                                    កម្មវិធីនេះអនុញ្ញាតឱ្យប្រើប្រាស់ដោយ <span className="font-bold text-green-600 bg-green-50 px-1 rounded">ឥតគិតថ្លៃ (Free to Use)</span>។ ដើម្បីផ្គត់ផ្គង់ការចំណាយលើប្រតិបត្តិការ និងការអភិវឌ្ឍ ក្រុមហ៊ុន E-KHMER Technology Co., Ltd. ស្វាគមន៍រាល់ការបរិច្ចាគ (Donations) និងរក្សាសិទ្ធិក្នុងការរកប្រាក់ចំណូលតាមរយៈការផ្សព្វផ្សាយពាណិជ្ជកម្ម (Ads) ឬសេវាកម្មផ្សេងៗ។
                                </p>
                                <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                                    Users may use this platform for free. To cover development and operating costs, E-KHMER Technology Co., Ltd. welcomes donations and reserves the right to monetize via advertisements or other services.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="relative pl-4 md:pl-0">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex bg-red-100 text-red-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">២. កម្មសិទ្ធិបច្ចុប្បន្ន (Current Ownership)</h2>
                            <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                                <p>
                                    បច្ចុប្បន្ននេះ កម្មវិធីនិងកូដ (Source Code) ត្រូវបានអភិវឌ្ឍនិងថែរក្សាដោយក្រុមហ៊ុន E-KHMER Technology Co., Ltd.។ ដើម្បីធានាសុវត្ថិភាពមុនពេលលក់ Token កូដត្រូវបានរក្សាទុកជាឯកជន (Closed Source)។ <span className="font-bold text-red-600 bg-red-50 px-1 rounded">ហាមដាច់ខាតការចម្លង ឬបំបែកកូដ (Reverse Engineering) ដោយគ្មានការអនុញ្ញាត។</span>
                                </p>
                                <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                                    Currently, the source code is proprietary and maintained by E-KHMER Technology Co., Ltd. for security purposes. Reverse engineering or unauthorized copying is strictly prohibited.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="relative pl-4 md:pl-0">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex bg-blue-100 text-blue-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                            <Terminal className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">៣. ការសន្យាអនាគត & Token Sale (Future Transition)</h2>
                            <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                                <p>
                                    នេះជាកិច្ចសន្យារបស់យើង៖ នៅពេលការលក់ Token (Token Sale) បានបញ្ចប់ជាស្ថាពរ ក្រុមហ៊ុននឹងដាក់ឱ្យប្រើប្រាស់កូដជាសាធារណៈ (Open Source) ក្រោមអាជ្ញាប័ណ្ណ <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">Apache License 2.0</span>។ នៅពេលនោះ ការសម្រេចចិត្តនឹងត្រូវធ្វើឡើងតាមរយៈសហគមន៍ (Community Decision/DAO)។
                                </p>
                                <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                                    We pledge to release the source code under the Apache License 2.0 upon completion of the Token Sale. Governance rights will then transfer to the Community.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4 */}
                <section className="relative pl-4 md:pl-0">
                    <div className="flex items-start gap-4">
                        <div className="hidden md:flex bg-orange-100 text-orange-600 w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 mt-1">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">៤. ការបដិសេធការទទួលខុសត្រូវ (Limitation of Liability)</h2>
                            <div className="text-sm leading-relaxed text-gray-700 space-y-2">
                                <p>
                                    កម្មវិធីនេះត្រូវបានផ្តល់ជូន "ដូចដែលបានមាន" (AS IS) ដោយគ្មានការធានាណាមួយឡើយ។ ក្រុមហ៊ុន E-KHMER Technology Co., Ltd. មិនទទួលខុសត្រូវចំពោះការបាត់បង់ទិន្នន័យ ឬទ្រព្យសម្បត្តិណាមួយដែលកើតឡើងពីការប្រើប្រាស់កម្មវិធីនេះឡើយ។ អ្នកប្រើប្រាស់ត្រូវទទួលខុសត្រូវដោយខ្លួនឯង។
                                </p>
                                <p className="text-gray-500 italic text-xs border-l-2 border-gray-200 pl-3 py-1">
                                    The software is provided "AS IS" without warranty of any kind. E-KHMER Technology Co., Ltd. is not liable for any damages or losses arising from the use of this platform. Users assume full responsibility.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    © 2025 E-KHMER Technology Co., Ltd. All Rights Reserved.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};
export default CommunityLicensePage;
