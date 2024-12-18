import React, { useEffect, useState, useCallback, useContext } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { getExpensesByMonth, getExpensesToday, getIncomeByMonth, getIncomeToday } from '../Petitions';
import Bus from '../../../../../assets/POS/Bus';
import FoodIcon from '../../../../../assets/POS/Food';
import HouseIcon from '../../../../../assets/POS/HouseIcon';
import { MoreIcon } from '../../../../../assets/POS/MoreIcon';
import People from '../../../../../assets/POS/People';
import Euro from '../../../../../assets/POS/Euro';
interface Transaction {
  Id: number;
  Name: string;
  Amount: number;
  MoneyTipe: string;
}

interface TransactionsListProps {
  selectedMonth: number;
  todayOnly: boolean;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ selectedMonth, todayOnly }) => {
  const [combinedData, setCombinedData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(AppContext);

  const getIconByType = useCallback((name: string) => {
    switch (name.toLowerCase()) {
      case 'general':
        return <MoreIcon width={30} height={30} strokeColor="#3B82F6" />;
      case 'nomina':
        return <People width={30} height={30} fillColor="#3B82F6" />;
      case 'renta':
        return <HouseIcon width={30} height={30} fillColor="#3B82F6" />;
      case 'comida':
        return <FoodIcon width={30} height={30} fillColor="#3B82F6" />;
      case 'venta':
        return <Euro width={30} height={30} fillColor="#3B82F6" />;
      default:
        return <Bus width={30} height={30} />;
    }
  }, []);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let incomeData, expensesData;

      if (todayOnly) {
        incomeData = await getIncomeToday(context.user.Business_Id.toString(), context.user.Token);
        expensesData = await getExpensesToday(context.user.Business_Id.toString(), context.user.Token);
      } else {
        incomeData = await getIncomeByMonth(context.user.Business_Id.toString(), context.user.Token, selectedMonth);
        expensesData = await getExpensesByMonth(context.user.Business_Id.toString(), context.user.Token, selectedMonth);
      }

      const expensesWithNegativeAmounts = expensesData?.Expenses.map((expense: Transaction) => ({
        ...expense,
        Amount: expense.Amount * -1,
      })) || [];

      const combinedTransactions = [
        ...(incomeData?.Incomes || []),
        ...expensesWithNegativeAmounts,
      ];

      const sortedTransactions = combinedTransactions.sort((a, b) => b.Id - a.Id);

      setCombinedData(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions', error);
      setCombinedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, todayOnly]);

  return (
    <div className="p-4 bg-white mt-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {todayOnly ? 'Hoy' : `Mes: ${months[selectedMonth]}`}
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {combinedData.map((item) => (
            <li key={item.Id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {getIconByType(item.Name)}
                </div>
                <div>
                  <p className="text-lg font-medium">{item.Name}</p>
                  <p className="text-sm text-gray-500">Moneda: {item.MoneyTipe}</p>
                </div>
              </div>
              <p className={`text-lg font-medium ${item.Amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.Amount >= 0 ? `$${item.Amount.toFixed(2)}` : `-$${Math.abs(item.Amount).toFixed(2)}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
