import React from 'react';
import { Svg, Circle, Rect, G, Path } from 'react-native-svg';

interface FlagIconProps {
  width?: number;
  height?: number;
}

export const PeruFlagIcon: React.FC<FlagIconProps> = ({ width = 100, height = 100 }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Circular background */}
      <Circle cx="50" cy="50" r="50" fill="white" />

      {/* Red stripe on the left */}
      <Rect x="0" y="0" width="33.33" height="100" fill="#D91023" />

      {/* Red stripe on the right */}
      <Rect x="66.66" y="0" width="33.33" height="100" fill="#D91023" />

      {/* Simplified emblem in the center */}
      <G transform="translate(35, 30) scale(0.3)">
        {/* Green branches */}
        <Path
          d="M20 40c2-4 5-8 10-10s8 0 10 5c-3 5-6 10-10 10s-7-3-10-5z"
          fill="#6DA544"
        />
        <Path
          d="M80 40c-2-4-5-8-10-10s-8 0-10 5c3 5 6 10 10 10s7-3 10-5z"
          fill="#6DA544"
        />
        {/* Golden emblem */}
        <Path
          d="M50 30c0 5-4 10-10 10s-10-5-10-10 4-10 10-10 10 5 10 10z"
          fill="#FFDA44"
        />
        <Path
          d="M60 40c0 3-2 5-5 5s-5-2-5-5 2-5 5-5 5 2 5 5z"
          fill="#FFDA44"
        />
        {/* Red ribbon */}
        <Path
          d="M40 50c-2 1-5 1-7 0-1-1 0-3 1-3h5c1 0 2 2 1 3z"
          fill="#D80027"
        />
      </G>
    </Svg>
  );
};

export default PeruFlagIcon;
