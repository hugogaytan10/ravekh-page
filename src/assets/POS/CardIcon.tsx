import React from 'react';
import { Svg, Rect, Path } from 'react-native-svg';
import { ThemeLight } from '../../src/Theme/Theme'
interface CustomSvgProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}
const CardIcon: React.FC<CustomSvgProps> = ({
  width = 40,
  height = 40,
  strokeColor = "#6D01D1",
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <Path
        d="M31.875 7.5H8.125C5.70875 7.5 3.75 9.45875 3.75 11.875V28.125C3.75 30.5412 5.70875 32.5 8.125 32.5H31.875C34.2912 32.5 36.25 30.5412 36.25 28.125V11.875C36.25 9.45875 34.2912 7.5 31.875 7.5Z"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.75 15H36.25M10 23.4375H13.75V25H10V23.4375Z"
        stroke={strokeColor}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </Svg>
  );
};


export default CardIcon;
