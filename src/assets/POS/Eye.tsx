import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomEyeIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

export const Eye: React.FC<CustomEyeIconProps> = ({ width = 20, height = 20, strokeColor = '#CCCCCC' }) => (
  <Svg
    width={width} // Width of the SVG
    height={height} // Height of the SVG
    viewBox="0 0 20 20" // ViewBox for scaling
    fill="none" // No fill color by default
  >
    <Path
      d="M9.987 4.375c-3.044 0-6.167 1.762-8.626 5.286-.07.102-.109.222-.111.346-.002.123.033.245.1.348 1.889 2.957 4.97 5.269 8.637 5.269 3.626 0 6.771-2.32 8.663-5.283.065-.102.1-.22.1-.341 0-.121-.035-.239-.1-.341-1.897-2.93-5.065-5.285-8.665-5.285zm.013 8.75c1.726 0 3.125-1.399 3.125-3.125s-1.399-3.125-3.125-3.125S6.875 8.274 6.875 10s1.399 3.125 3.125 3.125z"
      stroke={strokeColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 13.125c1.726 0 3.125-1.399 3.125-3.125S11.726 6.875 10 6.875 6.875 8.274 6.875 10s1.399 3.125 3.125 3.125z"
      stroke={strokeColor}
      strokeWidth={3}
      strokeMiterlimit={10}
    />
  </Svg>
);

