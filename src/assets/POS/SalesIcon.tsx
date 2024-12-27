import React from 'react';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export const SalesIcon: React.FC<CustomSvgProps> = ({
    width = 30,
    height = 30,
    strokeColor = "#CCCCCC",
    strokeWidth = 3,
}) => {
    return (
        <svg width={width} height={height} viewBox="0 0 30 30" fill="none" >
            <defs>
                <clipPath id="clip0_77_84">
                    <rect width="30" height="30" fill="white" />
                </clipPath>
            </defs>
            <g clipPath="url(#clip0_77_84)">
                <path
                    d="M18.8479 2.63001L6 18.5089H13.5L11.6537 28.6591C11.6502 28.679 11.6511 28.6995 11.6563 28.719C11.6616 28.7385 11.671 28.7567 11.6841 28.7721C11.6971 28.7876 11.7133 28.8001 11.7317 28.8086C11.75 28.8171 11.77 28.8215 11.7902 28.8214C11.8118 28.8214 11.833 28.8163 11.8522 28.8067C11.8714 28.797 11.8881 28.783 11.901 28.7657L24.75 12.8839H17.25L19.1051 2.73254C19.1076 2.71232 19.1057 2.6918 19.0997 2.67234C19.0936 2.65288 19.0835 2.63493 19.07 2.61969C19.0565 2.60445 19.0398 2.59226 19.0212 2.58393C19.0026 2.57561 18.9825 2.57134 18.9621 2.57141C18.9398 2.5715 18.9178 2.57685 18.898 2.58703C18.8781 2.59722 18.8609 2.61194 18.8479 2.63001Z"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
};