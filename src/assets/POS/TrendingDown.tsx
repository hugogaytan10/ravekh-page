import React from "react";
//creamos la interfaz para las props
interface TrendingDownIconProps {
  width?: number;
  height?: number;
  color?: string;
  stroke?: number;
}
export const TrendingDownIcon: React.FC<TrendingDownIconProps> = ({
  width = 29,
  height = 27,
  color = "#F93C65",
  stroke = 3,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 29 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.3598 20.0931L22.105 17.5544L16.255 12.1445L11.46 16.5788L2.57715 8.35314L4.2674 6.79004L11.46 13.4416L16.255 9.00721L23.8072 15.9802L26.5524 13.4416V20.0931H19.3598Z"
      fill="#F93C65"
    />
  </svg>
);
