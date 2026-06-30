import React from 'react';
import {
  CalendarDays,
  Clock,
  Monitor,
  Users,
  MapPin,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Plus,
} from './Icons';
import { ShortCourse } from '../types';
import { formatRiel } from '../utils/formatHelper';
import { Link } from 'react-router-dom';

interface ShortCourseCardProps {
  course: ShortCourse;
  schoolName?: string;
  onClick?: () => void;
  onCompare?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

const ShortCourseCard: React.FC<ShortCourseCardProps> = ({
  course,
  schoolName,
  onClick,
  onCompare,
  isSelected,
}) => {
  const maxSeats = course.maxSeats || 20;
  const enrolled = course.enrolledCount || 0;
  const seatsLeft = maxSeats - enrolled;
  const isUrgent = seatsLeft <= 5 && seatsLeft > 0;

  return (
    <div
      className={`relative h-full flex flex-col transition-all duration-300 ${isSelected ? 'ring-2 ring-primary rounded-xl transform scale-[0.98]' : ''}`}
    >
      <Link
        to={`/course/${course.id}`}
        onClick={onClick}
        className="block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer group h-full flex flex-col"
      >
        {/* Big Cover Photo */}
        <div className="relative aspect-[16/9] bg-gray-200 overflow-hidden">
          <img
            src={course.coverImage || 'https://via.placeholder.com/640x360?text=Course'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-primary shadow-sm border border-gray-100">
              {course.category || 'វគ្គសិក្សាខ្លី'}
            </span>
          </div>
          {isUrgent && (
            <div className="absolute bottom-2 right-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" /> នៅសល់ {seatsLeft} កន្លែង
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 text-base mb-1 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            {schoolName && (
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <Building2 className="h-3.5 w-3.5 mr-1" /> {schoolName}
              </p>
            )}
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center text-xs text-gray-500">
              <CalendarDays className="h-3.5 w-3.5 mr-2 text-gray-400" />
              <span className="truncate">ចាប់ផ្តើម៖ {course.startDate}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
              <span className="bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center border border-gray-100">
                {course.format === 'Online' ? (
                  <Monitor className="h-3 w-3 mr-1" />
                ) : (
                  <MapPin className="h-3 w-3 mr-1" />
                )}
                {course.format === 'Online'
                  ? 'អនឡាញ'
                  : course.format === 'On-Campus'
                    ? 'រៀននៅសាលា'
                    : 'ចម្រុះ'}
              </span>
              <span className="text-sm font-bold text-primary">{formatRiel(course.price)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Compare Button Overlay */}
      {onCompare && (
        <button type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCompare(e);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md z-10 transition-colors ${
            isSelected
              ? 'bg-primary text-white ring-2 ring-white'
              : 'bg-white/90 text-gray-400 hover:text-primary'
          }`}
          title="Compare"
        >
          {isSelected ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};

export default ShortCourseCard;
