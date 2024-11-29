import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

export const ImageIcon: React.FC<CustomIconProps> = ({
  width = 25,
  height = 25,
  strokeColor = '#6D01D1',
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 25 25"
    fill="none"
  >
    <Path
      d="M20.3125 3.90625H4.6875C3.39308 3.90625 2.34375 4.95558 2.34375 6.25V18.75C2.34375 20.0444 3.39308 21.0938 4.6875 21.0938H20.3125C21.6069 21.0938 22.6562 20.0444 22.6562 18.75V6.25C22.6562 4.95558 21.6069 3.90625 20.3125 3.90625Z"
      stroke={strokeColor}
      strokeLinejoin="round"
    />
    <Path
      d="M16.4062 10.1562C17.2692 10.1562 17.9688 9.4567 17.9688 8.59375C17.9688 7.73081 17.2692 7.03125 16.4062 7.03125C15.5433 7.03125 14.8438 7.73081 14.8438 8.59375C14.8438 9.4567 15.5433 10.1562 16.4062 10.1562Z"
      stroke={strokeColor}
      strokeMiterlimit="10"
    />
    <Path
      d="M14.8438 16.396L10.417 11.9775C10.1353 11.6959 9.75669 11.5325 9.35854 11.5207C8.9604 11.5089 8.57277 11.6496 8.2749 11.9141L2.34375 17.1875M10.9375 21.0938L16.96 15.0713C17.2354 14.7953 17.604 14.6323 17.9935 14.6142C18.383 14.5961 18.7652 14.7243 19.0649 14.9736L22.6562 17.9688"
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

