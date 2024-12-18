import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    bestCategorySellingToday,
    bestCategorySellingMonth,
    bestCategorySellingYear,
} from "./Petitions";
import { AppContext } from "../../../Context/AppContext";

// Registrar las escalas y elementos para Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Category {
    Name: string;
    Quantity: number;
    Color: string;
}

const BestCategorySelling: React.FC = () => {
    const { period, businessId } = useParams<{ period: string; businessId: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchCategories();
    }, [period, businessId]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            let data: Category[] = [];
            switch (period?.toUpperCase()) {
                case "DÍA":
                    data = await bestCategorySellingToday(businessId!, context.user.Token);
                    break;
                case "MES":
                    data = await bestCategorySellingMonth(businessId!, context.user.Token);
                    break;
                case "AÑO":
                    data = await bestCategorySellingYear(businessId!, context.user.Token);
                    break;
                default:
                    console.error("Periodo inválido:", period);
            }
            setCategories(data || []);
        } catch (error) {
            console.error("Error al obtener las categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    // Preparar los datos para el gráfico
    const topCategories = categories.slice(0, 5);
    const labels = topCategories.map((category) => category.Name);
    const data = topCategories.map((category) => category.Quantity);

    const chartData = {
        labels: labels.length > 0 ? labels : ["Sin datos"],
        datasets: [
            {
                label: "Unidades Vendidas",
                data: data.length > 0 ? data : [0],
                backgroundColor: "rgba(138, 43, 226, 0.5)",
                borderColor: "#8a2be2",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "#9370db",
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="loader mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">Categorías Más Vendidas</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Regresar
                </button>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <Line data={chartData} options={chartOptions} key={JSON.stringify(chartData)} />
            </div>
        </div>
    );
};

export default BestCategorySelling;
