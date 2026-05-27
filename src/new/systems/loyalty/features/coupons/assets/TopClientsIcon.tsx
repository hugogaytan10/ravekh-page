import React from "react";

export const TopClientsIcon: React.FC<{ color?: string }> = ({ color = "#565656" }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M7 18.5L12 14L16 17L21 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 11H21V15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="7" r="3" stroke={color} strokeWidth="1.8" />
  </svg>
);
