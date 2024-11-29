import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface CustomSvgProps {
  width?: number;
  height?: number;
  fillColor?: string;
}

export const FinanceIcon: React.FC<CustomSvgProps> = ({
  width = 31,
  height = 30,
  strokeColor = '#CCCCCC',
  strokeWidth = 1,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 31 30">
      <Path
        d="M14.8203 28.125V25.991C10.1639 25.7227 7.33496 23.3238 7.32031 19.6875H11.5391C11.6428 21.2309 12.9371 22.4092 14.8203 22.6172V16.875L13.2518 16.4648C9.67754 15.634 7.76504 13.5709 7.76504 10.4836C7.76504 6.84434 10.3719 4.45781 14.8203 4.10156V1.875H16.6953V4.10156C21.2299 4.4707 23.668 6.89883 23.7266 10.3125H19.5078C19.4633 8.90273 18.5803 7.77012 16.6953 7.61719V13.0078L18.5012 13.4344C22.2975 14.2652 24.1953 16.2305 24.1953 19.4531C24.1953 23.223 21.6324 25.657 16.6953 25.9758V28.125H14.8203ZM14.8203 12.6562V7.61719C13.2037 7.70625 12.0506 8.69941 12.0506 10.1092C12.0506 11.4158 13.0109 12.2701 14.8203 12.6562ZM16.6953 17.2266V22.6172C18.9307 22.527 19.9988 21.5086 19.9988 19.9354C19.9988 18.4951 18.9307 17.5254 16.6953 17.2266Z"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={strokeColor}
      />
    </Svg>
  );
};
