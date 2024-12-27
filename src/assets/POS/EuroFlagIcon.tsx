import React from 'react';
import { Svg, Circle, Polygon } from 'react-native-svg';

interface FlagIconProps {
  width?: number;
  height?: number;
}

export const EUFlagIcon: React.FC<FlagIconProps> = ({ width = 100, height = 100 }) => {
  const generateStarPoints = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    const step = Math.PI / spikes;
    let path = '';
    for (let i = 0; i < 2 * spikes; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(i * step) * radius;
      const y = cy - Math.sin(i * step) * radius;
      path += `${i === 0 ? 'M' : 'L'}${x},${y} `;
    }
    return `${path}Z`;
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Circular background */}
      <Circle cx="50" cy="50" r="50" fill="#003399" />

      {/* 12 Yellow Stars */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 360) / 12 - 90; // Space 12 stars evenly in a circle
        const x = 50 + Math.cos((angle * Math.PI) / 180) * 35;
        const y = 50 + Math.sin((angle * Math.PI) / 180) * 35;
        return (
          <Polygon
            key={i}
            points={generateStarPoints(x, y, 5, 3, 1.5)}
            fill="#FFCC00"
          />
        );
      })}
    </Svg>
  );
};

export default EUFlagIcon;
