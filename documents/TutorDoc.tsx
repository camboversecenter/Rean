import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  CheckCircle,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  Monitor,
} from '../components/Icons';

const TutorDoc: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8 px-4 font-['Kantumruy_Pro']">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/docs')}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> ត្រឡប់ក្រោយ (Back to Docs)
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-green-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">មគ្គុទេសក៍ទីផ្សារគ្រូបង្រៀន (Tutor Market)</h1>
            </div>
            <p className="text-green-100 max-w-2xl leading-relaxed">
              ថ្នាលសម្រាប់ស្វែងរកគ្រូបង្រៀនដែលមានសមត្ថភាព ឬបង្កើតប្រាក់ចំណូលតាមរយៈការបង្រៀន។
              ស្វែងយល់ពីរបៀបកក់គ្រូ និងគ្រប់គ្រងថ្នាក់រៀន។
            </p>
          </div>

          <div className="p-8">
            {/* SECTION 1: FOR STUDENTS */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                សម្រាប់សិស្ស (For Students)
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Search className="h-4 w-4 mr-2 text-primary" /> ស្វែងរកគ្រូ (Find Tutors)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    ចូលទៅកាន់ទំព័រ <strong>"គ្រូបង្រៀន (Tutors)"</strong>។ អ្នកអាចមើលប្រវត្តិរូប
                    បទពិសោធន៍ និងតម្លៃក្នុងមួយម៉ោងរបស់គ្រូនីមួយៗ។
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs text-gray-500">
                    Tip: ពិនិត្យមើលសញ្ញា{' '}
                    <span className="inline-block">
                      <CheckCircle className="h-3 w-3 text-blue-500 inline" /> Verified
                    </span>{' '}
                    ដើម្បីធានាថាគ្រូត្រូវបានត្រួតពិនិត្យអត្តសញ្ញាណ។
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" /> ការកក់ (Booking)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    នៅពេលពេញចិត្តគ្រូណាម្នាក់ ចុចប៊ូតុង <strong>"កក់ (Book)"</strong>។
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>ជ្រើសរើស កាលបរិច្ឆេទ និង ម៉ោង។</li>
                    <li>សរសេរចំណាំអំពីអ្វីដែលអ្នកចង់រៀន។</li>
                    <li>រង់ចាំគ្រូយល់ព្រម (Approve) ក្នុងរយៈពេល ២៤ ម៉ោង។</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" /> ប្រកាសស្វែងរក (Job Board)
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    រកគ្រូមិនឃើញ? អ្នកអាចប្រកាស <strong>"សំណើសុំរៀន (Student Request)"</strong>{' '}
                    ដោយខ្លួនឯង។
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>ចូលទៅកាន់ "សំណើសិស្ស (Requests)" ហើយចុច "ប្រកាសសំណើ"។</li>
                    <li>កំណត់មុខវិជ្ជា (Subject), កម្រិតថ្នាក់ (Grade) និងថវិកា (Budget)។</li>
                    <li>គ្រូបង្រៀននឹងឃើញសំណើរបស់អ្នក ហើយទាក់ទងមកអ្នកវិញ។</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 my-8" />

            {/* SECTION 2: FOR TUTORS */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                សម្រាប់គ្រូបង្រៀន (For Tutors)
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                គ្រូអាចប្រើប្រាស់ <strong>Tutor Dashboard</strong> ដើម្បីគ្រប់គ្រងការងារ។
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600 mt-1">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">បង្កើតប្រវត្តិរូប (Create Profile)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      កំណត់ជំនាញដែលអ្នកបង្រៀន (Subjects) តម្លៃក្នុងមួយម៉ោង និងទីតាំង។
                      <br />
                      <span className="text-xs text-orange-500 font-bold">*សំខាន់៖</span>{' '}
                      ប្រើប្រាស់មុខងារ <strong>AI Generate</strong> ដើម្បីបង្កើតរូបភាពគម្រប (Cover)
                      ដ៏ទាក់ទាញ។
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">គ្រប់គ្រងការកក់ (Manage Bookings)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ពេលសិស្សកក់ម៉ោង សំណើនឹងធ្លាក់ចូលក្នុង <strong>Bookings</strong>។ អ្នកអាចចុច{' '}
                      <strong>Accept</strong> ដើម្បីទទួល ឬ <strong>Reject</strong> បើមិនទំនេរ។
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600 mt-1">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">ថ្នាក់រៀនឌីជីថល (Classroom Log)</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      នៅក្នុងការកក់នីមួយៗដែលបានយល់ព្រម អ្នកអាចចុច{' '}
                      <strong>"ចូលថ្នាក់ (Classroom)"</strong> ដើម្បី៖
                      <ul className="list-disc list-inside mt-1 ml-2 text-gray-500">
                        <li>កត់ត្រាសកម្មភាពបង្រៀន (Log Session)។</li>
                        <li>ដាក់កិច្ចការផ្ទះ (Assign Homework) និងពិនិត្យចម្លើយសិស្ស។</li>
                        <li>
                          ធ្វើរបាយការណ៍សង្ខេប (Session Report) ដើម្បីបញ្ចប់ថ្នាក់
                          និងស្នើសុំការទូទាត់។
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mt-1">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">ស្វែងរកការងារ (Job Market)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      មើលសំណើដែលសិស្សបានប្រកាសក្នុង "Job Board" ហើយចុច{' '}
                      <strong>"ដាក់ពាក្យ (Apply)"</strong> ដើម្បីផ្ញើសារទៅកាន់សិស្សដោយផ្ទាល់។
                    </p>
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

export default TutorDoc;
