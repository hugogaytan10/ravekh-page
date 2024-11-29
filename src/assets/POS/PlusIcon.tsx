import React from 'react';

const PlusIcon = ({ width = 31, height = 31, color = "#ffffff" , stroke = '3'}) => (
    <svg width={width} height={height} viewBox="0 0 31 31" fill="none" >
        <path
            d="M15.4949 7.49219V24.3672M23.9324 15.9297H7.05743"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="square"
            strokeLinejoin="round"
        />
    </svg>
);

export default PlusIcon;
