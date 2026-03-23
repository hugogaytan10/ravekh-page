import { MoreModuleSection } from "../model/MoreModule";

const previewPath = (id: string) => `/v2/more/preview/${id}`;

export const MORE_MODULE_SECTIONS: MoreModuleSection[] = [
  {
    title: "Operación diaria",
    subtitle: "Flujos principales del POS funcionales en v2.",
    items: [
      { id: "sales", title: "Ventas", description: "Punto de venta y cobro rápido.", path: "/v2/MainSales", status: "available", actionType: "route" },
      { id: "products", title: "Productos", description: "Catálogo y edición de artículos.", path: "/v2/main-products/items", status: "available", actionType: "route" },
      { id: "finances", title: "Finanzas", description: "Registro de ingresos y egresos.", path: "/v2/MainFinances", status: "available", actionType: "route" },
      { id: "reports", title: "Reportes", description: "Balance, ingresos, ganancias y pedidos por periodo.", path: "/v2/dashboard", status: "available", actionType: "route" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Paridad estructural con Ajustes legacy, implementado con servicios modernos.",
    items: [
      { id: "tables", title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: "/v2/settings/table-zones", status: "available", actionType: "route" },
      { id: "business", title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", path: previewPath("business"), status: "beta", actionType: "beta-action" },
      { id: "catalog-settings", title: "Configuración catálogo", description: "Preferencias de publicación del catálogo.", path: previewPath("catalog-settings"), status: "preview", actionType: "route" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", path: previewPath("sales-tax"), status: "beta", actionType: "beta-action" },
      { id: "payment-methods", title: "Métodos de pago", description: "Configura efectivo, tarjeta y pagos en línea.", path: previewPath("payment-methods"), status: "beta", actionType: "beta-action" },
      { id: "branding", title: "Color de app", description: "Branding de colores para el POS.", path: previewPath("branding"), status: "beta", actionType: "beta-action" },
      { id: "exports", title: "Exportar reportes", description: "Descarga reportes para contabilidad.", path: previewPath("exports"), status: "beta", actionType: "beta-action" },
      { id: "inventory", title: "Inventario", description: "Módulo de stock desacoplado para v2.", path: previewPath("inventory"), status: "beta", actionType: "beta-action" },
      { id: "customers", title: "Clientes", description: "Catálogo de clientes y seguimiento.", path: "/v2/customers", status: "available", actionType: "route" },
      { id: "employees", title: "Empleados", description: "Administración de personal y permisos.", path: "/v2/employees", status: "available", actionType: "route" },
      { id: "cash-closing", title: "Corte de caja", description: "Cierres de caja al final de turno.", path: previewPath("cash-closing"), status: "beta", actionType: "beta-action" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas de soporte y operación extendida.",
    items: [
      { id: "health", title: "Salud de API", description: "Verifica conectividad y disponibilidad backend.", path: "/v2/health", status: "available", actionType: "route" },
      { id: "online-store", title: "Tienda en línea", description: "Gestión de canal online.", path: "/v2/online-store", status: "available", actionType: "route" },
      { id: "loyalty", title: "Cupones y visitas", description: "Herramientas de fidelización y recompensas.", path: previewPath("loyalty"), status: "beta", actionType: "beta-action" },
      { id: "support", title: "Ayuda", description: "Centro de ayuda y soporte para el negocio.", path: previewPath("support"), status: "preview", actionType: "route" },
      { id: "delete-account", title: "Borrar cuenta", description: "Proceso de cierre de sesión/seguridad.", path: previewPath("delete-account"), status: "preview", actionType: "route" },
    ],
  },
];
