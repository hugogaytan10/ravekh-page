import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getSales } from "../Petitions";
import MoneyIcon from "../../../../../assets/POS/MoneyIcon";
const CardIncome: React.FC = () => {
    const { period, businessId } = useParams<{ period: string; businessId: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState<any[]>([]);
    const [commands, setCommands] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSegment, setSelectedSegment] = useState<"Orders" | "Commands" | "Both">("Both");
    const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

    // List of available coins
    const availableCoins = Array.from(new Set([...orders, ...commands].map((item) => item.CoinName)));

    const loadSales = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getSales(businessId!, period!, "TARJETA", context.user.Token);
            setOrders(response?.Orders ?? []);
            setCommands(response?.Commands ?? []);
        } catch {
            setError("Error al cargar las ventas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [period, businessId]);

    const filteredData = () => {
        let data: any[] = [];
        switch (selectedSegment) {
            case "Orders":
                data = orders.map((order) => ({ ...order, type: "Orden" }));
                break;
            case "Commands":
                data = commands.map((command) => ({ ...command, type: "Comanda" }));
                break;
            case "Both":
            default:
                data = [
                    ...orders.map((order) => ({ ...order, type: "Orden" })),
                    ...commands.map((command) => ({ ...command, type: "Comanda" })),
                ];
        }
        return selectedCoin ? data.filter((item) => item.CoinName === selectedCoin) : data;
    };

    const renderSaleCard = (item: any) => (
        <div
            key={item.Id}
            className="flex bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-transform transform hover:scale-95 cursor-pointer"
            onClick={() =>
                navigate(
                    item.type === "Orden"
                        ? `/report-order-details/${item.Id}`
                        : `/report-command-details/${item.Id}`
                )
            }
        >
            <div className="flex-shrink-0 bg-gray-100 rounded-full p-3 mr-4">
                <MoneyIcon width={30} height={30} color={context.store.Color || "#3498db"} />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700">{item.type}</p>
                    <p className="text-sm text-gray-500">{new Date(item.Date).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-gray-600">{item.PaymentMethod}</p>
                <p className="text-sm text-gray-600">Moneda: {item.CoinName}</p>
                <p className="text-lg font-bold text-green-600">${item.Total.toFixed(2)}</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Recibido de tarjetas por {period}
                </h1>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-600 text-lg">Cargando ventas...</p>
                </div>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={loadSales}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {/* Coin Selector */}
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {availableCoins.length > 0 ? (
                            availableCoins.map((coin) => (
                                <button
                                    key={coin}
                                    className={`px-4 py-2 rounded-lg ${selectedCoin === coin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
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
                    <div className="flex justify-center gap-4 mb-6">
                        {["Orders", "Commands", "Both"].map((segment) => (
                            <button
                                key={segment}
                                className={`px-4 py-2 rounded-lg ${selectedSegment === segment
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

                    {/* Sales List */}
                    {filteredData().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredData().map((item) => renderSaleCard(item))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No hay datos para el período seleccionado.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CardIncome;
