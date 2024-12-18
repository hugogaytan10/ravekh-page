import React from 'react';


const Check = (props) => (
  <svg
    width={props.width || 50}
    height={props.height || 50}
    viewBox="0 0 45 45"
    fill="none">
   
    <path
      d="M34.375 17.1875L21.25 32.8125L15.625 26.5625"
      stroke={props.stroke || "#fff"}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Check;
