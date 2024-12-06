import React from 'react';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export const ProductIcon: React.FC<CustomSvgProps> = ({
    width = 31,
    height = 30,
    strokeColor = "#CCCCCC",
    strokeWidth = 3,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 31 30"
            fill="none"
        >
            <path
                d="M4.80664 8.90625V23.9062C4.8085 24.5273 5.05602 25.1223 5.49516 25.5615C5.93429 26.0006 6.52936 26.2481 7.15039 26.25H23.0879C23.7089 26.2481 24.304 26.0006 24.7431 25.5615C25.1823 25.1223 25.4298 24.5273 25.4316 23.9062V8.90625"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M25.666 3.75H4.57227C3.66617 3.75 2.93164 4.48453 2.93164 5.39062V6.79688C2.93164 7.70297 3.66617 8.4375 4.57227 8.4375H25.666C26.5721 8.4375 27.3066 7.70297 27.3066 6.79688V5.39062C27.3066 4.48453 26.5721 3.75 25.666 3.75Z"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
            <path
                d="M18.8691 17.8125L15.1191 21.5625L11.3691 17.8125M15.1191 20.267V13.125"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};


