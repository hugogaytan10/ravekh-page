import React from 'react';
import { Svg, Circle, Polygon } from 'react-native-svg';

interface FlagIconProps {
  width?: number;
  height?: number;
}

export const ChinaFlagIcon: React.FC<FlagIconProps> = ({
  width = 100,
  height = 100,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Red background circle */}
      <Circle cx="50" cy="50" r="50" fill="#DE2910" />

      {/* Large yellow star */}
      <Polygon
        points="25,30 30,40 40,40 32.5,47.5 35,57.5 25,52.5 15,57.5 17.5,47.5 10,40 20,40"
        fill="#FFDE00"
      />

      {/* Small yellow stars */}
      <Polygon
        points="40,15 42,18 46,19 43,22 44,26 40,24 36,26 37,22 34,19 38,18"
        fill="#FFDE00"
      />
      <Polygon
        points="50,25 52,28 56,29 53,32 54,36 50,34 46,36 47,32 44,29 48,28"
        fill="#FFDE00"
      />
      <Polygon
        points="50,45 52,48 56,49 53,52 54,56 50,54 46,56 47,52 44,49 48,48"
        fill="#FFDE00"
      />
      <Polygon
        points="40,55 42,58 46,59 43,62 44,66 40,64 36,66 37,62 34,59 38,58"
        fill="#FFDE00"
      />
    </Svg>
  );
};

export default ChinaFlagIcon;