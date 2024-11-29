import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

interface CustomSvgProps {
    width?: number;
    height?: number;
    strokeColor?: string;
}

const Barbell: React.FC<CustomSvgProps> = ({
    width = 23,
    height = 23,
    strokeColor = "#6D01D1",
}) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 23 23"
            fill="none"
        >
            <G clipPath="url(#clip0_121_653)">
                <Path
                    d="M2.19922 11.5H20.8012"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M18.6548 6.49183C18.6548 6.09669 18.3345 5.77637 17.9393 5.77637C17.5442 5.77637 17.2239 6.09669 17.2239 6.49183V16.5083C17.2239 16.9034 17.5442 17.2237 17.9393 17.2237C18.3345 17.2237 18.6548 16.9034 18.6548 16.5083V6.49183Z"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M5.77638 6.49183C5.77638 6.09669 5.45606 5.77637 5.06092 5.77637C4.66578 5.77637 4.34546 6.09669 4.34546 6.49183V16.5083C4.34546 16.9034 4.66578 17.2237 5.06092 17.2237C5.45606 17.2237 5.77638 16.9034 5.77638 16.5083V6.49183Z"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M2.1991 8.99591C2.1991 8.79834 2.03894 8.63818 1.84137 8.63818C1.6438 8.63818 1.48364 8.79834 1.48364 8.99591V14.0041C1.48364 14.2017 1.6438 14.3619 1.84137 14.3619C2.03894 14.3619 2.1991 14.2017 2.1991 14.0041V8.99591Z"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Path
                    d="M21.5165 8.99591C21.5165 8.79834 21.3563 8.63818 21.1588 8.63818C20.9612 8.63818 20.801 8.79834 20.801 8.99591V14.0041C20.801 14.2017 20.9612 14.3619 21.1588 14.3619C21.3563 14.3619 21.5165 14.2017 21.5165 14.0041V8.99591Z"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </G>
            <Defs>
                <ClipPath id="clip0_121_653">
                    <Rect width="22.8947" height="22.8947" fill="white" transform="translate(0.0527344 0.0527344)" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

export default Barbell;
