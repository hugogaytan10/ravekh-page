import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
    bestSellingProductMonth,
    bestSellingProductsYear,
    bestSellingProductsToday,
} from "./Petitions";
import { AppContext } from "../../../Context/AppContext";

// Registrar escalas y elementos
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Product {
    Name: string;
    Quantity?: number;
}

const BestSelling: React.FC = () => {
    const { period, businessId } = useParams<{ period: string; businessId: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [period, businessId]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let data: Product[] = [];
            switch (period?.toUpperCase()) {
                case "DÍA":
                    data = await bestSellingProductsToday(businessId!, context.user.Token);
                    break;
                case "MES":
                    data = await bestSellingProductMonth(businessId!, context.user.Token);
                    break;
                case "AÑO":
                    data = await bestSellingProductsYear(businessId!, context.user.Token);
                    break;
            }
            setProducts(data || []);
        } catch (error) {
            console.error("Error al obtener los productos:", error);
        } finally {
            setLoading(false);
        }
    };

    const topProducts = products.slice(0, 3);
    const labels = topProducts.map((product) => product.Name);
    const data = topProducts.map((product) => product.Quantity || 0);

    const chartData = {
        labels: labels.length ? labels : ["Sin datos"],
        datasets: [
            {
                label: "Unidades Vendidas",
                data: data.length ? data : [0],
                backgroundColor: "rgba(138, 43, 226, 0.5)",
                borderColor: "#8a2be2",
                borderWidth: 2,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { ticks: { color: "#666" } },
            y: { beginAtZero: true, ticks: { color: "#666" } },
        },
    };

    if (loading) return <div className="text-center p-10">Cargando...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">Productos Más Vendidos</h1>
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Regresar
            </button>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <Line data={chartData} options={chartOptions} key={JSON.stringify(chartData)} />
            </div>
        </div>
    );
};

export default BestSelling;
