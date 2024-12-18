import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../Context/AppContext';
import {ChevronBack} from '../../../../../assets/POS/ChevronBack';
import {ChevronGo} from '../../../../../assets/POS/ChevronGo';
import {
  getExpensesByMonth,
  getExpensesToday,
  getIncomeByMonth,
  getIncomeToday,
} from '../Petitions';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
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

  const fetchData = async (month: number, today: boolean) => {
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
      console.error('Error al cargar ingresos o gastos:', error);
      setTotalIncomeByCoin({});
      setTotalExpenseByCoin({});
    }
  };

  useEffect(() => {
    fetchData(currentMonth, showToday);
  }, [currentMonth, showToday, context.stockFlag]);

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
    const color = isIncome ? 'text-green-500' : 'text-red-500';

    return (
      <div className="flex flex-col items-center">
        <span className={`font-semibold ${color}`}>{label}</span>
        {Object.entries(data).map(([coin, total]) => (
          <div key={coin} className="flex flex-col items-center">
            <span className="text-gray-600">{coin || 'Desconocido'}:</span>
            <span className={`font-bold ${color}`}>${total?.toFixed(2) || '0.00'}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="p-2">
          <ChevronBack height={25} width={25} />
        </button>
        <span className="text-lg font-semibold">
          {showToday ? 'Hoy' : months[currentMonth]}
        </span>
        <button onClick={goToNextMonth} className="p-2">
          <ChevronGo height={25} width={25} />
        </button>
      </div>

      {currentMonth === new Date().getMonth() && (
        <button
          onClick={toggleToday}
          className="py-2 px-4 bg-blue-500 text-white rounded-md mx-auto block"
        >
          {showToday ? 'Ver Este Mes' : 'Ver Hoy'}
        </button>
      )}

      <div className="flex justify-around mt-4">
        {renderTotals(totalIncomeByCoin, 'Ingresos', true)}
        {renderTotals(totalExpenseByCoin, 'Gastos', false)}
      </div>
    </div>
  );
};
