import React from "react";

export const OfflineIcon: React.FC<{ color?: string }> = ({ color = "#565656" }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 10.5C4.7 8.5 7.2 7.2 10 7.2C13.3 7.2 16.1 9 17.6 11.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6.6 14C7.5 13 8.7 12.4 10 12.4C11.2 12.4 12.3 12.9 13.2 13.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M1.5 2.5L22 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="18" r="1.2" fill={color} />
  </svg>
);
