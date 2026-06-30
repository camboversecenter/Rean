import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Award,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Loader2,
  BookOpen,
  FileText,
} from './Icons';
import { Admission, Scholarship } from '../types';
import {
  addAdmission,
  updateAdmission,
  deleteAdmission,
  addScholarship,
  deleteScholarship,
} from '../services/schoolService';
import toast from 'react-hot-toast';

interface SchoolAdmissionManagerProps {
  schoolId: string;
  admissions: Admission[];
  onUpdate: () => void;
}

const SchoolAdmissionManager: React.FC<SchoolAdmissionManagerProps> = ({
  schoolId,
  admissions,
  onUpdate,
}) => {
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState<Partial<Admission> | null>(null);
  const [majorsStr, setMajorsStr] = useState('');
  const [showScholarshipModal, setShowScholarshipModal] = useState<{
    show: boolean;
    admissionId?: string;
  }>({ show: false });
  const [newScholarship, setNewScholarship] = useState<Partial<Scholarship>>({
    title: '',
    discount: '',
  });
  const [saving, setSaving] = useState(false);

  const handleOpenAdmissionModal = (adm?: Admission) => {
    if (adm) {
      setEditingAdmission(adm);
      setMajorsStr(adm.majors?.join(', ') || '');
    } else {
      setEditingAdmission({
        status: 'Open',
        majors: [],
        description: '',
        startDate: '',
        endDate: '',
      });
      setMajorsStr('');
    }
    setShowAdmissionModal(true);
  };

  const handleSaveAdmission = async () => {
    if (!editingAdmission?.title) return;
    setSaving(true);
    try {
      const processedMajors = majorsStr
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m !== '');
      const payload = { ...editingAdmission, majors: processedMajors };

      if (editingAdmission.id) {
        await updateAdmission(editingAdmission.id, payload);
      } else {
        await addAdmission(schoolId, payload as any);
      }
      setShowAdmissionModal(false);
      setEditingAdmission(null);
      setMajorsStr('');
      toast.success('រក្សាទុកជោគជ័យ!');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុបយុទ្ធនាការនេះមែនទេ?')) return;
    try {
      await deleteAdmission(id);
      toast.success('បានលុបយុទ្ធនាការ');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការលុប');
    }
  };

  const handleAddScholarship = async () => {
    if (!newScholarship.title) return;
    setSaving(true);
    try {
      await addScholarship(schoolId, showScholarshipModal.admissionId, newScholarship as any);
      setShowScholarshipModal({ show: false });
      setNewScholarship({ title: '', discount: '' });
      toast.success('បន្ថែមអាហារូបករណ៍ជោគជ័យ!');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    try {
      await deleteScholarship(id);
      toast.success('បានលុប');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យ');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-lg">យុទ្ធនាការជ្រើសរើសសិស្ស (Admissions)</h3>
        <button
          onClick={() => handleOpenAdmissionModal()}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4 mr-2" /> បន្ថែមថ្មី
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admissions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">មិនទាន់មានការជ្រើសរើសសិស្សទេ។</p>
          </div>
        )}
        {admissions.map((adm) => (
          <div
            key={adm.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{adm.title}</h4>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Calendar className="h-3 w-3 mr-1" /> Deadline: {adm.endDate || 'No deadline'}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  adm.status === 'Open'
                    ? 'bg-green-100 text-green-700'
                    : adm.status === 'Closing Soon'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {adm.status}
              </span>
            </div>

            <div className="space-y-3">
              {/* Scholarship list within admission */}
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[10px] font-bold text-yellow-800 uppercase flex items-center">
                    <Award className="h-3 w-3 mr-1" /> អាហារូបករណ៍
                  </h5>
                  <button
                    onClick={() => setShowScholarshipModal({ show: true, admissionId: adm.id })}
                    className="text-[10px] font-bold text-yellow-700 hover:underline"
                  >
                    បន្ថែម
                  </button>
                </div>
                <div className="space-y-1">
                  {adm.scholarships.length === 0 && (
                    <p className="text-[10px] text-yellow-600 italic">គ្មានអាហារូបករណ៍</p>
                  )}
                  {adm.scholarships.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex justify-between items-center text-xs bg-white/50 p-1.5 rounded-lg border border-yellow-50"
                    >
                      <span className="text-gray-600 truncate mr-2">{sch.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-green-600">{sch.discount}</span>
                        <button
                          onClick={() => handleDeleteScholarship(sch.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenAdmissionModal(adm)}
                  className="flex-1 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> កែប្រែ
                </button>
                <button
                  onClick={() => handleDeleteAdmission(adm.id)}
                  className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADMISSION MODAL */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg my-8 animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-xl">
                {editingAdmission?.id ? 'កែប្រែការជ្រើសរើស' : 'បន្ថែមការជ្រើសរើស'}
              </h3>
              <button onClick={() => setShowAdmissionModal(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  ចំណងជើងយុទ្ធនាការ
                </label>
                <input
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingAdmission?.title || ''}
                  onChange={(e) =>
                    setEditingAdmission({ ...editingAdmission, title: e.target.value })
                  }
                  placeholder="ឧ. បរិញ្ញាបត្រឆ្នាំទី១ ជំនាន់ទី១៥"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  ការពិពណ៌នា
                </label>
                <textarea
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                  value={editingAdmission?.description || ''}
                  onChange={(e) =>
                    setEditingAdmission({ ...editingAdmission, description: e.target.value })
                  }
                  placeholder="ព័ត៌មានលម្អិតអំពីការជ្រើសរើស..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" /> ជំនាញដែលបើកទទួល (Majors)
                </label>
                <input
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={majorsStr}
                  onChange={(e) => setMajorsStr(e.target.value)}
                  placeholder="ឧ. វិទ្យាសាស្ត្រកុំព្យូទ័រ, គ្រប់គ្រង, ភាសាអង់គ្លេស (បំបែកដោយក្បៀស)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    ថ្ងៃចាប់ផ្តើម
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editingAdmission?.startDate || ''}
                    onChange={(e) =>
                      setEditingAdmission({ ...editingAdmission, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    ថ្ងៃផុតកំណត់
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editingAdmission?.endDate || ''}
                    onChange={(e) =>
                      setEditingAdmission({ ...editingAdmission, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  ស្ថានភាព
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editingAdmission?.status || 'Open'}
                  onChange={(e) =>
                    setEditingAdmission({ ...editingAdmission, status: e.target.value as any })
                  }
                >
                  <option value="Open">កំពុងទទួល (Open)</option>
                  <option value="Closing Soon">ជិតផុតកំណត់</option>
                  <option value="Closed">បិទ</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={handleSaveAdmission}
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center active:scale-95 transition-transform"
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
        </div>
      )}

      {/* SCHOLARSHIP MODAL */}
      {showScholarshipModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm animate-scale-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">បន្ថែមអាហារូបករណ៍</h3>
              <button onClick={() => setShowScholarshipModal({ show: false })}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  ឈ្មោះអាហារូបករណ៍
                </label>
                <input
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newScholarship.title}
                  onChange={(e) => setNewScholarship({ ...newScholarship, title: e.target.value })}
                  placeholder="ឧ. អាហារូបករណ៍សិស្សពូកែ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                  ការបញ្ចុះតម្លៃ (%)
                </label>
                <input
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newScholarship.discount}
                  onChange={(e) =>
                    setNewScholarship({ ...newScholarship, discount: e.target.value })
                  }
                  placeholder="ឧ. ១០០%"
                />
              </div>
              <button
                onClick={handleAddScholarship}
                disabled={saving || !newScholarship.title}
                className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}{' '}
                បញ្ជាក់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolAdmissionManager;
