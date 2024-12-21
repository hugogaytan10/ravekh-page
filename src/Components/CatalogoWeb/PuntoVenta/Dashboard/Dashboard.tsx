import React, { useContext, useEffect, useState } from "react";
import { Header } from "./Header";
import { StatsCard } from "./StatsCard";
import { TopProductsChart } from "./TopProductsChart";
import { TopCategoriesChart } from "./TopCategoriesChart";
import { Table } from "./Table";
import { TrendingDownIcon } from "../../../../assets/POS/TrendingDown";
import { TrendingUpIcon } from "../../../../assets/POS/TrendingUp";
import { ReloadIcon } from "../../../../assets/POS/reload";
import { Change } from "../../../../assets/POS/change";
import { StatsIcon } from "../../../../assets/POS/Stats";
import {
  getAveragePurchaseComparison,
  getBalanceComparisonByMonth,
  getIncomeComparisonByMonth,
  getMostSoldProductsByMonth,
} from "./Petitions";
import { AppContext } from "../../Context/AppContext";
import { OrdersTable } from "./OrdersTable";
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
export const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [dataTable, setDataTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  //datos para comparar compra promedio
  const [averagePurchase, setAveragePurchase] = useState<AveragePurchaseData>();
  //datos para comparar ingresos por mes
  const [incomeComparison, setIncomeComparison] =
    useState<IncomeComparisonData>({
      total: {
        thisMonthTotal: 0,
        lastMonthTotal: 0,
        percentageChange: 0,
      },
      byCurrency: [],
    });
  //datos para comparar balance por mes
  const [balanceComparison, setBalanceComparison] = useState([]);
  //datos para comparar los clientes nuevos
  const [newClients, setNewClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      //Compra promedio
      const infoToAveragePurchase = await getAveragePurchaseComparison(
        context.user.Business_Id + "",
        context.user.Token
      );
      //Ingresos por mes
      const infoToIncomeComparison = await getIncomeComparisonByMonth(
        context.user.Business_Id + "",
        context.user.Token
      );

      //Balance por mes
      const infoToBalanceComparison = await getBalanceComparisonByMonth(
        context.user.Business_Id + "",
        context.user.Token
      );
      //Clientes nuevos

      const getThisMonth = new Date().getMonth() + 1;
      const infoToTable = await getMostSoldProductsByMonth(
        context.user.Business_Id + "",
        getThisMonth.toString(),
        context.user.Token
      );
      //seteamos los datos necesarios en las variables
      setAveragePurchase(infoToAveragePurchase);
      setIncomeComparison(infoToIncomeComparison);
      setBalanceComparison(infoToBalanceComparison);
      setDataTable(infoToTable);
    };
    fetchData();
  }, [context.user.Business_Id, context.user.Token]);

  const statsCards = [
    {
      title: "Compra promedio",
      component: (
        <StatsCard
          title="Compra promedio"
          value={averagePurchase?.total.averageToday?.toString() || "0"}
          trend={
            averagePurchase?.total.percentageChange ?? 0 > 0 ? "up" : "down"
          }
          percentage={
            averagePurchase?.total.percentageChange?.toString() || "0"
          }
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
          value={incomeComparison?.total.thisMonthTotal?.toString() || "0"}
          trend={
            incomeComparison?.total.percentageChange ?? 0 > 0 ? "up" : "down"
          }
          percentage={
            incomeComparison?.total.percentageChange?.toString() + "%" || "0%"
          }
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
          value="10,578.58 MXN"
          trend="up"
          percentage="8.5%"
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
          value="2"
          trend="up"
          percentage="1.8%"
          icon={<ReloadIcon />}
          bgColor="#FFDED2"
          navigation=""
        />
      ),
    },
  ];

  const charts = [
    {
      title: "Productos más Vendidos",
      component: (
        <TopProductsChart
          businessId={context.user.Business_Id.toString()}
          token={context.user.Token}
        />
      ),
    },
    {
      title: "Mejores Categorías",
      component: (
        <TopCategoriesChart
          businessId={context.user.Business_Id.toString()}
          token={context.user.Token}
        />
      ),
    },
  ];

  const tables = [
    {
      title: "Tabla de Pedidos",
      component: (
        <Table
          businessId={context.user.Business_Id.toString()}
          token={context.user.Token}
        />
      ),
    },
    {
      title: "Tabla de Ventas",
      component: (
        <OrdersTable
          businessId={context.user.Business_Id.toString()}
          token={context.user.Token}
        />
      ),
    },
  ];

  const filteredComponents = [...statsCards, ...charts, ...tables].filter(
    (comp) => comp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header
        onSearch={(term) => setSearchTerm(term)}
        role={context.user.Role}
        storeName={context.store.Name}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {filteredComponents.map((comp, index) => (
          <div
            key={index}
            className={`col-span-1 ${
              charts.includes(comp) ? "lg:col-span-2" : ""
            } ${tables.includes(comp) ? "lg:col-span-4" : ""}`}
          >
            {comp.component}
          </div>
        ))}
      </div>
    </div>
  );
};
