import React from 'react';
import { Heart, Lightbulb, ThumbsUp } from './Icons';
import { ReactionType, ReactionCounts } from '../types';

interface ReactionBarProps {
  reactions: ReactionCounts;
  userReaction?: ReactionType | null;
  onReact: (type: ReactionType) => void;
  size?: 'sm' | 'md';
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  userReaction,
  onReact,
  size = 'sm',
}) => {
  const baseBtnClass = `flex items-center gap-1.5 transition-all rounded-full ${size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} font-bold`;

  const getBtnStyle = (type: ReactionType) => {
    const isSelected = userReaction === type;

    switch (type) {
      case 'bulb':
        return isSelected
          ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
          : 'text-content-muted hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:text-yellow-600 dark:hover:text-yellow-400';
      case 'heart':
        return isSelected
          ? 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
          : 'text-content-muted hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-500 dark:hover:text-pink-400';
      case 'thumb':
        return isSelected
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          : 'text-content-muted hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 dark:hover:text-blue-400';
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReact('bulb');
        }}
        className={`${baseBtnClass} ${getBtnStyle('bulb')}`}
        title="មានប្រយោជន៍ (Insightful)"
      >
        <Lightbulb
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${userReaction === 'bulb' ? 'fill-yellow-600' : ''}`}
        />
        {reactions.bulb > 0 && <span>{reactions.bulb}</span>}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReact('heart');
        }}
        className={`${baseBtnClass} ${getBtnStyle('heart')}`}
        title="ពេញចិត្ត (Love)"
      >
        <Heart
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${userReaction === 'heart' ? 'fill-pink-500' : ''}`}
        />
        {reactions.heart > 0 && <span>{reactions.heart}</span>}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReact('thumb');
        }}
        className={`${baseBtnClass} ${getBtnStyle('thumb')}`}
        title="យល់ស្រប (Agree)"
      >
        <ThumbsUp
          className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${userReaction === 'thumb' ? 'fill-blue-500' : ''}`}
        />
        {reactions.thumb > 0 && <span>{reactions.thumb}</span>}
      </button>
    </div>
  );
};

export default ReactionBar;
