import React from 'react';

interface LinkIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

const LinkIcon: React.FC<LinkIconProps> = ({
  width = 40,
  height = 40,
  strokeColor = "#6D01D1",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M15.6766 27.5H11.25C9.26088 27.5 7.35322 26.7098 5.9467 25.3033C4.54018 23.8968 3.75 21.9891 3.75 20C3.75 18.0109 4.54018 16.1032 5.9467 14.6967C7.35322 13.2902 9.26088 12.5 11.25 12.5H15.5789M24.4211 12.5H28.75C30.7391 12.5 32.6468 13.2902 34.0533 14.6967C35.4598 16.1032 36.25 18.0109 36.25 20C36.25 21.9891 35.4598 23.8968 34.0533 25.3033C32.6468 26.7098 30.7391 27.5 28.75 27.5H24.3234M13.2086 20H26.9477"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LinkIcon;
