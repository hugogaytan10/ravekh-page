import React from 'react';
import Svg, { G, Path, ClipPath, Defs, Rect } from 'react-native-svg';

interface CustomSvgProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

const Tv: React.FC<CustomSvgProps> = ({
  width = 33,
  height = 33,
  strokeColor = "#6D01D1",
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 33 33"
      fill="none"
    >
      <G clipPath="url(#clip0_410_1301)">
        <Path
          d="M28.5785 6.76562H4.59597C3.48657 6.76562 2.58722 7.66497 2.58722 8.77437V21.7569C2.58722 22.8663 3.48657 23.7656 4.59597 23.7656H28.5785C29.6879 23.7656 30.5872 22.8663 30.5872 21.7569V8.77437C30.5872 7.66497 29.6879 6.76562 28.5785 6.76562Z"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <Path
          d="M8.58722 26.7656H24.5872"
          stroke={strokeColor}
          strokeWidth="3"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_410_1301">
          <Rect width="32" height="32" fill="white" transform="translate(0.587219 0.765625)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default Tv;