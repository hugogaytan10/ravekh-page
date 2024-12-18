import React, { useContext } from "react";
import { AppContext } from "../../Context/AppContext";

interface MonthNavigatorProps {
    label: string;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({ label }) => {
    const context = useContext(AppContext);

    const backgroundColor = context.store.Color || "#6200EE";

    return (
        <div
            className="month-navigator-container flex items-center justify-center w-full h-12"
            style={{ backgroundColor }}
        >
            <span className="text-white font-semibold text-base">{label}</span>
        </div>
    );
};

export default MonthNavigator;
