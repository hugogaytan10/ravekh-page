import React from 'react';
import { Svg, Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

const Flash = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Defs>
      <ClipPath id="clip0_540_703">
        <Rect width="20" height="20" fill="white" />
      </ClipPath>
    </Defs>
    <G id="flash-outline" clipPath="url(#clip0_540_703)">
      <Path
        id="Vector"
        d="M12.5652 1.75342L4 12.3394H9L7.76914 19.1062C7.7668 19.1194 7.7674 19.1331 7.77089 19.1461C7.77439 19.1591 7.7807 19.1712 7.78938 19.1815C7.79806 19.1918 7.80889 19.2001 7.82112 19.2058C7.83335 19.2115 7.84667 19.2144 7.86016 19.2144C7.8745 19.2143 7.88864 19.211 7.90146 19.2045C7.91428 19.1981 7.92541 19.1887 7.93398 19.1772L16.5 8.58936H11.5L12.7367 1.82178C12.7384 1.8083 12.7372 1.79461 12.7331 1.78164C12.7291 1.76867 12.7223 1.7567 12.7133 1.74654C12.7043 1.73638 12.6932 1.72825 12.6808 1.7227C12.6684 1.71716 12.655 1.71431 12.6414 1.71436C12.6265 1.71442 12.6119 1.71798 12.5986 1.72477C12.5854 1.73156 12.574 1.74137 12.5652 1.75342Z"
        stroke="#565656"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

export default Flash;