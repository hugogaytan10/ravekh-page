import React, { useContext, useState } from "react";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
import { AppContext } from "../../../Context/AppContext";
import { getExpensesByMonth, getExpensesToday, getIncomeByMonth, getIncomeToday } from '../Petitions';
import { useEffect, useCallback } from "react";

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
      console.error("Error al cargar ingresos o gastos:", error);
      setTotalIncomeByCoin({});
      setTotalExpenseByCoin({});
    }
  }, [context.user.Business_Id, context.user.Token]);

  useEffect(() => {
    fetchData(currentMonth, showToday);
  }, [currentMonth, showToday, fetchData]);

  const goToNextMonth = () => {
    const nextMonth = (currentMonth + 1) % 12;
    onMonthChange(nextMonth);
    if (showToday) toggleToday();
  };

  const goToPreviousMonth = () => {
    const previousMonth = (currentMonth - 1 + 12) % 12;
    onMonthChange(previousMonth);
    if (showToday) toggleToday();
  };

  const renderTotals = (data: Record<string, number>, label: string, isIncome: boolean) => {
    const color = isIncome ? "text-green-600" : "text-red-600";

    return (
      <div className="flex flex-col items-center">
        <span className={`font-medium ${color}`}>{label}</span>
        {Object.entries(data).map(([coin, total]) => (
          <div key={coin} className="flex flex-col items-center">
            <span className="text-gray-600">{coin || "Desconocido"}:</span>
            <span className={`font-bold ${color}`}>${total?.toFixed(2) || "0.00"}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 bg-white">
      {/* Navegador de meses */}
      <div className="flex justify-between items-center mb-5">
        <button onClick={goToPreviousMonth} className="p-2">
          <ChevronBack height={25} width={25} />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {showToday ? "Hoy" : months[currentMonth]}
        </span>
        <button onClick={goToNextMonth} className="p-2">
          <ChevronGo height={25} width={25} />
        </button>
      </div>

      {/* Botón para alternar entre "Hoy" y "Este Mes" */}
      {currentMonth === new Date().getMonth() && (
        <button
          onClick={toggleToday}
          className="self-center my-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {showToday ? "Ver Este Mes" : "Ver Hoy"}
        </button>
      )}

      {/* Totales de ingresos y gastos */}
      <div className="flex justify-around">
        {renderTotals(totalIncomeByCoin, "Ingresos", true)}
        {renderTotals(totalExpenseByCoin, "Gastos", false)}
      </div>
    </div>
  );
};

export default MonthNavigator;
