import React from 'react';

interface CustomSvgProps {
    width?: number;
    height?: number;
    fillColor?: string;
}

const Coupon: React.FC<CustomSvgProps> = ({
    width = 40,
    height = 40,
    fillColor = "#FFFFFF",
}) => {
    return (

        <svg width={width} height={height} viewBox="0 0 40 40" fill="none">
            <path d="M15 7.5V13.75M15 16.25V25M15 27.5V32.5M3.75 31.25H36.25V25C35 24.5825 32.5 23 32.5 20C32.5 16.25 36.25 16.25 36.25 15V8.75H3.75V15C5 15.4175 7.5 17 7.5 20C7.5 23.75 3.75 23.75 3.75 25V31.25Z" stroke={fillColor} strokeWidth="3" strokeLinejoin="round" />
        </svg>
    );
};

export default Coupon;
