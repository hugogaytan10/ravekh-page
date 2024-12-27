import React from 'react';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="group relative inline-block">
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden w-max max-w-xs rounded-lg bg-gray-900 px-4 py-2 text-sm text-white opacity-0 shadow-lg group-hover:block group-hover:opacity-100">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );
};

