import React from 'react';
import { MapPin, Clock, User, Trash2, Send } from './Icons';
import { TutorRequest } from '../types';
import { formatRiel } from '../utils/formatHelper';

interface TutorRequestCardProps {
  request: TutorRequest;
  isOwner?: boolean;
  showApply?: boolean; // New prop to control visibility based on role
  onDelete?: (id: string) => void;
  onApply?: (request: TutorRequest) => void;
}

const TutorRequestCard: React.FC<TutorRequestCardProps> = ({
  request,
  isOwner,
  showApply,
  onDelete,
  onApply,
}) => {
  // Parse and format budget
  const getFormattedBudget = (budget: string) => {
    // If it's a number-like string, format it
    const num = parseInt(budget.replace(/,/g, ''));
    if (!isNaN(num) && num > 100) {
      return formatRiel(num);
    }
    return budget;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center">{request.subject}</h3>
          <p className="text-xs text-primary font-medium mt-0.5">{request.grade}</p>
        </div>
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
          {getFormattedBudget(request.budget)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 leading-relaxed">"{request.description}"</p>

      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 border-t border-gray-50 pt-3">
        <div className="flex items-center">
          <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {request.name}
        </div>
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
          {request.location}
        </div>
        <div className="flex items-center ml-auto">
          <Clock className="h-3 w-3 mr-1 text-gray-300" />
          {request.timestamp}
        </div>
      </div>

      {isOwner ? (
        <button
          onClick={() => onDelete && onDelete(request.id)}
          className="w-full mt-3 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" /> លុបសំណើ (Delete)
        </button>
      ) : showApply ? (
        <button
          onClick={() => onApply && onApply(request)}
          className="w-full mt-3 py-2 bg-gray-900 text-white font-bold text-xs rounded-lg hover:bg-black transition-colors flex items-center justify-center shadow-lg shadow-gray-200"
        >
          <Send className="h-3.5 w-3.5 mr-2" /> ទាក់ទងសិស្ស (Contact)
        </button>
      ) : null}
    </div>
  );
};

export default TutorRequestCard;
