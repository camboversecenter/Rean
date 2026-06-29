
import React from 'react';
import { Target, Users2, Brain, ChevronRight, User } from './Icons';
import { Mission } from '../types';
import { Link } from 'react-router-dom';
import { formatRiel } from '../utils/formatHelper';

interface MissionCardProps {
  mission: Mission;
  compact?: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, compact = false }) => {
  if (compact) {
    return (
      <Link to={`/mission/${mission.id}`} className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:border-primary/30">
        <div className="flex h-32">
          <div className="w-1/3 relative overflow-hidden">
            <img
              src={mission.thumbnail || 'https://via.placeholder.com/400x300'}
              alt={mission.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
          <div className="w-2/3 p-4 flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-2 mb-1.5">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                       mission.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                       mission.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-red-100 text-red-700'
                   }`}>
                    {mission.level}
                   </span>
                   <span className="text-[10px] text-gray-400 font-medium">{mission.category}</span>
               </div>
               <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {mission.title}
               </h3>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
              <div className="flex items-center text-xs text-gray-500 gap-3">
                 <span className="flex items-center" title="Squad Size"><Users2 className="h-3 w-3 mr-1" /> {mission.squadSize}</span>
                 {mission.enrolledCount !== undefined && (
                    <span className="flex items-center text-blue-600 font-medium" title="Joined Students"><User className="h-3 w-3 mr-1" /> {mission.enrolledCount}</span>
                 )}
              </div>
              <span className="text-sm font-bold text-primary">
                {mission.price === 0 ? 'Free' : formatRiel(mission.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Vertical Card (Grid View)
  return (
    <Link to={`/mission/${mission.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={mission.thumbnail || 'https://via.placeholder.com/600x400'}
            alt={mission.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 flex items-center shadow-sm">
             <Brain className="h-3 w-3 mr-1 text-primary" /> AI Powered
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
             <span className="inline-block px-2 py-1 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm">
                {mission.category}
             </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow relative">
          <div className="mb-3">
             <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {mission.title}
             </h3>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
             <div className="flex items-center">
                <Target className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span>{mission.modules.length} Missions</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="flex items-center" title="Squad Size"><Users2 className="h-3.5 w-3.5 mr-1 text-gray-400" /> {mission.squadSize}</span>
                {mission.enrolledCount !== undefined && (
                    <span className="flex items-center text-blue-600 font-medium" title="Joined Students"><User className="h-3.5 w-3.5 mr-1" /> {mission.enrolledCount} Joined</span>
                )}
             </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
             <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 border border-white shadow-sm text-gray-400">
                    <User className="h-3 w-3" />
                </div>
                <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">{mission.mentor}</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className={`text-sm font-bold ${mission.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {mission.price === 0 ? 'Free' : formatRiel(mission.price)}
                 </span>
                 <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MissionCard;
