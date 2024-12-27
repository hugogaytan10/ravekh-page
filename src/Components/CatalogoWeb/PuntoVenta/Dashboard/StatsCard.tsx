import React, { useContext, useState, useEffect } from "react";
import { TrendingDownIcon } from "../../../../assets/POS/TrendingDown";
import { TrendingUpIcon } from "../../../../assets/POS/TrendingUp";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

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
  const [loading, setLoading] = useState(true);
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500";
  const trendIcon = trend === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />;
  const navigate = useNavigate();
  const context = useContext(AppContext);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Finaliza la carga después de 200ms (puedes ajustar este tiempo)
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex justify-between items-center rounded-xl bg-white shadow-md p-6 border border-gray-200"
      onClick={() => {
        if (navigation !== "") {
          context.setShowNavBarBottom(false); // Hide Bottom Navbar
          navigate(navigation); // Navigate to the specified route
        }
      }}
    >
      {/* Text Section */}
      <div className="ml-6">
        {loading ? (
          // Skeleton loader
          <div className="animate-pulse space-y-4">
            {/* Título */}
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            {/* Valor */}
            <div className="h-8 bg-gray-300 rounded w-40"></div>
            {/* Porcentaje */}
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
      {/* Icon Section */}
      <div
        className={`flex items-center justify-center h-14 w-14 rounded-full`}
        style={{ backgroundColor: bgColor }}
      >
        {loading ? (
          // Skeleton for the icon
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
        ) : (
          icon
        )}
      </div>
    </div>
  );
};
