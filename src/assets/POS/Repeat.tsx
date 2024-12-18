import React from 'react';


interface CustomSvgProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

const Repeat: React.FC<CustomSvgProps> = ({
  width = 30,
  height = 30,
  strokeColor = "#6D01D1",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
    >
      <path
        d="M18.75 7.03125L21.5625 9.84375L18.75 12.6562"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M20.625 9.84375H3.75V15.4688"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M11.25 22.9688L8.4375 20.1562L11.25 17.3438"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
      <path
        d="M9.375 20.1562H26.25V14.5312"
        stroke={strokeColor}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="square"
      />
    </svg>
  );
};

export default Repeat;
