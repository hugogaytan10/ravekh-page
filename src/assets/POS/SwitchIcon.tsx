// ArrowIcon.js
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const SwitchIcon = (props) => (
  <Svg width={30} height={30} viewBox="0 0 30 30" fill="none" {...props}>
    <Path
      d="M18.75 7.03125L21.5625 9.84375L18.75 12.6562"
      stroke="black"
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
    <Path
      d="M20.625 9.84375H3.75V15.4688"
      stroke="black"
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
    <Path
      d="M11.25 22.9688L8.4375 20.1562L11.25 17.3438"
      stroke="black"
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
    <Path
      d="M9.375 20.1562H26.25V14.5312"
      stroke="black"
      strokeWidth="3"
      strokeMiterlimit="10"
      strokeLinecap="square"
    />
  </Svg>
);

export default SwitchIcon;
