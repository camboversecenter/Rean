import React, { useState } from 'react';
import { MessageCircle, User, Phone, CheckCircle, Clock, Loader2 } from './Icons';
import { SchoolInquiry } from '../types';
import { updateInquiryStatus } from '../services/schoolService';
import toast from 'react-hot-toast';

interface SchoolInquiryManagerProps {
  inquiries: SchoolInquiry[];
  onUpdate: () => void;
}

const SchoolInquiryManager: React.FC<SchoolInquiryManagerProps> = ({ inquiries, onUpdate }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleMarkContacted = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateInquiryStatus(id, 'Contacted');
      toast.success('សម្គាល់ថាបានទាក់ទងរួចរាល់!');
      onUpdate();
    } catch (e) {
      toast.error('បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាព');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-900 text-lg">សិស្សដែលបានសាកសួរព័ត៌មាន (Leads)</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
          សរុប៖ {inquiries.length}
        </span>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <MessageCircle className="h-12 w-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">មិនទាន់មានសំណួរពីសិស្សនៅឡើយទេ។</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 h-fit flex-shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-gray-900">{item.studentName}</h4>
                    <span className="text-[10px] text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {item.createdAt}
                    </span>
                  </div>
                  <a
                    href={`tel:${item.studentPhone}`}
                    className="flex items-center text-xs text-primary font-bold mt-1 hover:underline w-fit"
                  >
                    <Phone className="h-3 w-3 mr-1" /> {item.studentPhone}
                  </a>

                  <div className="mt-3 bg-gray-50 p-3 rounded-2xl relative">
                    <div className="absolute -top-2 left-4 w-3 h-3 bg-gray-50 rotate-45 border-l border-t border-gray-50"></div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{item.message}"</p>
                  </div>

                  {item.admissionTitle && (
                    <div className="mt-3 flex items-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        ចំណាប់អារម្មណ៍លើ៖
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {item.admissionTitle}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'Pending'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  {item.status === 'Pending' ? 'រង់ចាំ' : 'បានទាក់ទង'}
                </span>

                {item.status === 'Pending' && (
                  <button type="button"
                    onClick={() => handleMarkContacted(item.id)}
                    disabled={updatingId === item.id}
                    className="w-full md:w-auto bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 mr-2" />
                    )}
                    សម្គាល់ថាបានតប
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolInquiryManager;
