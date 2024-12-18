import React, { useContext, useState } from "react";
import MonthNavigator from "./MonthNavigator";
import PeriodSelector from "./PeriodSelector";
import { ReportDetails } from "./ReportDetails";
import { AppContext } from "../../Context/AppContext";
export const MainReports: React.FC<{ navigation: any }> = ({ navigation }) => {
    const context = useContext(AppContext);
    const [selectedPeriod, setSelectedPeriod] = useState("Día");
    const [currentYear] = useState(new Date().getFullYear());

    // Función para obtener la fecha actual en formato "dd MMM yyyy"
    const getCurrentDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("es", { month: "short" }).replace(".", "");
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Verificar si el rol es "AYUDANTE"
    const userRole = context.user?.Role || "UNKNOWN";

    if (userRole === "AYUDANTE") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
                <p className="text-center text-gray-600 text-lg font-semibold">
                    No tienes acceso a esta pantalla. Contacta al administrador o gerente.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Encabezado */}
            <header
                className="p-4 text-white"
                style={{
                    backgroundColor: context.store.Color || "#6200EE",
                }}
            >
                <h1 className="text-center font-semibold text-lg">Reportes</h1>
            </header>

            {/* Selector de periodos */}
            <div className="flex-grow p-4">
                {selectedPeriod === "Día" && <MonthNavigator label={getCurrentDate()} />}
                {selectedPeriod === "Mes" && (
                    <MonthNavigator
                        label={new Date().toLocaleString("es", { month: "long" })}
                    />
                )}
                {selectedPeriod === "Año" && (
                    <MonthNavigator label={currentYear.toString()} />
                )}

                <PeriodSelector
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                />

                {context.store.Plan === "GRATUITO" ? (
                    <p className="text-center text-gray-500 text-lg font-semibold">
                        Tu plan no tiene esta función
                    </p>
                ) : (
                    <ReportDetails selectedPeriod={selectedPeriod} navigation={navigation} />
                )}
            </div>
        </div>
    );
};

export default MainReports;
