import React from "react";
import { RavekhPos } from "../RavekhPos/RavekhPos";
import { AuthPage } from "../CatalogoWeb/PuntoVenta/Login/AuthPage";
import { MainSales } from "../CatalogoWeb/PuntoVenta/Sales/MainSales";
import { MainProducts } from "../CatalogoWeb/PuntoVenta/Products/MainProducts";
import { List } from "../CatalogoWeb/PuntoVenta/Products/CRUDProducts/List";
import { StockProducts } from "../CatalogoWeb/PuntoVenta/Products/Stock/StockProducts";
import { MainReports } from "../CatalogoWeb/PuntoVenta/Reports/MainReports";
import { MainSettings } from "../CatalogoWeb/PuntoVenta/Settings/MainSettings";
import { Dashboard } from "../CatalogoWeb/PuntoVenta/Dashboard/Dashboard";
import { MainFinances } from "../CatalogoWeb/PuntoVenta/Finance/MainFinances";
import { Client } from "../CatalogoWeb/PuntoVenta/Customers/Client";
import { ClientSelect } from "../CatalogoWeb/PuntoVenta/Customers/ClientSelect";
import { EditClient } from "../CatalogoWeb/PuntoVenta/Customers/EditClient";
import { Employees } from "../CatalogoWeb/PuntoVenta/Employees/Employees";
import { NewEmployee } from "../CatalogoWeb/PuntoVenta/Employees/NewEmployee";
import { EditEmployee } from "../CatalogoWeb/PuntoVenta/Employees/EditEmployee";

export const LEGACY_PRIMARY_ROUTES = [
  { path: "/RavekhPos", element: <RavekhPos /> },
  { path: "/login-punto-venta", element: <AuthPage /> },
  { path: "/MainSales", element: <MainSales /> },
  {
    path: "/main-products",
    element: <MainProducts />,
    children: [
      { path: "items", element: <List /> },
      { path: "stock", element: <StockProducts /> },
    ],
  },
  { path: "/main-reports", element: <MainReports /> },
  { path: "/more", element: <MainSettings /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/MainFinances", element: <MainFinances /> },
  { path: "/clients", element: <Client /> },
  { path: "/client-select", element: <ClientSelect /> },
  { path: "/edit-customer/:id", element: <EditClient /> },
  { path: "/employees", element: <Employees /> },
  { path: "/new-employee", element: <NewEmployee /> },
  { path: "/edit-employee/:id", element: <EditEmployee /> },
];
