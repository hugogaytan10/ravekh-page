import React from 'react';
interface ScanIconProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}
const ScanIcon: React.FC<ScanIconProps> = ({
  width = 30,
  height = 30,
  fill = 'none',
  stroke = '#565656',
}) => {
  return(
  <svg width={width} height={height} viewBox="0 0 20 20" fill={fill}>
    <g id="scan-circle-outline">
     
      <path
      id="Vector_2"
      d="M11.5625 13.75H12.6562C12.9469 13.75 13.2188 13.6348 13.4156 13.4375C13.6348 13.2188 13.75 12.9469 13.75 12.6562V11.5625M13.75 8.4375V7.34375C13.75 7.05312 13.6348 6.78125 13.4156 6.58437C13.2188 6.36563 12.9469 6.25 12.6562 6.25H11.5625M8.4375 13.75H7.34375C7.05312 13.75 6.78125 13.6348 6.58437 13.4375C6.36563 13.2188 6.25 12.9469 6.25 12.6562V11.5625M6.25 8.4375V7.34375C6.25 7.05312 6.36563 6.78125 6.58437 6.58437C6.78125 6.36563 7.05312 6.25 7.34375 6.25H8.4375"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      />
    </g>
  </svg>
  );
};

export default ScanIcon;
