import React from 'react';

export const Tablet = ({ width = 20, height = 20, fillColor = '#6D01D1' }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <defs>
      <clipPath id="clip0">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
    <g clipPath="url(#clip0)">
      <path
        d="M15 20H5C4.33718 19.9993 3.70172 19.7357 3.23303 19.267C2.76435 18.7983 2.50072 18.1628 2.5 17.5V2.5C2.50072 1.83718 2.76435 1.20172 3.23303 0.733032C3.70172 0.264348 4.33718 0.000723772 5 0L15 0C15.6628 0.000723772 16.2983 0.264348 16.767 0.733032C17.2357 1.20172 17.4993 1.83718 17.5 2.5V17.5C17.4993 18.1628 17.2357 18.7983 16.767 19.267C16.2983 19.7357 15.6628 19.9993 15 20ZM5 1.25C4.66848 1.25 4.35054 1.3817 4.11612 1.61612C3.8817 1.85054 3.75 2.16848 3.75 2.5V17.5C3.75 17.8315 3.8817 18.1495 4.11612 18.3839C4.35054 18.6183 4.66848 18.75 5 18.75H15C15.3315 18.75 15.6495 18.6183 15.8839 18.3839C16.1183 18.1495 16.25 17.8315 16.25 17.5V2.5C16.25 2.16848 16.1183 1.85054 15.8839 1.61612C15.6495 1.3817 15.3315 1.25 15 1.25H5Z"
        fill={fillColor}
      />
      <path
        d="M13.6111 0C14.2003 0.000723772 14.7651 0.264348 15.1817 0.733032C15.5984 1.20172 15.8327 1.83718 15.8333 2.5V17.5C15.8327 18.1628 15.5984 18.7983 15.1817 19.267C14.7651 19.7357 14.2003 19.9993 13.6111 20H4.72222C4.13305 19.9993 3.56819 19.7357 3.15158 19.267C2.73498 18.7983 2.50064 18.1628 2.5 17.5V2.5C2.50064 1.83718 2.73498 1.20172 3.15158 0.733032C3.56819 0.264348 4.13305 0.000723772 4.72222 0L13.6111 0ZM4.72222 18.75H13.6111C13.9058 18.75 14.1884 18.6183 14.3968 18.3839C14.6052 18.1495 14.7222 17.8315 14.7222 17.5V2.5C14.7222 2.16848 14.6052 1.85054 14.3968 1.61612C14.1884 1.3817 13.9058 1.25 13.6111 1.25H4.72222C4.42754 1.25 4.14492 1.3817 3.93655 1.61612C3.72817 1.85054 3.61111 2.16848 3.61111 2.5V17.5C3.61111 17.8315 3.72817 18.1495 3.93655 18.3839C4.14492 18.6183 4.42754 18.75 4.72222 18.75ZM4.72222 18.125C4.57488 18.125 4.43357 18.0592 4.32939 17.9419C4.2252 17.8247 4.16667 17.6658 4.16667 17.5V2.5C4.16667 2.33424 4.2252 2.17527 4.32939 2.05806C4.43357 1.94085 4.57488 1.875 4.72222 1.875H13.6111C13.7585 1.875 13.8998 1.94085 14.0039 2.05806C14.1081 2.17527 14.1667 2.33424 14.1667 2.5V17.5C14.1667 17.6658 14.1081 17.8247 14.0039 17.9419C13.8998 18.0592 13.7585 18.125 13.6111 18.125H4.72222Z"
        fill={fillColor}
      />
    </g>
  </svg>
);


