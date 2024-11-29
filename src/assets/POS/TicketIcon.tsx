import React from 'react';
import Svg, { Path } from 'react-native-svg';


const TicketIcon = ({ width = 25, height = 25, color = "#6D01D1" }) => (
  <Svg width={width} height={height} viewBox="0 0 25 25" fill="none" >
    <Path 
      d="M17.8735 7.12884C17.4673 6.7225 17.2294 6.1778 17.2075 5.60366C17.1856 5.02952 17.3813 4.46828 17.7553 4.03216C17.7862 3.99589 17.8023 3.94927 17.8003 3.90164C17.7983 3.85401 17.7784 3.80889 17.7446 3.77533L15.5898 1.6181C15.5542 1.5825 15.5059 1.5625 15.4555 1.5625C15.4051 1.5625 15.3568 1.5825 15.3212 1.6181L11.8867 5.05267C11.7599 5.17936 11.6645 5.33384 11.6078 5.50384C11.5514 5.67424 11.4561 5.82915 11.3294 5.95629C11.2027 6.08342 11.0481 6.17928 10.8779 6.23627C10.7077 6.29295 10.5531 6.3884 10.4262 6.51507L1.6181 15.3212C1.5825 15.3568 1.5625 15.4051 1.5625 15.4555C1.5625 15.5059 1.5825 15.5542 1.6181 15.5898L3.77289 17.7446C3.80645 17.7784 3.85156 17.7983 3.8992 17.8003C3.94683 17.8023 3.99345 17.7862 4.02972 17.7553C4.46574 17.3808 5.02711 17.1849 5.60145 17.2067C6.17578 17.2284 6.7207 17.4664 7.12711 17.8728C7.53352 18.2792 7.77143 18.8241 7.79321 19.3984C7.81499 19.9728 7.61903 20.5341 7.24457 20.9702C7.21363 21.0064 7.19754 21.053 7.19954 21.1007C7.20153 21.1483 7.22145 21.1934 7.25531 21.227L9.41009 23.3818C9.44571 23.4174 9.49401 23.4374 9.54437 23.4374C9.59473 23.4374 9.64303 23.4174 9.67865 23.3818L18.4872 14.5737C18.6139 14.4467 18.7094 14.2921 18.7661 14.122C18.8225 13.9516 18.9178 13.7967 19.0445 13.6696C19.1712 13.5424 19.3258 13.4466 19.496 13.3896C19.666 13.333 19.8205 13.2375 19.9472 13.1108L23.3818 9.67621C23.4174 9.64059 23.4374 9.59229 23.4374 9.54193C23.4374 9.49157 23.4174 9.44327 23.3818 9.40765L21.227 7.25287C21.1934 7.21901 21.1483 7.19909 21.1007 7.19709C21.053 7.1951 21.0064 7.21119 20.9702 7.24212C20.5346 7.61682 19.9737 7.81331 19.3996 7.79231C18.8255 7.7713 18.2804 7.53436 17.8735 7.12884Z" 
      stroke={color} 
      strokeMiterlimit="10" 
    />
    <Path 
      d="M12.2314 6.85693L11.4253 6.05078M14.3809 9.00635L13.8433 8.46924M16.5303 11.1563L15.9932 10.6187M18.9487 13.5742L18.1426 12.7681" 
      stroke={color} 
      strokeMiterlimit="10" 
      strokeLinecap="round" 
    />
  </Svg>
);

export default TicketIcon;
