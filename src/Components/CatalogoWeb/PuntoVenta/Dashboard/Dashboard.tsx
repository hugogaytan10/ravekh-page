import React, { useContext, useEffect, useState, useMemo, useReducer, Suspense } from "react";
import { Header } from "./Header";
import { StatsCard } from "./StatsCard";
import { TrendingUpIcon } from "../../../../assets/POS/TrendingUp";
import { ReloadIcon } from "../../../../assets/POS/Reload";
import { Change } from "../../../../assets/POS/Change";
import { StatsIcon } from "../../../../assets/POS/Stats";
import {
  getAveragePurchaseComparison,
  getBalanceComparisonByMonth,
  getIncomeComparisonByMonth,
  getMostSoldProductsByMonth,
  getNewCustomers,
} from "./Petitions";
import { AppContext } from "../../Context/AppContext";

// Lazy load for charts and tables
const TopProductsChart = React.lazy(() => import("./TopProductsChart"));
const TopCategoriesChart = React.lazy(() => import("./TopCategoriesChart"));
const Table = React.lazy(() => import("./Table"));
const OrdersTable = React.lazy(() => import("./OrdersTable"));

// Reducer for managing state
interface State {
  averagePurchase: AveragePurchaseData | null;
  incomeComparison: IncomeComparisonData;
  balanceComparison: BalanceComparisonData;
  dataTable: any[];
  newCustomers: newCustomersData;
}

const initialState: State = {
  averagePurchase: null,
  incomeComparison: {
    total: {
      thisMonthTotal: 0,
      lastMonthTotal: 0,
      percentageChange: 0,
    },
    byCurrency: [],
  },
  balanceComparison: {
    total: {
      thisMonthBalance: 0,
      lastMonthBalance: 0,
      percentageChange: 0
    }
  },
  dataTable: [],
  newCustomers: {
    totalToday: 0,
    totalYesterday: 0,
    percentageChange: 0
  }
};

function reducer(state: State, action: { type: string; payload: Partial<State> }): State {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AveragePurchaseData {
  total: {
    averageToday: number;
    averageYesterday: number;
    percentageChange: number;
  };
  byCurrency: {
    currency: string;
    averageToday: number;
    averageYesterday: number;
    percentageChange: number;
  }[];
}

interface IncomeComparisonData {
  total: {
    thisMonthTotal: number;
    lastMonthTotal: number;
    percentageChange: number;
  };
  byCurrency: {
    currency: string;
    thisMonthTotal: number;
    lastMonthTotal: number;
    percentageChange: number;
  }[];
}

interface BalanceComparisonData {
  total: {
    thisMonthBalance: number;
    lastMonthBalance: number;
    percentageChange: number;
  };
}
interface newCustomersData {
  totalToday: number,
  totalYesterday: number,
  percentageChange: number
}
export const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize stats cards and avoid unnecessary recalculation
  const statsCards = useMemo(() => [
    {
      title: "Compra promedio",
      component: (
        <StatsCard
          title="Compra promedio"
          value={state.averagePurchase?.total.averageToday?.toString() || "0"}
          trend={state.averagePurchase?.total.percentageChange ?? 0 > 0 ? "down" : "up"}
          //percentage={state.averagePurchase?.total.percentageChange?.toString() + "%" || "0%"}
          percentage={`${state.newCustomers?.percentageChange ?? 0}%`}

          icon={<StatsIcon />}
          bgColor="#D9F7E7"
          navigation={""}
        />
      ),
    },
    {
      title: "Ingresos",
      component: (
        <StatsCard
          title="Ingresos"
          value={state.incomeComparison?.total.thisMonthTotal?.toString() || "0"}
          trend={state.incomeComparison?.total.percentageChange ?? 0 > 0 ? "up" : "down"}
          percentage={state.incomeComparison?.total.percentageChange?.toString() + "%" || "0%"}
          icon={<TrendingUpIcon color={"#049004"} height={48} width={47} />}
          bgColor="#CAE7CA"
          navigation={`/report-income/Día/${context.user.Business_Id}`}
        />
      ),
    },
    {
      title: "Balance",
      component: (
        <StatsCard
          title="Balance"
          value={state.balanceComparison.total.thisMonthBalance.toString()}
          trend={state.balanceComparison.total.percentageChange > 0 ? "up" : "down"}
          percentage={state.balanceComparison.total.percentageChange.toString() + "%" || "0%"}
          icon={<Change />}
          bgColor="#C9EFEA"
          navigation={""}
        />
      ),
    },
    {
      title: "Clientes nuevos",
      component: (
        <StatsCard
          title="Clientes nuevos"
          value={state.newCustomers.totalToday.toString()}
          trend={state.newCustomers.percentageChange > 0 ? "up" : "down"}
          percentage={state.newCustomers.percentageChange.toString() + "%"}
          icon={<ReloadIcon />}
          bgColor="#FFDED2"
          navigation=""
        />
      ),
    },
  ], [state.averagePurchase, state.incomeComparison]);

  // Fetch data with Promise.all for better optimization
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [averagePurchase, incomeComparison, balanceComparison, dataTable, newCustomers] = await Promise.all([
          getAveragePurchaseComparison(context.user.Business_Id + "", context.user.Token),
          getIncomeComparisonByMonth(context.user.Business_Id + "", context.user.Token),
          getBalanceComparisonByMonth(context.user.Business_Id + "", context.user.Token),
          getMostSoldProductsByMonth(context.user.Business_Id + "", (new Date().getMonth() + 1).toString(), context.user.Token),
          getNewCustomers(context.user.Business_Id + "", context.user.Token)
        ]);

        dispatch({ type: "SET_DATA", payload: { averagePurchase, incomeComparison, balanceComparison, dataTable, newCustomers } });
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [context.user.Business_Id, context.user.Token]);

  const charts = [
    {
      title: "Productos más vendidos",
      component: <TopProductsChart businessId={context.user.Business_Id.toString()} token={context.user.Token}/>,
    },
    {
      title: "Mejores categorías",
      component: <TopCategoriesChart businessId={context.user.Business_Id.toString()} token={context.user.Token}/>,
    },
  ];

  const tables = [
    {
      title: "Pedidos",
      component: <OrdersTable businessId={context.user.Business_Id.toString()} token={context.user.Token}/>,
    },
    {
      title: "Reporte ventas",
      component: <Table businessId={context.user.Business_Id.toString()} token={context.user.Token}/>,
    },
  ];

  const filteredComponents = useMemo(() => {
    return [...statsCards, ...charts, ...tables].filter((comp) =>
      comp.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [statsCards, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header onSearch={(term) => setSearchTerm(term)} role={context.user.Role} storeName={context.store.Name} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {filteredComponents.map((comp, index) => (
          <div
            key={index}
            className={`col-span-1 ${charts.includes(comp) ? "lg:col-span-2" : ""} ${tables.includes(comp) ? "lg:col-span-4" : ""}`}
          >
            <Suspense fallback={<div className="animate-pulse h-40 bg-gray-300 rounded-lg"></div>}>
              {comp.component}
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
};
