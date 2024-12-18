import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../../Context/AppContext";
import { getCommandById } from "../Petitions";

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

const ReportCommandDetails: React.FC = () => {
    const { commandId } = useParams<{ commandId: string }>();
    const context = useContext(AppContext);

    const [commandDetails, setCommandDetails] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch command details
    const fetchCommandDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getCommandById(commandId!, context.user.Token);
            setCommandDetails(response || []);
        } catch {
            setError("Error al cargar los detalles de la comanda.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommandDetails();
    }, [commandId]);

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
                <h1 className="text-2xl font-semibold text-gray-700">Detalles de la Comanda</h1>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-600 text-lg">Cargando detalles de la comanda...</p>
                </div>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchCommandDetails}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {commandDetails.map((item) => renderItem(item))}
                </div>
            )}
        </div>
    );
};

export default ReportCommandDetails;
