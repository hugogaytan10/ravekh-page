import React from 'react';
import { Svg, Circle, Rect, G, Path } from 'react-native-svg';

interface FlagIconProps {
  width?: number;
  height?: number;
}

export const MexicoFlagIcon: React.FC<FlagIconProps> = ({ width = 100, height = 100 }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Circular background */}
      <Circle cx="50" cy="50" r="50" fill="white" />

      {/* Green stripe */}
      <Rect x="0" y="0" width="33.33" height="100" fill="#006847" />

      {/* Red stripe */}
      <Rect x="66.66" y="0" width="33.33" height="100" fill="#CE1126" />

      {/* Simplified emblem in the center */}
      <G transform="translate(35, 30) scale(0.3)">
        <Path
          d="M50 35c0 6-4 11-10 11s-10-5-10-11c0-7 4-11 10-11s10 4 10 11z"
          fill="#A67C52"
        />
        <Path
          d="M40 40c1.5-1 2.5-3 2.5-5s-1-4-2.5-5c-1.5 1-2.5 3-2.5 5s1 4 2.5 5z"
          fill="#6DA544"
        />
        <Path
          d="M48 48c-2 0-3-1-3-2s1-2 3-2 3 1 3 2-1 2-3 2z"
          fill="#D80027"
        />
        <Path
          d="M45 50c-2 1-5 1-7 0-1-1 0-3 1-3h5c1 0 2 2 1 3z"
          fill="#FFDA44"
        />
      </G>
    </Svg>
  );
};

export default MexicoFlagIcon;

