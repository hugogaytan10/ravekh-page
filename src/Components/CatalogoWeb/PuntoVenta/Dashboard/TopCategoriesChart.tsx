import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMostSoldCategoriesByMonth } from './Petitions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const months = [
  { name: 'Enero', value: '01' },
  { name: 'Febrero', value: '02' },
  { name: 'Marzo', value: '03' },
  { name: 'Abril', value: '04' },
  { name: 'Mayo', value: '05' },
  { name: 'Junio', value: '06' },
  { name: 'Julio', value: '07' },
  { name: 'Agosto', value: '08' },
  { name: 'Septiembre', value: '09' },
  { name: 'Octubre', value: '10' },
  { name: 'Noviembre', value: '11' },
  { name: 'Diciembre', value: '12' },
];

export const TopCategoriesChart: React.FC<{ businessId: string; token: string }> = ({ businessId, token }) => {
  const currentMonth = new Date().toISOString().slice(5, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMostSoldCategoriesByMonth(businessId, selectedMonth, token);

      // Extracting labels and values from API data
      const labels = data.map((item: any) => item.CategoryName);
      const values = data.map((item: any) => item.TotalSales);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(96, 165, 250, 0.5)'); // Azul degradado
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0.05)'); // Azul claro casi transparente

        setChartData({
          labels,
          datasets: [
            {
              label: 'Ingresos',
              data: values,
              borderColor: '#60A5FA',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#60A5FA',
              pointBorderColor: '#FFFFFF',
              pointHoverBorderColor: '#60A5FA',
              pointHoverRadius: 6,
              pointRadius: 4,
              borderWidth: 2,
            },
          ],
        });
      }
    };

    fetchData();
  }, [businessId, selectedMonth]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Ingresos: $${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          beginAtZero: true,
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Mejores Categorías</h3>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};
