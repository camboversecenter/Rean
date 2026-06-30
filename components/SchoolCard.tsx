import React from 'react';
import { MapPin, Building2, CheckCircle, Award, Calendar, AlertCircle } from './Icons';
import { School } from '../types';
import { Link } from 'react-router-dom';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  // Determine overall status based on active admissions
  const activeAdmissions = school.admissions.filter(
    (a) => a.status === 'Open' || a.status === 'Closing Soon'
  );
  const primaryAdmission = activeAdmissions[0] || school.admissions[0]; // Prefer active, fallback to any

  const isClosingSoon = activeAdmissions.some((a) => a.status === 'Closing Soon');
  const isOpen = activeAdmissions.length > 0;

  const statusLabel = isOpen ? (isClosingSoon ? 'ជិតចប់' : 'កំពុងទទួល') : 'បិទ';

  // Calculate total scholarships across all admissions
  const hasScholarships = school.admissions.some((a) => a.scholarships.length > 0);

  const getSchoolTypeKH = (type: string) => {
    switch (type) {
      case 'University':
        return 'សាកលវិទ្យាល័យ';
      case 'High School':
        return 'វិទ្យាល័យ';
      case 'Vocational':
        return 'វិជ្ជាជីវៈ';
      case 'Center':
        return 'មជ្ឈមណ្ឌល';
      default:
        return type;
    }
  };

  return (
    <Link
      to={`/school/${school.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 hover:shadow-md transition-shadow group"
    >
      <div className="relative h-32 bg-gray-200">
        <img
          src={school.coverImage || 'https://via.placeholder.com/800x400'}
          alt={school.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center shadow-sm ${
              statusLabel === 'កំពុងទទួល'
                ? 'bg-green-500 text-white'
                : statusLabel === 'ជិតចប់'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-500 text-white'
            }`}
          >
            {isClosingSoon && <AlertCircle className="h-3 w-3 mr-1" />}
            {statusLabel}
          </div>
        </div>
      </div>
      <div className="p-4 relative">
        {/* Logo overlapping cover */}
        <div className="absolute -top-10 left-4 bg-white p-1 rounded-xl shadow-md">
          <img
            src={school.logo || 'https://via.placeholder.com/150'}
            alt="logo"
            className="w-16 h-16 rounded-lg object-contain bg-white"
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{school.name}</h3>

          {/* Recruitment Focus */}
          {primaryAdmission ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-3 mt-2">
              <p className="text-xs font-bold text-blue-800 mb-1">{primaryAdmission.title}</p>
              <p className="text-xs text-blue-600 line-clamp-1">
                {primaryAdmission.description || 'ទទួលពាក្យសម្រាប់ឆ្នាំសិក្សាថ្មី'}
              </p>
              {primaryAdmission.endDate && (
                <div className="flex items-center mt-2 text-xs text-blue-500 font-medium">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  ផុតកំណត់: {primaryAdmission.endDate}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2 mb-3">មិនមានការជ្រើសរើសសិស្សនៅពេលនេះទេ។</p>
          )}

          <div className="flex flex-wrap gap-2 mb-1">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center">
              <Building2 className="h-3 w-3 mr-1" /> {getSchoolTypeKH(school.type)}
            </span>
            {hasScholarships && (
              <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs px-2 py-1 rounded-md flex items-center font-medium">
                <Award className="h-3 w-3 mr-1" /> មានអាហារូបករណ៍
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SchoolCard;
