import React, { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

interface PeriodSelectorProps {
    selectedPeriod: string;
    onPeriodChange: (period: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    selectedPeriod,
    onPeriodChange,
}) => {
    const periods = ["Día", "Mes", "Año"];
    const context = useContext(AppContext);

    const backgroundColor = context.store.Color || "#6200EE";
    const selectedColor = "#FFFFFF";

    return (
        <div
            className="flex items-center justify-around w-full py-2 rounded-b-lg border-none -mt-1"
            style={{ backgroundColor }}
        >
            {periods.map((period) => (
                <button
                    key={period}
                    className={`flex items-center justify-center px-5 py-2 rounded-full text-sm font-semibold ${selectedPeriod === period
                            ? "bg-white text-gray-900"
                            : "text-white"
                        }`}
                    style={
                        selectedPeriod === period
                            ? { color: backgroundColor }
                            : undefined
                    }
                    onClick={() => onPeriodChange(period)}
                >
                    {period}
                </button>
            ))}
        </div>
    );
};

export default PeriodSelector;
