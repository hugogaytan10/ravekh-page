import React from 'react';

interface CustomSvgProps {
  width?: number;
  height?: number;
  fillColor?: string;
}

const CreditCardIcon: React.FC<CustomSvgProps> = ({
  width = 40,
  height = 40,
  fillColor = "#6D01D1",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M3 32.25C3 32.5815 3.1317 32.8995 3.36612 33.1339C3.60054 33.3683 3.91848 33.5 4.25 33.5H36.75C37.0815 33.5 37.3995 33.3683 37.6339 33.1339C37.8683 32.8995 38 32.5815 38 32.25V17.0938H3V32.25ZM8.15625 21.4688C8.15625 21.303 8.2221 21.144 8.33931 21.0268C8.45652 20.9096 8.61549 20.8438 8.78125 20.8438H15.9688C16.1345 20.8438 16.2935 20.9096 16.4107 21.0268C16.5279 21.144 16.5938 21.303 16.5938 21.4688V26.4688C16.5938 26.6345 16.5279 26.7935 16.4107 26.9107C16.2935 27.0279 16.1345 27.0938 15.9688 27.0938H8.78125C8.61549 27.0938 8.45652 27.0279 8.33931 26.9107C8.2221 26.7935 8.15625 26.6345 8.15625 26.4688V21.4688ZM36.75 6H4.25C3.91848 6 3.60054 6.1317 3.36612 6.36612C3.1317 6.60054 3 6.91848 3 7.25V12.4062H38V7.25C38 6.91848 37.8683 6.60054 37.6339 6.36612C37.3995 6.1317 37.0815 6 36.75 6Z"
        fill={fillColor}
      />
    </svg>
  );
};

export default CreditCardIcon;