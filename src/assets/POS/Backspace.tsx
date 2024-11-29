import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export const BackSpace: React.FC<CustomSvgProps> = ({
    width = 45,
    height = 45,
    strokeColor = "#D9138E",
    strokeWidth = 5,
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 45 45"
            fill="none"
        >
            <Path
                d="M11.8819 34.2896C12.1193 34.5617 12.4122 34.7798 12.7408 34.9292C13.0695 35.0787 13.4263 35.1561 13.7874 35.1562H35.4313C36.1034 35.1532 36.747 34.8849 37.2222 34.4097C37.6974 33.9345 37.9657 33.2909 37.9687 32.6188V12.3812C37.9657 11.7091 37.6974 11.0655 37.2222 10.5903C36.747 10.1151 36.1034 9.84676 35.4313 9.84375H13.7874C13.4267 9.84408 13.0702 9.92141 12.7417 10.0705C12.4133 10.2197 12.1204 10.4372 11.8828 10.7086L4.07196 22.5L11.8819 34.287V34.2896Z"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
            <Path
                d="M29.5901 16.9038L18.1635 28.3305M29.5901 28.3305L18.1635 16.9038"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};
