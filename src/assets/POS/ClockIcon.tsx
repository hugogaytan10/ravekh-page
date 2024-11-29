import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ClockIcon = ({ width = 15, height = 15, color = "black" }) => (
    <Svg width={width} height={height} viewBox="0 0 15 15" fill="none">
        <Path
            d="M7.5 1.875C4.39453 1.875 1.875 4.39453 1.875 7.5C1.875 10.6055 4.39453 13.125 7.5 13.125C10.6055 13.125 13.125 10.6055 13.125 7.5C13.125 4.39453 10.6055 1.875 7.5 1.875Z"
            stroke={color}
            strokeMiterlimit="10"
        />
        <Path
            d="M7.5 3.75V7.96875H10.3125"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default ClockIcon;
