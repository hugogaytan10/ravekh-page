import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ListIcon = ({ width = 20, height = 20, color = "#565656" }) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" >
    <Path 
      d="M5.625 5.625H18.125M5.625 10H18.125M5.625 14.375H18.125" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinejoin="round"
    />
    <Path 
      d="M2.5 5H3.75V6.25H2.5V5ZM2.5 9.375H3.75V10.625H2.5V9.375ZM2.5 13.75H3.75V15H2.5V13.75Z" 
      stroke={color} 
      strokeLinecap="square" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default ListIcon;
