import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { fetchReportData } from "./Petitions";
import { ChevronGo } from "../../../../assets/POS/ChevronGo";
import MoneyIcon from "../../../../assets/POS/MoneyIcon";
import { SalesIcon } from "../../../../assets/POS/SalesIcon";
import CardIcon from "../../../../assets/POS/CardIcon";
import { ThemeLight } from "../Theme/Theme";
import { useNavigate } from "react-router-dom";

interface CurrencyDetail {
    currency: string;
    total: number;
}

interface ReportDetails {
    balance: CurrencyDetail[];
    income: CurrencyDetail[];
    profit: CurrencyDetail[];
    averagePurchase: CurrencyDetail[];
    sales: CurrencyDetail[];
    cardPercentage: CurrencyDetail[];
    cashPercentage: CurrencyDetail[];
    bestSeller: string;
    bestCategory: string;
}

interface ReportDetailsProps {
    selectedPeriod: string;
    navigation: any;
}

export const ReportDetails: React.FC<ReportDetailsProps> = ({
    selectedPeriod,
}) => {
    const { user } = useContext(AppContext);
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigate();
    const [reportDetails, setReportDetails] = useState<ReportDetails>({
        balance: [],
        income: [],
        profit: [],
        averagePurchase: [],
        sales: [],
        cardPercentage: [],
        cashPercentage: [],
        bestSeller: "",
        bestCategory: "",
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const reportData = await fetchReportData(user.Business_Id, selectedPeriod);
            if (reportData) {
                setReportDetails({
                    balance: reportData.balance || [],
                    income: reportData.income || [],
                    profit: reportData.profit || [],
                    averagePurchase: reportData.averagePurchase || [],
                    sales: reportData.sales || [],
                    cardPercentage: reportData.cardPercentage || [],
                    cashPercentage: reportData.cashPercentage || [],
                    bestSeller: reportData.bestSeller || "",
                    bestCategory: reportData.bestCategory || "",
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedPeriod, user.Business_Id]);

    const renderCard = (
        title: string,
        values: CurrencyDetail[] | string,
        icon: JSX.Element,
        onClick?: () => void,
        valueColor: string = "#888"
    ) => {
        return (
            <div
                className="bg-white rounded-lg shadow-md p-12 mb-6 transition-transform transform hover:scale-95 w-full sm:w-1/2"
                onClick={onClick}
            >
                <div className="flex items-center">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="ml-6 flex-grow">
                        {/* Título responsivo */}
                        <p className="text-gray-700 font-semibold truncate text-lg sm:text-xl md:text-2xl lg:text-3xl">
                            {title}
                        </p>
                        {Array.isArray(values) && values.length > 0 ? (
                            values.map((item, index) => (
                                <p
                                    key={index}
                                    className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl truncate"
                                    style={{ color: valueColor }}
                                >
                                    {`${item.currency}: $${item.total.toFixed(2)}`}
                                </p>
                            ))
                        ) : (
                            <p
                                className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl"
                                style={{ color: valueColor }}
                            >
                                {values && typeof values === "string" ? values : "Sin datos"}
                            </p>
                        )}
                    </div>
                    {!["Balance", "Ganancia", "Compra Promedio"].includes(title) && (
                        <ChevronGo height={50} width={50} stroke={ThemeLight.textColor} />
                    )}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-gray-600 text-lg">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h2 className="text-gray-700 font-semibold mb-6 text-2xl">Balance General</h2>
                <div className="flex flex-wrap -mx-4">
                    {renderCard(
                        "Balance",
                        reportDetails.balance,
                        <MoneyIcon width={50} height={50} color={context.store.Color} />
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-gray-700 font-semibold mb-6 text-2xl">Resumen</h2>
                <div className="flex flex-wrap -mx-4">
                    {renderCard(
                        "Ingresos",
                        reportDetails.income,
                        <SalesIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/report-income/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                    {renderCard(
                        "Ganancia",
                        reportDetails.profit,
                        <MoneyIcon width={50} height={50} color={context.store.Color} />
                    )}
                    {renderCard(
                        "Compra Promedio",
                        reportDetails.averagePurchase,
                        <SalesIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />
                    )}
                    {renderCard(
                        "Ventas",
                        reportDetails.sales,
                        <SalesIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/report-sales/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-gray-700 font-semibold mb-6 text-2xl">Métodos de Pago</h2>
                <div className="flex flex-wrap -mx-4">
                    {renderCard(
                        "Tarjeta",
                        reportDetails.cardPercentage,
                        <CardIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/card-income/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                    {renderCard(
                        "Efectivo",
                        reportDetails.cashPercentage,
                        <MoneyIcon width={50} height={50} color={context.store.Color} />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/cash-income/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-gray-700 font-semibold mb-6 text-2xl">Destacados</h2>
                <div className="flex flex-wrap -mx-4">
                    {renderCard(
                        "Producto más vendido",
                        reportDetails.bestSeller,
                        <SalesIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/best-selling/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                    {renderCard(
                        "Mejores Categorías",
                        reportDetails.bestCategory,
                        <SalesIcon
                            width={50}
                            height={50}
                            strokeColor={context.store.Color}
                        />,
                        () => {
                            context.setShowNavBarBottom(false);
                            navigation("/best-category-selling/" + selectedPeriod + "/" + user.Business_Id)
                        }
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetails;
