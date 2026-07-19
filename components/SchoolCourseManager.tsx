import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  Zap,
  AlertCircle,
  Camera,
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
  DollarSign,
  Users,
  Layout,
  ChevronLeft,
  Eye,
  EyeOff,
} from './Icons';
import { ShortCourse } from '../types';
import {
  addShortCourse,
  updateShortCourse,
  deleteShortCourse,
  getCourseEnrollmentCount,
} from '../services/schoolService';
import { chatWithAI, generateImage, AI_COSTS } from '../services/geminiService';
import { uploadFile } from '../services/storageService';
import CharCounter from './CharCounter';
import toast from 'react-hot-toast';

const SYLLABUS_LIMIT = 3000;
const DESC_LIMIT = 1000;

interface SchoolCourseManagerProps {
  schoolId: string;
  courses: ShortCourse[];
  onUpdate: () => void;
}

const SchoolCourseManager: React.FC<SchoolCourseManagerProps> = ({
  schoolId,
  courses,
  onUpdate,
}) => {
  const [state, setState] = useState({
    view: 'list' as 'list' | 'editor',
    editingCourse: null as Partial<ShortCourse> | null,
    syllabusText: '',
    coverFile: null as File | null,
    coverBase64: null as string | null,
    generatingSyllabus: false,
    generatingImage: false,
    saving: false,
  });

  const {
    view,
    editingCourse,
    syllabusText,
    coverFile,
    coverBase64,
    generatingSyllabus,
    generatingImage,
    saving,
  } = state;

  const handleCreateNew = () => {
    setState((prev) => ({
      ...prev,
      editingCourse: {
        format: 'Online',
        price: 0,
        maxSeats: 20,
        title: '',
        category: 'បច្ចេកវិទ្យា',
        instructorName: '',
        startDate: '',
        deadline: '',
        duration: '',
        schedule: '',
        description: '',
        isListed: true, // Default visible
      },
      syllabusText: '',
      coverFile: null,
      coverBase64: null,
      view: 'editor',
    }));
  };

  const handleEdit = (course: ShortCourse) => {
    setState((prev) => ({
      ...prev,
      editingCourse: course,
      syllabusText: course.syllabus?.[0]?.content || '',
      coverFile: null,
      coverBase64: null,
      view: 'editor',
    }));
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, view: 'list', editingCourse: null }));
  };

  const handleToggleList = async (course: ShortCourse) => {
    const newStatus = !course.isListed;
    try {
      await updateShortCourse(course.id, { isListed: newStatus });
      onUpdate();
      toast.success(newStatus ? 'វគ្គសិក្សាត្រូវបានបង្ហាញ' : 'វគ្គសិក្សាត្រូវបានលាក់');
    } catch (e) {
      toast.error('បរាជ័យក្នុងការប្តូរស្ថានភាព');
    }
  };

  const handleGenerateSyllabus = async () => {
    if (!editingCourse?.title || !editingCourse?.duration) {
      toast.error('សូមបញ្ចូលចំណងជើង និងរយៈពេលវគ្គសិក្សាជាមុនសិន។');
      return;
    }
    setState((prev) => ({ ...prev, generatingSyllabus: true }));
    try {
      const prompt = `Create a professional structured syllabus for a course titled "${editingCourse.title}" that lasts "${editingCourse.duration}". Write in Khmer language (ភាសាខ្មែរ). Focus on practical modules.`;
      const response = await chatWithAI(prompt, [], 'You are an expert curriculum designer.');
      setState((prev) => ({ ...prev, syllabusText: response }));
      toast.success('កម្មវិធីសិក្សាត្រូវបានបង្កើត!');
    } catch (e: any) {
      toast.error(e.message || 'បរាជ័យក្នុងការបង្កើតកម្មវិធីសិក្សា');
    } finally {
      setState((prev) => ({ ...prev, generatingSyllabus: false }));
    }
  };

  const handleGenerateCourseImage = async () => {
    if (!editingCourse?.title) {
      toast.error('សូមបញ្ចូលចំណងជើងវគ្គសិក្សាមុននឹងបង្កើតរូបភាព');
      return;
    }
    setState((prev) => ({ ...prev, generatingImage: true }));
    try {
      const prompt = `High quality educational banner for a course about ${editingCourse.title}, 3D render style, vibrant colors, clean design, 16:9 aspect ratio.`;
      const base64 = await generateImage(prompt);
      if (base64) {
        setState((prev) => ({ ...prev, coverBase64: base64, coverFile: null }));
        toast.success('រូបភាពត្រូវបានបង្កើត!');
      }
    } catch (e) {
      toast.error('បរាជ័យក្នុងការបង្កើតរូបភាព');
    } finally {
      setState((prev) => ({ ...prev, generatingImage: false }));
    }
  };

  const base64ToBlob = (base64: string) => {
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    return new Blob([new Uint8Array(byteNums)], { type: 'image/png' });
  };

  const handleSaveCourse = async () => {
    if (!editingCourse?.title) return;
    setState((prev) => ({ ...prev, saving: true }));
    try {
      let finalCoverUrl = editingCourse.coverImage || '';

      if (coverBase64) {
        const blob = base64ToBlob(coverBase64);
        finalCoverUrl = (await uploadFile(blob, 'course-covers')) || finalCoverUrl;
      } else if (coverFile) {
        finalCoverUrl = (await uploadFile(coverFile, 'course-covers')) || finalCoverUrl;
      }

      const payload = {
        ...editingCourse,
        coverImage: finalCoverUrl,
        syllabus: [{ title: 'Syllabus', content: syllabusText }],
      } as any;

      if (editingCourse.id) {
        await updateShortCourse(editingCourse.id, payload);
      } else {
        await addShortCourse(schoolId, payload);
      }

      toast.success('វគ្គសិក្សាត្រូវបានរក្សាទុក!');
      onUpdate();
      setState((prev) => ({ ...prev, view: 'list' }));
    } catch (e) {
      toast.error('បរាជ័យក្នុងការរក្សាទុក');
    } finally {
      setState((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleDelete = async (courseId: string) => {
    const count = await getCourseEnrollmentCount(courseId);
    if (count > 0) {
      toast.error(`មិនអាចលុបបានទេ! មានសិស្ស ${count} នាក់ក្នុងវគ្គនេះ។`);
      return;
    }
    if (!window.confirm('តើអ្នកពិតជាចង់លុបវគ្គសិក្សានេះមែនទេ?')) return;

    try {
      await deleteShortCourse(courseId);
      toast.success('បានលុបវគ្គសិក្សា');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការលុប');
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">វគ្គសិក្សាជំនាញខ្លី (Short Courses)</h3>
          <button
            type="button"
            onClick={handleCreateNew}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4 mr-2" /> បន្ថែមវគ្គសិក្សា
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">វគ្គសិក្សា</th>
                  <th className="px-6 py-4 text-center">អ្នកចុះឈ្មោះ</th>
                  <th className="px-6 py-4 text-center">ស្ថានភាព</th>
                  <th className="px-6 py-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <BookOpen className="h-12 w-12 mb-3 opacity-20" />
                        <p>មិនទាន់មានវគ្គសិក្សាខ្លីនៅឡើយទេ។</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                            {course.coverImage ? (
                              <img
                                src={course.coverImage}
                                className="w-full h-full object-cover"
                                alt="Course"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <BookOpen className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded">
                              {course.category || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-bold text-gray-900 mb-1">
                            {course.enrolledCount || 0}/{course.maxSeats || 20}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                (course.enrolledCount || 0) >= (course.maxSeats || 20)
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.min(100, ((course.enrolledCount || 0) / (course.maxSeats || 20)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleList(course)}
                          className={`p-2 rounded-xl transition-colors ${course.isListed ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={
                            course.isListed ? 'Visible (Click to hide)' : 'Hidden (Click to show)'
                          }
                        >
                          {course.isListed ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="animate-fade-in bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
        <div className="flex items-center w-full md:w-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="mr-3 p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h3 className="font-bold text-lg md:text-xl text-gray-900 truncate">
            {editingCourse?.id ? 'កែប្រែវគ្គសិក្សា' : 'បន្ថែមវគ្គសិក្សាថ្មី'}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Editor Visibility Toggle */}
          <button
            type="button"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                editingCourse: prev.editingCourse
                  ? { ...prev.editingCourse, isListed: !prev.editingCourse.isListed }
                  : null,
              }))
            }
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors ${editingCourse?.isListed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
          >
            {editingCourse?.isListed ? (
              <Eye className="h-4 w-4 mr-2" />
            ) : (
              <EyeOff className="h-4 w-4 mr-2" />
            )}
            {editingCourse?.isListed ? 'Visible' : 'Hidden'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 md:flex-none px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg text-sm"
          >
            បោះបង់
          </button>
          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={saving}
            className="flex-1 md:flex-none justify-center bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50 transition-all text-sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}{' '}
            រក្សាទុក
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Media & Layout */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  រូបភាពគម្រប (Cover)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCourseImage}
                  disabled={generatingImage}
                  className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg flex items-center hover:bg-purple-100"
                >
                  {generatingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-3 w-3 mr-1" />
                  )}
                  AI Imagine
                </button>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-dashed border-gray-300 flex items-center justify-center group cursor-pointer">
                {coverBase64 || coverFile || editingCourse?.coverImage ? (
                  <img
                    src={
                      coverBase64
                        ? `data:image/png;base64,${coverBase64}`
                        : coverFile
                          ? URL.createObjectURL(coverFile)
                          : editingCourse?.coverImage
                    }
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <input
                  type="file"
                  aria-label="Cover Image"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => {
                    setState((prev) => ({
                      ...prev,
                      coverFile: e.target.files?.[0] || null,
                      coverBase64: null,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="course-category"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <Tag className="h-3 w-3 mr-1" /> ប្រភេទវគ្គសិក្សា
                </label>
                <input
                  id="course-category"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.category || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, category: e.target.value },
                    }))
                  }
                  placeholder="ឧ. បច្ចេកវិទ្យា, ភាសា, អាជីវកម្ម..."
                />
              </div>
              <div>
                <label
                  htmlFor="course-instructor"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <User className="h-3 w-3 mr-1" /> គ្រូបង្រៀន (Instructor)
                </label>
                <input
                  id="course-instructor"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.instructorName || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, instructorName: e.target.value },
                    }))
                  }
                  placeholder="បញ្ចូលឈ្មោះគ្រូ..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Core Info & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="course-title"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <Layout className="h-3 w-3 mr-1" /> ចំណងជើងវគ្គសិក្សា
                </label>
                <input
                  id="course-title"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.title || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, title: e.target.value },
                    }))
                  }
                  placeholder="ឧ. មូលដ្ឋានគ្រឹះ UX/UI Design"
                />
              </div>
              <div>
                <label
                  htmlFor="course-start"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <Calendar className="h-3 w-3 mr-1" /> ថ្ងៃចាប់ផ្តើម
                </label>
                <input
                  id="course-start"
                  type="date"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.startDate || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, startDate: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="course-deadline"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <AlertCircle className="h-3 w-3 mr-1" /> ផុតកំណត់ទទួលពាក្យ
                </label>
                <input
                  id="course-deadline"
                  type="date"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.deadline || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, deadline: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="course-duration"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <Clock className="h-3 w-3 mr-1" /> រយៈពេល (ឧ. ៣ ខែ)
                </label>
                <input
                  id="course-duration"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.duration || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, duration: e.target.value },
                    }))
                  }
                  placeholder="ឧ. ៣ ខែ / ១២ សប្តាហ៍"
                />
              </div>
              <div>
                <label
                  htmlFor="course-schedule"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <MapPin className="h-3 w-3 mr-1" /> កាលវិភាគសិក្សា
                </label>
                <input
                  id="course-schedule"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.schedule || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: { ...prev.editingCourse, schedule: e.target.value },
                    }))
                  }
                  placeholder="ឧ. សៅរ៍-អាទិត្យ 8AM-11AM"
                />
              </div>
              <div>
                <label
                  htmlFor="course-price"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <DollarSign className="h-3 w-3 mr-1" /> តម្លៃ (រៀល)
                </label>
                <input
                  id="course-price"
                  type="number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.price || 0}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: {
                        ...prev.editingCourse,
                        price: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="course-maxSeats"
                  className="block text-xs font-bold text-gray-500 mb-1 flex items-center"
                >
                  <Users className="h-3 w-3 mr-1" /> ចំនួនសិស្សអតិបរមា
                </label>
                <input
                  id="course-maxSeats"
                  type="number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingCourse?.maxSeats || 20}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      editingCourse: {
                        ...prev.editingCourse,
                        maxSeats: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">ទម្រង់សិក្សា</label>
                <div className="flex gap-4">
                  {['Online', 'On-Campus', 'Hybrid'].map((fmt) => (
                    <label
                      htmlFor={`fmt-${fmt}`}
                      key={fmt}
                      className="flex-1 flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 has-[:checked]:bg-primary/5 has-[:checked]:border-primary transition-all"
                    >
                      <input
                        id={`fmt-${fmt}`}
                        type="radio"
                        className="hidden"
                        name="format"
                        checked={editingCourse?.format === fmt}
                        onChange={() =>
                          setState((prev) => ({
                            ...prev,
                            editingCourse: { ...prev.editingCourse, format: fmt as any },
                          }))
                        }
                      />
                      <span
                        className={`text-xs font-bold ${editingCourse?.format === fmt ? 'text-primary' : 'text-gray-500'}`}
                      >
                        {fmt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label
            htmlFor="course-desc"
            className="block text-xs font-bold text-gray-500 mb-2 flex items-center"
          >
            <BookOpen className="h-3 w-3 mr-1" /> ការពិពណ៌នាវគ្គសិក្សា (Description)
          </label>
          <textarea
            id="course-desc"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
            value={editingCourse?.description || ''}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                editingCourse: { ...prev.editingCourse, description: e.target.value },
              }))
            }
            placeholder="រៀបរាប់ពីអ្វីដែលសិស្សនឹងទទួលបាន..."
          />
          <CharCounter current={editingCourse?.description?.length || 0} limit={DESC_LIMIT} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="course-syllabus"
              className="block text-xs font-bold text-gray-500 flex items-center"
            >
              <Zap className="h-3 w-3 mr-1 text-purple-600" /> កម្មវិធីសិក្សា (Syllabus)
            </label>
            <button
              type="button"
              onClick={handleGenerateSyllabus}
              disabled={generatingSyllabus}
              className="text-[10px] font-bold text-purple-600 flex items-center bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
            >
              {generatingSyllabus ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Zap className="h-3 w-3 mr-1" />
              )}
              AI Syllabus Architect ({AI_COSTS.CHAT} pts)
            </button>
          </div>
          <textarea
            id="course-syllabus"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-56 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed font-mono"
            value={syllabusText}
            onChange={(e) => setState((prev) => ({ ...prev, syllabusText: e.target.value }))}
            placeholder="បញ្ចូលមេរៀនសង្ខេប ឬប្រើ AI ដើម្បីជួយរៀបចំ..."
          />
          <CharCounter current={syllabusText.length} limit={SYLLABUS_LIMIT} />
        </div>
      </div>
    </div>
  );
};

export default SchoolCourseManager;
