import React from 'react';
import { MapPin, CheckCircle, Monitor, Home, User, GraduationCap, ChevronRight } from './Icons';
import { TutorProfile } from '../types';
import { Link } from 'react-router-dom';
import { formatRiel } from '../utils/formatHelper';

interface TutorCardProps {
  tutor: TutorProfile;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <Link
      to={`/tutor/${tutor.id}`}
      className="block bg-surface rounded-xl shadow-sm border border-line overflow-hidden mb-3 hover:shadow-md transition-shadow group"
    >
      <div className="flex p-3">
        {/* Avatar */}
        <div className="relative mr-3 flex-shrink-0">
          <img
            src={tutor.avatarUrl || `https://ui-avatars.com/api/?name=${tutor.fullName || 'Tutor'}`}
            alt={tutor.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
          {tutor.isVerified && (
            <div className="absolute bottom-0 right-0 bg-surface rounded-full p-0.5">
              <CheckCircle className="h-4 w-4 text-blue-500 fill-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-content truncate flex items-center">
                {tutor.fullName || 'គ្រូបង្រៀន'}
              </h3>
              <p className="text-xs text-content-muted mb-1">{tutor.experience}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary">
                {formatRiel(tutor.hourlyRate || 0)}
              </span>
              <span className="text-[10px] text-content-faint block">/ម៉ោង</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 my-1">
            {(tutor.subjects || []).slice(0, 3).map((sub) => (
              <span
                key={sub}
                className="bg-surface-3 text-content-muted text-[10px] px-1.5 py-0.5 rounded"
              >
                {sub}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-line">
            <div className="flex items-center space-x-1 text-xs text-content-muted">
              <GraduationCap className="h-3 w-3" />
              <span>{(tutor.grades || [])[0] || 'គ្រប់កម្រិត'}</span>
            </div>

            {/* Visual Call to Action */}
            <span className="text-[10px] font-bold text-white bg-primary px-3 py-1.5 rounded-lg flex items-center group-hover:bg-primary/90 transition-colors shadow-sm">
              កក់ (Book) <ChevronRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TutorCard;
