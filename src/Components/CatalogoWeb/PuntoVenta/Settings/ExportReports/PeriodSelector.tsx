import React, { useContext } from "react";
import { AppContext } from '../../../Context/AppContext';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = ["Día", "Mes", "Año"];
  const context = useContext(AppContext);

  return (
    <div
      className={`flex items-center justify-around p-2 rounded-b-lg`}
      style={{
        backgroundColor: context.store.Color || "#6200EE",
      }}
    >
      {periods.map((period) => (
        <button
          key={period}
          className={`px-5 py-2 rounded-full ${
            selectedPeriod === period
              ? "bg-white text-primary"
              : "bg-transparent text-white"
          }`}
          style={{
            color: selectedPeriod === period
              ? context.store.Color || "#6200EE"
              : "#FFFFFF",
          }}
          onClick={() => onPeriodChange(period)}
        >
          <span className="font-semibold text-base">{period}</span>
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
