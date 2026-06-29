
import React from 'react';

interface CharCounterProps {
  current: number;
  limit: number;
  className?: string;
}

const CharCounter: React.FC<CharCounterProps> = ({ current, limit, className = '' }) => {
  const isOver = current > limit;
  const isWarning = current > limit * 0.8;

  return (
    <div 
      className={`text-[10px] text-right mt-1 select-none transition-colors ${
        isOver 
          ? 'text-red-500 font-bold animate-pulse' 
          : isWarning 
            ? 'text-amber-500 font-medium' 
            : 'text-gray-400'
      } ${className}`}
    >
      {current.toLocaleString()} / {limit.toLocaleString()}
    </div>
  );
};

export default CharCounter;
