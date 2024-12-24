import React from 'react';

const Stongs = ({ width = 25, height = 25, strokeColor = '#6D01D1' }) => (
  <svg width={width} height={height} viewBox="0 0 25 25" fill="none">
    <path
      d="M17.8367 2H23V11.4412"
      stroke={strokeColor}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="square"
    />
    <path
      d="M3 21.9995L9.63857 9.86081L14.0643 17.9533L21.4405 4.46582"
      stroke={strokeColor}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="square"
    />
  </svg>
);

export default Stongs;
