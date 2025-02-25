import React from 'react';

interface ChevronBackProps {
  width?: number;
  height?: number;
}

export const ChevronBack: React.FC<ChevronBackProps> = ({ width = 35, height = 35 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 35 35"
    fill="none"
  >
    <path
      d="M22.4219 7.65625L12.5781 17.5L22.4219 27.3438"
      stroke="#cccccc"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
