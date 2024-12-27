import React, { useContext } from "react";
import { AppContext } from "../../../Context/AppContext";

interface MonthNavigatorProps {
  label: string;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ label }) => {
  const context = useContext(AppContext);

  return (
    <div
      className="h-12"
      style={{
        backgroundColor: context.store.Color || "#6200EE",
      }}
    >
      <div
        className="flex items-center justify-center h-11 w-[90%] mx-auto rounded-md"
        style={{
          backgroundColor: context.store.Color || "#6200EE",
        }}
      >
        {/* Texto que muestra la fecha/mes/año */}
        <span className="text-white text-center font-semibold text-base">
          {label}
        </span>
      </div>
    </div>
  );
};

export default MonthNavigator;
