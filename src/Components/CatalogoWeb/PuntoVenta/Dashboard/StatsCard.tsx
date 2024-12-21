import React from "react";
import { TrendingDownIcon } from "../../../../assets/POS/TrendingDown";
import { TrendingUpIcon } from "../../../../assets/POS/TrendingUp";
import { useNavigate } from "react-router-dom";
interface StatsCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  percentage: string;
  icon: React.ReactNode;
  bgColor: string;
  navigation: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  percentage,
  icon,
  bgColor,
  navigation,
}) => {
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500";
  const trendIcon = trend === "up" ? <TrendingUpIcon/> : <TrendingDownIcon/>;
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center rounded-xl bg-white shadow-md p-6 border border-gray-200"
    onClick={() => navigation && navigate(navigation)}
    >
      {/* Text Section */}
      <div className="ml-6">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        <div className="mt-2 flex items-center text-sm font-medium">
          <span className={`${trendColor} flex items-center`}>
            {trendIcon} {percentage}
          </span>
          <span className="ml-2 text-gray-500">
            {trend === "up" ? "Más que ayer" : "Menor a ayer"}
          </span>
        </div>
      </div>
      {/* Icon Section */}
      <div
        className={`flex items-center justify-center h-14 w-14 rounded-full`}
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
    </div>
  );
};
