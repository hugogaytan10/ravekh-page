import React from "react";

type Props = {
  width?: number;
  height?: number;
  stroke?: string;
};

export const CouponIcon: React.FC<Props> = ({ width = 24, height = 24, stroke = "#9CA3AF" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 8C5.10457 8 6 7.10457 6 6H18C18 7.10457 18.8954 8 20 8V10C18.8954 10 18 10.8954 18 12C18 13.1046 18.8954 14 20 14V16C18.8954 16 18 16.8954 18 18H6C6 16.8954 5.10457 16 4 16V14C5.10457 14 6 13.1046 6 12C6 10.8954 5.10457 10 4 10V8Z"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 8V16" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);
