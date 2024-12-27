// YellowCircleIcon.js
import React from 'react';
import Svg, { Circle } from 'react-native-svg';

const ColorIcon = (props) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Circle cx={10} cy={10} r={10} fill="#FFE70F" />
  </Svg>
);

export default ColorIcon;
