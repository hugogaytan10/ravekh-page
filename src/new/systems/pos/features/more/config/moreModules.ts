import { MoreModuleSection } from "../model/MoreModule";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";

const previewPath = (id: string) => POS_V2_PATHS.morePreview(id);

export const MORE_MODULE_SECTIONS: MoreModuleSection[] = [
  {
    title: "Tu día a día",
    subtitle: "Todo para atender y llevar tu negocio al día.",
    items: [
      { id: "sales", title: "Ventas", description: "Cobra compras y entrega tickets.", path: POS_V2_PATHS.sales, status: "available", actionType: "route" },
      { id: "products", title: "Productos", description: "Edita precios, fotos y detalles de tus artículos.", path: POS_V2_PATHS.products, status: "available", actionType: "route" },
      { id: "finances", title: "Finanzas", description: "Lleva el control de tus ingresos y gastos.", path: POS_V2_PATHS.finances, status: "available", actionType: "route" },
      { id: "reports", title: "Reportes", description: "Consulta cómo van tus ventas y tu negocio.", path: POS_V2_PATHS.reports, status: "available", actionType: "route" },
      { id: "online-store", title: "Tienda en línea", description: "Revisa tus pedidos en línea y descarga sus detalles en PDF.", path: POS_V2_PATHS.onlineStore, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Ajusta tu negocio, tus pagos y tu equipo.",
    items: [
      { id: "tables", title: "Mesas y zonas", description: "Distribuye los lugares donde atiendes a tus clientes.", path: POS_V2_PATHS.tableZones, status: "available", actionType: "route" },
      { id: "business", title: "Información del negocio", description: "Edita los datos de tu negocio y de facturación.", path: previewPath("business"), status: "available", actionType: "route" },
      { id: "social-networks", title: "Redes sociales", description: "Comparte tus perfiles de Facebook, Instagram y TikTok.", path: previewPath("social-networks"), status: "available", actionType: "route" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Define el porcentaje que se aplica al cobrar.", path: previewPath("sales-tax"), status: "available", actionType: "route" },
      { id: "catalog-settings", title: "Formulario de pedidos", description: "Elige qué datos solicitar a tus clientes.", path: POS_V2_PATHS.catalog, status: "available", actionType: "route" },
      { id: "payment-methods", title: "Métodos de pago", description: "Configura efectivo, tarjeta y pagos en línea.", path: previewPath("payment-methods"), status: "available", actionType: "route" },
      { id: "stripe-connect", title: "Cobros con Stripe", description: "Acepta pagos con tarjeta.", path: previewPath("stripe-connect"), status: "available", actionType: "route" },
      { id: "exports", title: "Descargar reportes", description: "Para tu contabilidad.", path: previewPath("exports"), status: "available", actionType: "route" },
     // { id: "factura-electronica", title: "Facturación electrónica", description: "Configura y prueba el flujo CFDI con el backend independiente de facturación.", path: POS_V2_PATHS.facturaElectronica, status: "available", actionType: "route" },
      { id: "inventory", title: "Inventario", description: "Consulta y ajusta las existencias de tus productos.", path: POS_V2_PATHS.inventory, status: "available", actionType: "route" },
      { id: "customers", title: "Clientes", description: "Guarda nombres y datos de contacto.", path: POS_V2_PATHS.customers, status: "available", actionType: "route" },
      { id: "employees", title: "Empleados", description: "Elige qué puede hacer cada persona.", path: POS_V2_PATHS.employees, status: "available", actionType: "route" },
      { id: "cash-closing", title: "Corte de caja", description: "Comprueba cuánto dinero recibiste durante el turno.", path: POS_V2_PATHS.cashClosing, status: "available", actionType: "route" },
      { id: "printers", title: "Impresoras", description: "Conexión Wi-Fi y prueba de tickets.", path: POS_V2_PATHS.printers, status: "available", actionType: "route" },
      { id: "security-questions", title: "Preguntas de seguridad", description: "Para recuperar tu contraseña.", path: POS_V2_PATHS.securityQuestions, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas para premiar a tus clientes y hacer que vuelvan.",
    items: [
      { id: "coupons", title: "Cupones", description: "Ofrece descuentos y promociones.", path: POS_V2_PATHS.coupons, status: "available", actionType: "route" },
      { id: "visits", title: "Visitas", description: "Premia a quienes vuelven.", path: POS_V2_PATHS.visits, status: "available", actionType: "route" },
      { id: "loyalty", title: "Recompensas para clientes", description: "Consulta cupones y premios por visitas.", path: POS_V2_PATHS.loyalty, status: "preview", actionType: "route" },
    ],
  },
];
