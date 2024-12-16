import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { getSales } from "../Petitions";
import MoneyIcon from "../../../../../assets/POS/MoneyIcon";

interface SaleItem {
    Id: string;
    Date: string;
    PaymentMethod: string;
    CoinName: string;
    Total: number;
    type: "Orden" | "Comanda";
}

const ReportSales: React.FC = () => {
    const { period, businessId } = useParams<{ period: string; businessId: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState<SaleItem[]>([]);
    const [commands, setCommands] = useState<SaleItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<"Orders" | "Commands" | "Both">("Both");
    const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

    // List of available coins
    const availableCoins = Array.from(new Set([...orders, ...commands].map((item) => item.CoinName)));

    const fetchSalesData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getSales(businessId!, period!, "TODOS", context.user.Token);
            setOrders(response?.Orders?.map((order: any) => ({ ...order, type: "Orden" })) || []);
            setCommands(response?.Commands?.map((command: any) => ({ ...command, type: "Comanda" })) || []);
        } catch {
            setError("Error al cargar las ventas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, [period, businessId]);

    const filteredData = (): SaleItem[] => {
        let data: SaleItem[] = [];
        switch (selectedSegment) {
            case "Orders":
                data = orders;
                break;
            case "Commands":
                data = commands;
                break;
            case "Both":
            default:
                data = [...orders, ...commands];
        }
        return selectedCoin ? data.filter((item) => item.CoinName === selectedCoin) : data;
    };

    const renderSaleCard = (sale: SaleItem) => (
        <div
            key={sale.Id}
            className="bg-white p-6 rounded-lg shadow-md mb-4 hover:shadow-lg transition-transform transform hover:scale-95 cursor-pointer"
            onClick={() =>
                navigate(
                    sale.type === "Orden"
                        ? `/report-order-details/${sale.Id}`
                        : `/report-command-details/${sale.Id}`
                )
            }
        >
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                    <MoneyIcon width={30} height={30} color={context.store.Color || "#3498db"} />
                </div>
                <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{sale.type}</span>
                        <span className="text-sm text-gray-500">
                            {new Date(sale.Date).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">{sale.PaymentMethod}</p>
                    <p className="text-sm text-gray-600">Moneda: {sale.CoinName}</p>
                    <p className="text-lg font-bold text-green-600">${sale.Total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700">
                    Ventas por {period}
                </h2>
            </div>

            {/* Coin Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {availableCoins.length > 0 ? (
                    availableCoins.map((coin) => (
                        <button
                            key={coin}
                            className={`px-4 py-2 rounded-lg ${
                                selectedCoin === coin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                            }`}
                            onClick={() => setSelectedCoin(selectedCoin === coin ? null : coin)}
                        >
                            {coin}
                        </button>
                    ))
                ) : (
                    <p className="text-gray-600 text-sm">No hay monedas disponibles.</p>
                )}
            </div>

            {/* Segment Selector */}
            <div className="flex gap-4 mb-6">
                {["Orders", "Commands", "Both"].map((segment) => (
                    <button
                        key={segment}
                        className={`px-4 py-2 rounded-lg ${
                            selectedSegment === segment
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-600"
                        }`}
                        onClick={() => setSelectedSegment(segment as "Orders" | "Commands" | "Both")}
                    >
                        {segment === "Orders"
                            ? "Órdenes"
                            : segment === "Commands"
                            ? "Comandas"
                            : "Ambos"}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center">
                    <p className="text-gray-600">Cargando...</p>
                </div>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchSalesData}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            ) : filteredData().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData().map((sale) => renderSaleCard(sale))}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-600">No hay datos para el período seleccionado.</p>
                </div>
            )}
        </div>
    );
};

export default ReportSales;
