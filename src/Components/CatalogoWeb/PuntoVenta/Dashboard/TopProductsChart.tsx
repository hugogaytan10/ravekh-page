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
import { getMostSoldProductsByMonth } from './Petitions';

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

const TopProductsChart: React.FC<{ businessId: string; token: string }> = ({ businessId, token }) => {
  const currentMonth = new Date().toISOString().slice(5, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMostSoldProductsByMonth(businessId, selectedMonth, token);

      // Extracting labels and values from API data
      const labels = data.map((item: any) => item.ProductName);
      const values = data.map((item: any) => item.TotalSales);

      const gradient = (ctx: CanvasRenderingContext2D) => {
        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        return gradientFill;
      };
        setChartData({
          labels,
          datasets: [
            {
              label: 'Ventas',
              data: values,
              borderColor: '#3B82F6',
              backgroundColor: (ctx: any) => gradient(ctx.chart.ctx),
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3B82F6',
              pointBorderColor: '#FFFFFF',
              pointHoverBorderColor: '#3B82F6',
              pointHoverRadius: 6,
              pointRadius: 4,
              borderWidth: 2,
            },
          ],
        });
      }

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
          label: (context: any) => `Ventas: $${context.raw}`,
        },
        backgroundColor: '#2563EB',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#FAFAFA',
        },
        ticks: {
          beginAtZero: true,
          callback: (value: any) => `$${value}`,
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Productos más vendidos</h3>
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
export default TopProductsChart;