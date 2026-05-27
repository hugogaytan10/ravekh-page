import React from "react";

type IconProps = {
  width?: number;
  height?: number;
  stroke?: string;
};

export const PlusIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  stroke = "#CCCCCC",
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 12H19" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
