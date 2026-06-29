import React from 'react';
import { User, Users2 } from './Icons';
import { Mission } from '../types';
import { Link } from 'react-router-dom';
import { formatRiel } from '../utils/formatHelper';

interface CourseCardProps {
  course: Mission;
  compact?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, compact = false }) => {
  if (compact) {
    // Horizontal Card for list views
    return (
      <Link to={`/mission/${course.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="flex h-28">
          <div className="w-1/3 relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-2/3 p-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                 <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1">
                  {course.title}
                 </h3>
              </div>
              <p className="text-xs text-gray-500">{course.mentor}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-gray-500">{course.level}</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {course.price === 0 ? 'Free' : formatRiel(course.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Vertical Card for Grids
  return (
    <Link to={`/mission/${course.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-white">
            {course.category}
          </div>
        </div>

        <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-snug min-h-[2.5em]">
            {course.title}
          </h3>
          
          <div className="flex items-center text-xs text-gray-500 mb-2">
             <User className="h-3 w-3 mr-1" />
             <span className="truncate">{course.mentor}</span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
             <div className="flex items-center space-x-1">
                <Users2 className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">Squad: {course.squadSize}</span>
             </div>
             <span className="text-sm font-bold text-primary">
              {course.price === 0 ? 'Free' : formatRiel(course.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;