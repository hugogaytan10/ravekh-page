import React from 'react';
import { Svg, Circle, Rect, G, Polygon } from 'react-native-svg';

interface FlagIconProps {
  width?: number;
  height?: number;
}

export const USAFlagIcon: React.FC<FlagIconProps> = ({ width = 100, height = 100 }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Circular background */}
      <Circle cx="50" cy="50" r="50" fill="white" />

      {/* Red and white stripes */}
      {[...Array(7)].map((_, i) => (
        <Rect
          key={i}
          x="0"
          y={i * 14.2857 * 2 + 7.14285}
          width="100"
          height="14.2857"
          fill="#B22234"
        />
      ))}

      {/* Blue rectangle (union) */}
      <Rect x="0" y="0" width="50" height="50" fill="#3C3B6E" />

      {/* Stars in the union */}
      <G fill="white">
        {[...Array(9)].map((_, row) =>
          [...Array(row % 2 === 0 ? 6 : 5)].map((_, col) => (
            <Polygon
              key={`${row}-${col}`}
              points="2.5,0 3.1,1.5 4.6,1.5 3.4,2.3 3.9,3.8 2.5,3 1.1,3.8 1.6,2.3 0.4,1.5 1.9,1.5"
              transform={`translate(${col * 9 + 3}, ${row * 5.5 + 3}) scale(0.5)`}
            />
          ))
        )}
      </G>
    </Svg>
  );
};

export default USAFlagIcon;
