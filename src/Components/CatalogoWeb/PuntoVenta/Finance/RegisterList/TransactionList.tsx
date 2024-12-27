import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  getExpensesByMonth,
  getExpensesToday,
  getIncomeByMonth,
  getIncomeToday,
} from "../Petitions";
import { AppContext } from "../../../Context/AppContext";
import { IIncome } from "../../Model/Income";
import { IExpenses } from "../../Model/Expense";
import Bus from "../../../../../assets/POS/Bus";
import { MoreIcon } from "../../../../../assets/POS/MoreIcon";
import People from "../../../../../assets/POS/People";
import HouseIcon from "../../../../../assets/POS/HouseIcon";
import FoodIcon from "../../../../../assets/POS/Food";
import Euro from "../../../../../assets/POS/Euro";

export const TransactionsList: React.FC<{
  selectedMonth: number;
  todayOnly: boolean;
  onToggleToday: () => void;
}> = ({ selectedMonth, todayOnly, onToggleToday }) => {
  const [combinedData, setCombinedData] = useState<(IIncome | IExpenses)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(AppContext);

  const getIconByType = useCallback((name: string) => {
    switch (name.toLowerCase()) {
      case "general":
        return <MoreIcon width={50} height={50} strokeColor="#4F46E5" />;
      case "nomina":
        return <People width={50} height={50} fill="#4F46E5" />;
      case "renta":
        return <HouseIcon width={50} height={50} fillColor="#4F46E5" />;
      case "comida":
        return <FoodIcon width={50} height={50} fillColor="#4F46E5" />;
      case "venta":
        return <Euro width={50} height={50} fillColor="#4F46E5" />;
      default:
        return <Bus width={50} height={50} />;
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let incomeData, expensesData;

      if (todayOnly) {
        incomeData = await getIncomeToday(
          context.user.Business_Id.toString(),
          context.user.Token
        );
        expensesData = await getExpensesToday(
          context.user.Business_Id.toString(),
          context.user.Token
        );
      } else {
        incomeData = await getIncomeByMonth(
          context.user.Business_Id.toString(),
          context.user.Token,
          selectedMonth
        );
        expensesData = await getExpensesByMonth(
          context.user.Business_Id.toString(),
          context.user.Token,
          selectedMonth
        );
      }

      const expensesWithNegativeAmounts =
        expensesData?.Expenses.map((expense: IExpenses) => ({
          ...expense,
          Amount: expense.Amount * -1,
        })) || [];

      const combinedTransactions = [
        ...(incomeData?.Incomes || []),
        ...expensesWithNegativeAmounts,
      ];

      const sortedTransactions = combinedTransactions.sort(
        (a, b) => b.Id - a.Id
      );

      setCombinedData(sortedTransactions);
    } catch (error) {
      console.error("Error fetching transactions", error);
      setCombinedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, todayOnly]);

  return (
    <div className="p-5 bg-white flex-grow overflow-y-auto">
      <button
        onClick={onToggleToday}
        className="self-center my-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {todayOnly ? "Ver Este Mes" : "Ver Hoy"}
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {combinedData.map((item) => (
            <TransactionTile
              key={item.Id || Math.random().toString()}
              name={item.Name}
              amount={item.Amount}
              coinName={
                "MoneyTipe" in item ? item.MoneyTipe ?? "Desconocido" : "Desconocido"
              }
              getIcon={getIconByType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionTile: React.FC<{
  name: string;
  amount: number;
  coinName: string;
  getIcon: (name: string) => JSX.Element;
}> = ({ name, amount, coinName, getIcon }) => {
  const isPositive = amount >= 0;
  const icon = getIcon(name);

  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="bg-gray-100 p-4 rounded-full mb-3">{icon}</div>
      <p className="font-semibold text-lg text-gray-800 mb-1">{name}</p>
      <p className="text-sm text-gray-500 mb-2">Moneda: {coinName}</p>
      <p
        className={`font-bold text-xl ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`}
      </p>
    </div>
  );
};

export default TransactionsList;
