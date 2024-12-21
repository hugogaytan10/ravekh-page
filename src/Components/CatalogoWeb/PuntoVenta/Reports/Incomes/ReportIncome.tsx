import React, { useState, useEffect, useContext } from "react";
import { getIncomesToday, getIncomesMonth, getIncomesYear } from "../Petitions";
import { useNavigate, useParams } from "react-router-dom";
import MoneyIcon from "../../../../../assets/POS/MoneyIcon";
import { AppContext } from "../../../Context/AppContext";

interface IIncome {
    Id?: number;
    Name: string;
    Amount: number;
    Date?: string;
    MoneyTipe?: string;
}



export const ReportIncome: React.FC = () => {
    const { businessId, period } = useParams();
    const navigation = useNavigate();
    const context = useContext(AppContext);
    const [incomes, setIncomes] = useState<IIncome[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [noData, setNoData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadIncomes = async () => {
        setLoading(true);
        setError(null);
        setNoData(false);

        try {
            if (!businessId) {
                setError('ID de negocio no válido.');
                return;
            }
            if (!period) {
                setError('Período no válido.');
                return;
            }

            let response: { Incomes: IIncome[] | null; TotalsByCurrency: any[] } | null = null;

            switch (period) {
                case 'Día':
                    response = await getIncomesToday(businessId.toString());
                    break;
                case 'Mes':
                    response = await getIncomesMonth(businessId.toString());
                    break;
                case 'Año':
                    response = await getIncomesYear(businessId.toString());
                    break;
                default:
                    setError('Período no válido.');
                    return;
            }

            if (!response || !response.Incomes || response.Incomes.length === 0) {
                setNoData(true);
                setIncomes([]);
                return;
            }

            setIncomes(response.Incomes);
        } catch (err) {
            setError('Error al cargar los ingresos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIncomes();
    }, [period, businessId]);

    const totalsByCurrency = incomes.reduce((totals, income) => {
        const moneyType = income.MoneyTipe || "Desconocido";
        totals[moneyType] = (totals[moneyType] || 0) + income.Amount;
        return totals;
    }, {} as Record<string, number>);

    const renderSummary = () =>
        Object.keys(totalsByCurrency).map((currency) => (
            <div
                key={currency}
                className="bg-green-500 text-white text-lg font-semibold rounded-lg p-4 mb-4"
            >
                {currency}: ${totalsByCurrency[currency].toFixed(2)}
            </div>
        ));

    const renderIncome = (income: IIncome) => (
        <div
            key={income.Id}
            className="bg-white rounded-lg shadow-md p-6 mb-4 flex items-center border border-gray-200"
        >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                <MoneyIcon width={24} height={24} color="#4CAF50" />
            </div>
            <div className="ml-4">
                <p className="text-gray-800 text-lg font-semibold truncate">
                    {income.Name}
                </p>
                <p className="text-green-600 text-xl font-bold truncate">
                    ${income.Amount.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm truncate">
                    {new Date(income.Date || "").toLocaleDateString()} - {income.MoneyTipe || "Desconocido"}
                </p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="spinner-border text-green-500" role="status"></div>
                <p className="mt-4 text-gray-600 text-lg">Cargando ingresos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <p className="text-red-500 text-lg">{error}</p>
                <button
                    onClick={loadIncomes}
                    className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (noData) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center p-4 bg-green-500 rounded-b-lg">
                    <button onClick={() => {
                        context.setShowNavBarBottom(true)
                        navigation(-1)}} className="mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-white text-lg font-bold">Ingresos por {period}</h1>
                </div>
                <p className="text-center text-gray-600 text-lg mt-16">
                    No hay ingresos para el período seleccionado.
                </p>
            </div>
        );
    }

    return (
        <div className=" bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-green-500 rounded-b-lg">
                <button onClick={() => {
                    context.setShowNavBarBottom(true);
                    navigation(-1);
                    }} className="mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-white text-lg font-bold">Ingresos por {period}</h1>
            </div>
            <div className="-mt-4">{renderSummary()}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomes.map(renderIncome)}
            </div>
        </div>
    );
};

export default ReportIncome;
