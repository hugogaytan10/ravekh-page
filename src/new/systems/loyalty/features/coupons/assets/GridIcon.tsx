import React from "react";

type IconProps = {
  width?: number;
  height?: number;
  stroke?: string;
};

export const GridIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  stroke = "#CCCCCC",
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
    <rect x="14" y="4" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
    <rect x="4" y="14" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
    <rect x="14" y="14" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
  </svg>
);
