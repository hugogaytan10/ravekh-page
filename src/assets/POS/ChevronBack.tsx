import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export const ChevronBack: React.FC<CustomSvgProps> = ({
    width = 35,
    height = 35,
    strokeColor = "#565656",
    strokeWidth = 4,
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 35 35"
            fill="none"
        >
            <Path
                d="M22.4219 7.65625L12.5781 17.5L22.4219 27.3438"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

