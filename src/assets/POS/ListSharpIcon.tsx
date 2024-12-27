import React from 'react';

const ListSharpIcon = (props) => (
  <svg width={props.width || 20} height={props.height || 20} viewBox="0 0 20 20" fill="none">
    <g id="list-sharp">
      <path
        id="Vector"
        d="M5.625 5.625H18.125M5.625 10H18.125M5.625 14.375H18.125"
        stroke={props.stroke || "#565656"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        id="Vector_2"
        d="M2.5 5H3.75V6.25H2.5V5ZM2.5 9.375H3.75V10.625H2.5V9.375ZM2.5 13.75H3.75V15H2.5V13.75Z"
        stroke={props.stroke || "#565656"}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default ListSharpIcon;
