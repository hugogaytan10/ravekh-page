import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Stongs = ({ width = 25, height = 25, strokeColor = '#6D01D1' }) => (
  <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
    <Path
      d="M17.8367 2H23V11.4412"
      stroke={strokeColor}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="square"
    />
    <Path
      d="M3 21.9995L9.63857 9.86081L14.0643 17.9533L21.4405 4.46582"
      stroke={strokeColor}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="square"
    />
  </Svg>
);

export default Stongs;
