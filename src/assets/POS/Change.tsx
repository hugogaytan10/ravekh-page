import React from "react";

//creamos una interfaz para recibir las props
interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
  stroke?: number;
}
export const Change: React.FC<PlusIconProps> = ({
  width = 37,
  height = 34,
  color = "#00B69B",
  stroke = 3,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 37 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1151_1872)">
      <path
        d="M22.305 10.4239L17.8096 6.27444L22.305 2.125M15.4917 22.8722L19.9871 27.0216L15.4917 31.1711"
        stroke="#00B69B"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.81928 9.38627C10.6813 9.38627 12.1908 7.99294 12.1908 6.27419C12.1908 4.55543 10.6813 3.16211 8.81928 3.16211C6.95724 3.16211 5.44775 4.55543 5.44775 6.27419C5.44775 7.99294 6.95724 9.38627 8.81928 9.38627Z"
        stroke="#00B69B"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M29.0483 30.1333C30.9103 30.1333 32.4198 28.74 32.4198 27.0213C32.4198 25.3025 30.9103 23.9092 29.0483 23.9092C27.1862 23.9092 25.6768 25.3025 25.6768 27.0213C25.6768 28.74 27.1862 30.1333 29.0483 30.1333Z"
        stroke="#00B69B"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.9338 6.27441H24.834C25.9517 6.27441 27.0237 6.68426 27.814 7.4138C28.6044 8.14333 29.0484 9.13279 29.0484 10.1645V23.9095M18.8636 27.0216H12.9634C11.8457 27.0216 10.7737 26.6118 9.98339 25.8822C9.19304 25.1527 8.74902 24.1632 8.74902 23.1315V9.38649"
        stroke="#00B69B"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1151_1872">
        <rect
          width="35.9629"
          height="33.1955"
          fill="white"
          transform="translate(0.952148 0.0498047)"
        />
      </clipPath>
    </defs>
  </svg>
);
