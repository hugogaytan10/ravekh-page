import React, { useEffect, useState, useCallback, useContext } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import { AppContext } from "../../../Context/AppContext";
import {
  getExpensesByMonth,
  getExpensesToday,
  getIncomeByMonth,
  getIncomeToday,
} from "../Petitions";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface MonthNavigatorProps {
  currentMonth: number;
  currentDate: Date;
  onMonthChange: (month: number) => void;
  onToggleToday: () => void;
  showToday: boolean;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  currentDate,
  onMonthChange,
  onToggleToday,
  showToday,
}) => {
  const [totalIncomeByCoin, setTotalIncomeByCoin] = useState<Record<string, number>>({});
  const [totalExpenseByCoin, setTotalExpenseByCoin] = useState<Record<string, number>>({});
  const [activeCoinIndex, setActiveCoinIndex] = useState(0);
  const context = useContext(AppContext);

  const fetchData = useCallback(async () => {
    try {
      let incomeData, expensesData;

      if (showToday) {
        incomeData = await getIncomeToday(context.user.Business_Id.toString(), context.user.Token);
        expensesData = await getExpensesToday(context.user.Business_Id.toString(), context.user.Token);
      } else {
        incomeData = await getIncomeByMonth(
          context.user.Business_Id.toString(),
          context.user.Token,
          currentMonth
        );
        expensesData = await getExpensesByMonth(
          context.user.Business_Id.toString(),
          context.user.Token,
          currentMonth
        );
      }

      // Agrupar ingresos y egresos por tipo de moneda
      const groupedIncome = incomeData?.Incomes.reduce((acc: Record<string, number>, item: any) => {
        acc[item.MoneyTipe] = (acc[item.MoneyTipe] || 0) + item.Amount;
        return acc;
      }, {});

      const groupedExpenses = expensesData?.Expenses.reduce(
        (acc: Record<string, number>, item: any) => {
          acc[item.MoneyTipe] = (acc[item.MoneyTipe] || 0) + item.Amount;
          return acc;
        },
        {}
      );

      setTotalIncomeByCoin(groupedIncome || {});
      setTotalExpenseByCoin(groupedExpenses || {});
    } catch (error) {
      console.error("Error fetching income and expense data:", error);
      setTotalIncomeByCoin({});
      setTotalExpenseByCoin({});
    }
  }, [showToday, currentMonth, context.user.Business_Id, context.user.Token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const allCoins = Array.from(
        new Set([...Object.keys(totalIncomeByCoin), ...Object.keys(totalExpenseByCoin)])
      );
      if (allCoins.length > 0) {
        setActiveCoinIndex((prevIndex) => (prevIndex + 1) % allCoins.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [totalIncomeByCoin, totalExpenseByCoin]);

  const renderCoin = (
    data: Record<string, number>,
    allCoins: string[],
    isIncome: boolean
  ) => {
    const activeCoin = allCoins[activeCoinIndex] || null;
    const color = isIncome ? "text-green-600" : "text-red-600";

    return (
      <div className="relative h-24 overflow-hidden">
        {allCoins.map((coin, index) => (
          <div
            key={coin}
            className={`absolute w-full transition-transform duration-500 ease-in-out ${index === activeCoinIndex ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
          >
            {coin in data ? (
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-600">{coin}</span>
                <span className={`text-lg font-bold ${color}`}>
                  ${data[coin]?.toFixed(2) || "0.00"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-600 opacity-0">---</span>
                <span className={`text-lg font-bold opacity-0`}>---</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const allCoins = Array.from(
    new Set([...Object.keys(totalIncomeByCoin), ...Object.keys(totalExpenseByCoin)])
  );

  return (
    <div className="p-5 bg-white">
      {/* Navegador de meses */}
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={() => onMonthChange((currentMonth - 1 + 12) % 12)}
          className="p-2"
        >
          <ChevronBack height={25} width={25} />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {showToday
            ? currentDate.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            : months[currentMonth]}
        </span>
        <button
          onClick={() => onMonthChange((currentMonth + 1) % 12)}
          className="p-2"
        >
          <ChevronGo height={25} width={25} />
        </button>
      </div>
      {/* Totales sincronizados */}
      <div className="flex justify-around items-center mt-5">
        <div className="w-1/2 text-center">
          <h3 className="text-green-600 font-semibold">Ingresos</h3>
          {renderCoin(totalIncomeByCoin, allCoins, true)}
        </div>
        <div className="w-1/2 text-center">
          <h3 className="text-red-600 font-semibold">Gastos</h3>
          {renderCoin(totalExpenseByCoin, allCoins, false)}
        </div>
      </div>
    </div>
  );
};

export default MonthNavigator;
