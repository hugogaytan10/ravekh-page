import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import MonthNavigator from "./MonthNavigator";
import PeriodSelector from "./PeriodSelector";
import FileStatusModal from "./FileStatusModal";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { getCustomersMonthReport, getCustomersTodayReport, getCustomersYearReport, getEmployeesMonthReport, getEmployeesTodayReport, getEmployeesYearReport, getInfoProductsMonthReport, getInfoProductsTodayReport, getInfoProductsYearReport } from "./Petitions";
import { Parser } from "json2csv";

interface IProductReport {
  Id: string;
  Name: string;
  Price: number;
  Quantity: number;
  TotalSales: number;
  Earnings: number;
}

interface ICustomerReport {
  Id: string;
  Name: string;
  TotalOrders: number;
  TotalSales: number;
}

interface IEmployeeReport {
  Id: string;
  Name: string;
  TotalOrders: number;
  TotalSales: number;
}

const ExportReports: React.FC<{ navigation: any }> = ({ navigation }) => {
  const context = useContext(AppContext);
  const [selectedPeriod, setSelectedPeriod] = useState("Día");
  const [currentYear] = useState(new Date().getFullYear());

  const [dataProducts, setDataProducts] = useState<IProductReport[]>([]);
  const [dataCustomers, setDataCustomers] = useState<ICustomerReport[]>([]);
  const [dataEmployees, setDataEmployees] = useState<IEmployeeReport[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [path, setPath] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  const [loaderPdf, setLoaderPdf] = useState(false);

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("es", { month: "short" }).replace(".", "");
    return `${day} ${month} ${date.getFullYear()}`;
  };

  const generatePDF = async () => {
    setLoaderPdf(true);
    const htmlContent = `
      <h1>Reporte de Productos</h1>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total Ventas</th>
            <th>Ganancias</th>
          </tr>
        </thead>
        <tbody>
          ${dataProducts
            .map(
              (product) =>
                `<tr>
                  <td>${product.Id}</td>
                  <td>${product.Name}</td>
                  <td>${product.Price}</td>
                  <td>${product.Quantity}</td>
                  <td>${product.TotalSales}</td>
                  <td>${product.Earnings}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    try {
      // Generar PDF con una librería compatible para ReactJS
      const response = await fetch("https://pdf-generator-service", {
        method: "POST",
        body: JSON.stringify({ html: htmlContent }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error al generar PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Descargar el PDF
      const link = document.createElement("a");
      link.href = url;
      link.download = `Reporte_${new Date().getTime()}.pdf`;
      link.click();

      setMessage("El archivo PDF se generó correctamente.");
      setTitle("Éxito");
      setModalVisible(true);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setMessage("Error al generar el PDF.");
      setTitle("Error");
      setModalVisible(true);
    } finally {
      setLoaderPdf(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      let products = [];
      let customers = [];
      let employees = [];
      switch (selectedPeriod) {
        case "Día":
          products = await getInfoProductsTodayReport(context.user.Token, context.store.Id + "");
          customers = await getCustomersTodayReport(context.user.Token, context.store.Id + "");
          employees = await getEmployeesTodayReport(context.user.Token, context.store.Id + "");
          break;
        case "Mes":
          products = await getInfoProductsMonthReport(context.user.Token, context.store.Id + "");
          customers = await getCustomersMonthReport(context.user.Token, context.store.Id + "");
          employees = await getEmployeesMonthReport(context.user.Token, context.store.Id + "");
          break;
        case "Año":
          products = await getInfoProductsYearReport(context.user.Token, context.store.Id + "");
          customers = await getCustomersYearReport(context.user.Token, context.store.Id + "");
          employees = await getEmployeesYearReport(context.user.Token, context.store.Id + "");
          break;
      }
      setDataProducts(products || []);
      setDataCustomers(customers || []);
      setDataEmployees(employees || []);
    };

    fetchData();
  }, [selectedPeriod]);

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <header
        className="flex items-center p-4"
        style={{ backgroundColor: context.store.Color || "#6200EE" }}
      >
        <button className="text-white" onClick={() => navigation.goBack()}>
          <ChevronBack />
        </button>
        <h1 className="text-white font-semibold text-lg ml-4">Exportar Reportes</h1>
      </header>

      <div className="flex-grow p-4">
        {selectedPeriod === "Día" && <MonthNavigator label={getCurrentDate()} />}
        {selectedPeriod === "Mes" && (
          <MonthNavigator label={new Date().toLocaleString("es", { month: "long" })} />
        )}
        {selectedPeriod === "Año" && <MonthNavigator label={currentYear.toString()} />}
        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

        <div className="mt-8 flex justify-center">
          {loaderPdf ? (
            <div className="flex items-center justify-center">
              <span className="text-red-500">Cargando...</span>
            </div>
          ) : (
            <button
              className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-100"
              onClick={generatePDF}
            >
              Generar PDF
            </button>
          )}
        </div>
      </div>

      <FileStatusModal
        isVisible={modalVisible}
        title={title}
        message={message}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default ExportReports;
