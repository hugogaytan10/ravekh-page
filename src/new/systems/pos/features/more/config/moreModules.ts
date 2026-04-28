import { MoreModuleSection } from "../model/MoreModule";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";

const previewPath = (id: string) => POS_V2_PATHS.morePreview(id);

export const MORE_MODULE_SECTIONS: MoreModuleSection[] = [
  {
    title: "Operación diaria",
    subtitle: "Flujos principales del POS funcionales",
    items: [
      { id: "sales", title: "Ventas", description: "Punto de venta y cobro rápido.", path: POS_V2_PATHS.sales, status: "available", actionType: "route" },
      { id: "products", title: "Productos", description: "Catálogo y edición de artículos.", path: POS_V2_PATHS.products, status: "available", actionType: "route" },
      { id: "finances", title: "Finanzas", description: "Registro operativo de ingresos/egresos y flujo diario.", path: POS_V2_PATHS.finances, status: "available", actionType: "route" },
      { id: "reports", title: "Reportes", description: "Analítica ejecutiva, tendencias y gráficas de desempeño.", path: POS_V2_PATHS.reports, status: "available", actionType: "route" },
      { id: "facturation", title: "Facturación", description: "Emisor fiscal, timbrado CFDI y acciones administrativas.", path: POS_V2_PATHS.facturation, status: "available", actionType: "route" },
      { id: "online-store", title: "Tienda en línea", description: "Consulta pedidos online, revisa detalle y genera impresión PDF.", path: POS_V2_PATHS.onlineStore, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Paridad estructural con Ajustes previos, implementado con servicios modernos.",
    items: [
      { id: "tables", title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: POS_V2_PATHS.tableZones, status: "available", actionType: "route" },
      { id: "business", title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", path: previewPath("business"), status: "available", actionType: "route" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", path: previewPath("sales-tax"), status: "available", actionType: "route" },
      { id: "catalog-settings", title: "Checkout público", description: "Configura qué campos solicita el formulario de pedido del catálogo.", path: POS_V2_PATHS.catalog, status: "available", actionType: "route" },
      { id: "payment-methods", title: "Métodos de pago", description: "Configura efectivo, tarjeta y pagos en línea.", path: previewPath("payment-methods"), status: "available", actionType: "route" },
      { id: "stripe-connect", title: "Stripe Connect", description: "Conecta tu cuenta Stripe para cobros con tarjeta.", path: previewPath("stripe-connect"), status: "available", actionType: "route" },
      { id: "exports", title: "Exportar reportes", description: "Descarga reportes para contabilidad.", path: previewPath("exports"), status: "available", actionType: "route" },
      { id: "inventory", title: "Inventario", description: "Módulo de stock desacoplado.", path: POS_V2_PATHS.inventory, status: "available", actionType: "route" },
      { id: "customers", title: "Clientes", description: "Catálogo de clientes y seguimiento.", path: POS_V2_PATHS.customers, status: "available", actionType: "route" },
      { id: "employees", title: "Empleados", description: "Administración de personal y permisos.", path: POS_V2_PATHS.employees, status: "available", actionType: "route" },
      { id: "cash-closing", title: "Corte de caja", description: "Cierres de caja al final de turno.", path: POS_V2_PATHS.cashClosing, status: "available", actionType: "route" },
      { id: "printers", title: "Impresoras", description: "Configura impresión por Wi‑Fi y pruebas de ticket/PDF.", path: POS_V2_PATHS.printers, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Módulos de fidelidad disponibles.",
    items: [
      { id: "coupons", title: "Cupones", description: "Administración de campañas y promociones para clientes.", path: POS_V2_PATHS.coupons, status: "available", actionType: "route" },
      { id: "visits", title: "Visitas", description: "Seguimiento de visitas y recompensas por recurrencia.", path: POS_V2_PATHS.visits, status: "available", actionType: "route" },
      { id: "loyalty", title: "Fidelidad (resumen)", description: "Acceso general del sistema de fidelidad.", path: POS_V2_PATHS.loyalty, status: "preview", actionType: "route" },
    ],
  },
];
