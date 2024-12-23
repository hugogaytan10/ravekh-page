import React, { useContext, useState, useEffect, useCallback } from "react";
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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthNavigatorProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
  showToday: boolean;
  toggleToday: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentMonth,
  onMonthChange,
  showToday,
  toggleToday,
}) => {
  const [totalIncomeByCoin, setTotalIncomeByCoin] = useState<Record<string, number>>({});
  const [totalExpenseByCoin, setTotalExpenseByCoin] = useState<Record<string, number>>({});
  const [activeCoinIndex, setActiveCoinIndex] = useState(0);
  const context = useContext(AppContext);

  const fetchData = useCallback(async (month: number, today: boolean) => {
    try {
      let incomeData, expensesData;

      if (today) {
        incomeData = await getIncomeToday(context.user.Business_Id.toString(), context.user.Token);
        expensesData = await getExpensesToday(context.user.Business_Id.toString(), context.user.Token);
      } else {
        incomeData = await getIncomeByMonth(context.user.Business_Id.toString(), context.user.Token, month);
        expensesData = await getExpensesByMonth(context.user.Business_Id.toString(), context.user.Token, month);
      }

      const groupedIncome = incomeData?.Incomes.reduce((acc: Record<string, number>, item: any) => {
        acc[item.MoneyTipe] = (acc[item.MoneyTipe] || 0) + item.Amount;
        return acc;
      }, {});

      const groupedExpenses = expensesData?.Expenses.reduce((acc: Record<string, number>, item: any) => {
        acc[item.MoneyTipe] = (acc[item.MoneyTipe] || 0) + item.Amount;
        return acc;
      }, {});

      setTotalIncomeByCoin(groupedIncome || {});
      setTotalExpenseByCoin(groupedExpenses || {});
    } catch (error) {
      setTotalIncomeByCoin({});
      setTotalExpenseByCoin({});
    }
  }, [context.user.Business_Id, context.user.Token]);

  useEffect(() => {
    fetchData(currentMonth, showToday);
  }, [currentMonth, showToday, fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const allCoins = Array.from(
        new Set([
          ...Object.keys(totalIncomeByCoin),
          ...Object.keys(totalExpenseByCoin),
        ])
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
    const color = isIncome ? "text-green-600" : "text-red-600";
    const activeCoin = allCoins[activeCoinIndex] || null;

    return (
      <div className="relative h-24 overflow-hidden">
        {allCoins.map((coin, index) => (
          <div
            key={coin}
            className={`absolute w-full transition-transform duration-500 ease-in-out ${
              index === activeCoinIndex ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
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
    new Set([
      ...Object.keys(totalIncomeByCoin),
      ...Object.keys(totalExpenseByCoin),
    ])
  );

  const handleToggleToday = () => {
    if (showToday) {
      toggleToday(); // Cambiar a "Este Mes"
    } else {
      const currentMonth = new Date().getMonth();
      onMonthChange(currentMonth); // Llevar al mes actual
      toggleToday();
    }
  };

  return (
    <div className="p-5 bg-white">
      {/* Navegador de meses */}
      <div className="flex justify-between items-center mb-5">
        <button onClick={() => onMonthChange((currentMonth - 1 + 12) % 12)} className="p-2">
          <ChevronBack height={25} width={25} />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {showToday ? "Hoy" : months[currentMonth]}
        </span>
        <button onClick={() => onMonthChange((currentMonth + 1) % 12)} className="p-2">
          <ChevronGo height={25} width={25} />
        </button>
      </div>
      {/* Botón "Ver Hoy / Ver Este Mes" */}
      <button
        onClick={handleToggleToday}
        className="self-center my-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {showToday ? "Ver Este Mes" : "Ver Hoy"}
      </button>
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
