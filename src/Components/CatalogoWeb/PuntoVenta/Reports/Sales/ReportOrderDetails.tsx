import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getOrderById } from "../Petitions";

interface Item {
    Item_Id: number;
    Item_Name: string;
    Item_Price: number;
    Item_Stock: number | null;
    Item_Image: string;
    Item_Description: string;
    Item_Quantity: number;
    Employee_Name: string;
    Customer_Name: string;
}

const ReportOrderDetails: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [orderDetails, setOrderDetails] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch order details
    const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getOrderById(orderId!, context.user.Token);
            setOrderDetails(response || []);
        } catch {
            setError("Error al cargar los detalles de la orden.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const renderItem = (item: Item) => (
        <div
            key={item.Item_Id}
            className="flex bg-white rounded-lg shadow-md mb-4 p-4 hover:shadow-lg transition-transform transform hover:scale-95"
        >
            <img
                src={item.Item_Image || "/placeholder.jpg"}
                alt={item.Item_Name}
                className="w-20 h-20 rounded-lg object-cover bg-gray-200 mr-4"
            />
            <div className="flex flex-col flex-grow">
                <p className="font-semibold text-gray-800 text-lg">{item.Item_Name}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.Item_Quantity}</p>
                <p className="text-sm text-gray-600">Precio: ${item.Item_Price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Stock: {item.Item_Stock ?? "N/A"}</p>
                <p className="text-sm text-gray-600">Empleado: {item.Employee_Name}</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">Detalles de la Orden</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Regresar
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-600 text-lg">Cargando detalles de la orden...</p>
                </div>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchOrderDetails}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orderDetails.map((item) => renderItem(item))}
                </div>
            )}
        </div>
    );
};

export default ReportOrderDetails;
