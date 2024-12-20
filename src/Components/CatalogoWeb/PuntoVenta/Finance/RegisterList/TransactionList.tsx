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

export const TransactionsList: React.FC<{
  selectedMonth: number;
  todayOnly: boolean;
}> = ({ selectedMonth, todayOnly }) => {
  const [combinedData, setCombinedData] = useState<(IIncome | IExpenses)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(AppContext);

  const getIconByType = useCallback((name: string) => {
    switch (name.toLowerCase()) {
      case "general":
        return <MoreIcon width={30} height={30} strokeColor="#4F46E5" />;
      case "nomina":
        return <People width={30} height={30} fill="#4F46E5" />;
      case "renta":
        return <HouseIcon width={30} height={30} fillColor="#4F46E5" />;
      case "comida":
        return <FoodIcon width={30} height={30} fillColor="#4F46E5" />;
      case "venta":
        return <Euro width={30} height={30} fillColor="#4F46E5" />;
      default:
        return <Bus width={30} height={30} />;
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
    <div className="p-5 bg-white mt-4 max-h-[60vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {selectedMonth === new Date().getMonth()
          ? todayOnly
            ? "Hoy"
            : "Este Mes"
          : `Mes: ${months[selectedMonth]}`}
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <ul className="space-y-4">
          {combinedData.map((item) => (
            <TransactionItem
              key={item.Id || Math.random().toString()}
              name={item.Name}
              amount={item.Amount}
              coinName={"MoneyTipe" in item ? item.MoneyTipe ?? "Desconocido" : "Desconocido"}
              getIcon={getIconByType}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const TransactionItem: React.FC<{
  name: string;
  amount: number;
  coinName: string;
  getIcon: (name: string) => JSX.Element;
}> = ({ name, amount, coinName, getIcon }) => {
  const isPositive = amount >= 0;
  const icon = getIcon(name);

  return (
    <li className="flex items-center space-x-4 border-b border-gray-200 pb-4">
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      <div className="flex flex-1 justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-sm text-gray-500">Moneda: {coinName}</p>
        </div>
        <p
          className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"
            }`}
        >
          {isPositive ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`}
        </p>
      </div>
    </li>
  );
};

export default TransactionsList;