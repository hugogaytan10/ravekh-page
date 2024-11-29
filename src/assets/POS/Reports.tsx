import React from 'react';
import Svg, { G, Path, Defs, ClipPath, Rect } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export const ReportIcon: React.FC<CustomSvgProps> = ({
    width = 31,
    height = 30,
    strokeColor = "#CCCCCC",
    strokeWidth = 3,
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 31 30"
            fill="none"
        >
            <Defs>
                <ClipPath id="clip0_77_153">
                    <Rect width="30" height="30" fill="white" transform="translate(0.0917969)" />
                </ClipPath>
            </Defs>
            <G clipPath="url(#clip0_77_153)">
                <Path
                    d="M1.9668 1.875V27.1875C1.9668 27.4361 2.06557 27.6746 2.24138 27.8504C2.4172 28.0262 2.65566 28.125 2.9043 28.125H28.2168"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M9.23242 13.125H6.88867C6.24146 13.125 5.7168 13.6497 5.7168 14.2969V23.2031C5.7168 23.8503 6.24146 24.375 6.88867 24.375H9.23242C9.87963 24.375 10.4043 23.8503 10.4043 23.2031V14.2969C10.4043 13.6497 9.87963 13.125 9.23242 13.125Z"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M17.6699 10.3125H15.3262C14.679 10.3125 14.1543 10.8372 14.1543 11.4844V23.2031C14.1543 23.8503 14.679 24.375 15.3262 24.375H17.6699C18.3171 24.375 18.8418 23.8503 18.8418 23.2031V11.4844C18.8418 10.8372 18.3171 10.3125 17.6699 10.3125Z"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M26.0859 6.5625H23.7422C23.095 6.5625 22.5703 7.08717 22.5703 7.73438V23.2031C22.5703 23.8503 23.095 24.375 23.7422 24.375H26.0859C26.7331 24.375 27.2578 23.8503 27.2578 23.2031V7.73438C27.2578 7.08717 26.7331 6.5625 26.0859 6.5625Z"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
        </Svg>
    );
};

