import React from "react";
//creamos la interfaz para las props
interface TrendingUpIconProps {
  width?: number;
  height?: number;
  color?: string;
  stroke?: number;
}
export const TrendingUpIcon: React.FC<TrendingUpIconProps> = ({
  width = 30,
  height = 27,
  color = "#00B69B",
  stroke = 3,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 30 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.7705 6.79004L22.5156 9.3287L16.6657 14.7386L11.8706 10.3043L2.98779 18.53L4.67805 20.0931L11.8706 13.4416L16.6657 17.8759L24.2179 10.9029L26.9631 13.4416V6.79004H19.7705Z"
      fill={color}
    />
  </svg>
);
