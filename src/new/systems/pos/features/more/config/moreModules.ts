import { MoreModuleSection } from "../model/MoreModule";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";

const previewPath = (id: string) => POS_V2_PATHS.morePreview(id);

export const MORE_MODULE_SECTIONS: MoreModuleSection[] = [
  {
    title: "Operación diaria",
    subtitle: "Flujos principales del POS funcionales en v2.",
    items: [
      { id: "sales", title: "Ventas", description: "Punto de venta y cobro rápido.", path: POS_V2_PATHS.sales, status: "available", actionType: "route" },
      { id: "products", title: "Productos", description: "Catálogo y edición de artículos.", path: POS_V2_PATHS.products, status: "available", actionType: "route" },
      { id: "finances", title: "Finanzas", description: "Registro operativo de ingresos/egresos y flujo diario.", path: POS_V2_PATHS.finances, status: "available", actionType: "route" },
      { id: "reports", title: "Reportes", description: "Analítica ejecutiva, tendencias y gráficas de desempeño.", path: POS_V2_PATHS.reports, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Paridad estructural con Ajustes legacy, implementado con servicios modernos.",
    items: [
      { id: "tables", title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: POS_V2_PATHS.tableZones, status: "available", actionType: "route" },
      { id: "settings-hub", title: "Ajustes generales", description: "Concentrador de configuración del POS v2 desacoplado.", path: previewPath("settings-hub"), status: "beta", actionType: "beta-action" },
      { id: "business", title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", path: previewPath("business"), status: "available", actionType: "route" },
      { id: "catalog-settings", title: "Configuración catálogo", description: "Preferencias de publicación del catálogo.", path: previewPath("catalog-settings"), status: "available", actionType: "route" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", path: previewPath("sales-tax"), status: "available", actionType: "route" },
      { id: "payment-methods", title: "Métodos de pago", description: "Configura efectivo, tarjeta y pagos en línea.", path: previewPath("payment-methods"), status: "available", actionType: "route" },
      { id: "branding", title: "Color de app", description: "Branding de colores para el POS.", path: previewPath("branding"), status: "available", actionType: "route" },
      { id: "exports", title: "Exportar reportes", description: "Descarga reportes para contabilidad.", path: previewPath("exports"), status: "available", actionType: "route" },
      { id: "inventory", title: "Inventario", description: "Módulo de stock desacoplado para v2.", path: POS_V2_PATHS.inventory, status: "available", actionType: "route" },
      { id: "customers", title: "Clientes", description: "Catálogo de clientes y seguimiento.", path: POS_V2_PATHS.customers, status: "available", actionType: "route" },
      { id: "employees", title: "Empleados", description: "Administración de personal y permisos.", path: POS_V2_PATHS.employees, status: "available", actionType: "route" },
      { id: "cash-closing", title: "Corte de caja", description: "Cierres de caja al final de turno.", path: POS_V2_PATHS.cashClosing, status: "available", actionType: "route" },
      { id: "roles", title: "Roles y permisos", description: "Administra perfiles y permisos operativos del POS.", path: previewPath("roles"), status: "beta", actionType: "beta-action" },
      { id: "printers", title: "Impresoras", description: "Configura tickets y dispositivos de impresión.", path: previewPath("printers"), status: "beta", actionType: "beta-action" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas de soporte y operación extendida.",
    items: [
      { id: "health", title: "Salud de API", description: "Verifica conectividad y disponibilidad backend.", path: POS_V2_PATHS.health, status: "available", actionType: "route" },
      { id: "online-store", title: "Tienda en línea", description: "Gestión de pedidos del canal online.", path: POS_V2_PATHS.onlineStore, status: "available", actionType: "route" },
      { id: "coupons", title: "Cupones", description: "Administración de campañas y promociones para clientes.", path: previewPath("coupons"), status: "beta", actionType: "beta-action" },
      { id: "visits", title: "Visitas", description: "Seguimiento de visitas y recompensas por recurrencia.", path: previewPath("visits"), status: "beta", actionType: "beta-action" },
      { id: "loyalty", title: "Cupones y visitas", description: "Herramientas de fidelización y recompensas.", path: previewPath("loyalty"), status: "beta", actionType: "beta-action" },
      { id: "support", title: "Ayuda", description: "Centro de ayuda y soporte para el negocio.", path: previewPath("support"), status: "available", actionType: "route" },
      { id: "branches", title: "Sucursales", description: "Administra múltiples sucursales y su operación.", path: previewPath("branches"), status: "beta", actionType: "beta-action" },
      { id: "switch-user", title: "Cambiar negocio/usuario", description: "Cerrar sesión actual y conectar otra cuenta o vendedor.", path: previewPath("switch-user"), status: "available", actionType: "beta-action" },
      { id: "delete-account", title: "Borrar cuenta", description: "Proceso de cierre de sesión/seguridad.", path: previewPath("delete-account"), status: "available", actionType: "route" },
    ],
  },
];
