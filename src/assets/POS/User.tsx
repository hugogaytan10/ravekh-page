import React from 'react';
import Svg, {Path} from 'react-native-svg';

const User = (props: { width: number, height: number, color: string }) => {
 return(
  <Svg width={props.width} height={props.height} viewBox="0 0 35 35" fill="none">
    <Path
        d="M23.5159 9.84375C23.2479 13.4579 20.5081 16.4062 17.5002 16.4062C14.4924 16.4062 11.7478 13.4586 11.4846 9.84375C11.2112 6.08398 13.8772 3.28125 17.5002 3.28125C21.1233 3.28125 23.7893 6.15234 23.5159 9.84375Z"
        stroke={props.color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5002 20.7812C11.5529 20.7812 5.51677 24.0625 4.39978 30.2559C4.26511 31.0023 4.68757 31.7188 5.46892 31.7188H29.5314C30.3134 31.7188 30.7359 31.0023 30.6012 30.2559C29.4836 24.0625 23.4474 20.7812 17.5002 20.7812Z"
        stroke={props.color}
        strokeWidth={3}
        strokeMiterlimit="10"
      />
  </Svg>
);
}

export default User;
