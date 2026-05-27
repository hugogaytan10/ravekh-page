import React from "react";

type IconProps = {
  width?: number;
  height?: number;
  stroke?: string;
};

export const ScannerIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  stroke = "#CCCCCC",
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7V5.5C4 4.67 4.67 4 5.5 4H7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    <path d="M17 4H18.5C19.33 4 20 4.67 20 5.5V7" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    <path d="M20 17V18.5C20 19.33 19.33 20 18.5 20H17" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    <path d="M7 20H5.5C4.67 20 4 19.33 4 18.5V17" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 12H18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
