import { MoreModuleSection } from "../model/MoreModule";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";

const previewPath = (id: string) => POS_V2_PATHS.morePreview(id);

export const MORE_MODULE_SECTIONS: MoreModuleSection[] = [
  {
    title: "Mi negocio",
    subtitle: "Administra la operación de tu negocio.",
    items: [
      { id: "online-store", title: "Tienda en línea", description: "Consulta pedidos online, revisa detalle y genera impresión PDF.", path: POS_V2_PATHS.onlineStore, status: "available", actionType: "route" },
      { id: "branches", title: "Sucursales", description: "Ubicaciones, catálogo, contacto y acceso del personal.", path: POS_V2_PATHS.branches, status: "available", actionType: "route" },
      { id: "customers", title: "Clientes", description: "Catálogo de clientes y seguimiento.", path: POS_V2_PATHS.customers, status: "available", actionType: "route" },
      { id: "pending-payments", title: "Cuentas por cobrar", description: "Saldos pendientes, historial y registro de abonos.", path: POS_V2_PATHS.pendingPayments, status: "available", actionType: "route" },
      { id: "employees", title: "Empleados", description: "Administración de personal y permisos.", path: POS_V2_PATHS.employees, status: "available", actionType: "route" },
      { id: "coupons", title: "Cupones", description: "Administración de campañas y promociones para clientes.", path: POS_V2_PATHS.coupons, status: "available", actionType: "route" },
      { id: "visits", title: "Visitas", description: "Seguimiento de visitas y recompensas por recurrencia.", path: POS_V2_PATHS.visits, status: "available", actionType: "route" },
      { id: "printers", title: "Hardware", description: "Configura el formato y prueba la impresión de tus tickets.", path: POS_V2_PATHS.printers, status: "available", actionType: "route" },
      { id: "cash-closing", title: "Corte de caja", description: "Cierres de caja al final de turno.", path: POS_V2_PATHS.cashClosing, status: "available", actionType: "route" },
      { id: "settings", title: "Ajustes", description: "Configura tu cuenta, ticket y negocio.", path: POS_V2_PATHS.settings, status: "available", actionType: "route" },
      { id: "intelligence", title: "Análisis del negocio", description: "Señales, recomendaciones e historial del negocio.", path: POS_V2_PATHS.intelligence, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Configuración",
    subtitle: "Preferencias y herramientas del negocio.",
    items: [
      { id: "ticket-settings", title: "Ticket e impresora", description: "Personaliza la información de tus tickets.", path: POS_V2_PATHS.ticketSettings, status: "available", actionType: "route" },
      { id: "currency", title: "Tipo de moneda", description: "Selecciona la moneda de tu negocio.", path: POS_V2_PATHS.currency, status: "available", actionType: "route" },
      { id: "tables", title: "Mesas y zonas", description: "Gestión de mesas para consumo en salón.", path: POS_V2_PATHS.tableZones, status: "available", actionType: "route" },
      { id: "business", title: "Información del negocio", description: "Datos fiscales/comerciales del negocio.", path: previewPath("business"), status: "available", actionType: "route" },
      { id: "social-networks", title: "Redes sociales", description: "Configura los enlaces públicos de Facebook, Instagram y TikTok.", path: previewPath("social-networks"), status: "available", actionType: "route" },
      { id: "sales-tax", title: "Impuesto de venta", description: "Ajustes de impuestos aplicados en ventas.", path: previewPath("sales-tax"), status: "available", actionType: "route" },
      { id: "catalog-settings", title: "Checkout público", description: "Configura qué campos solicita el formulario de pedido del catálogo.", path: POS_V2_PATHS.catalog, status: "available", actionType: "route" },
      { id: "payment-methods", title: "Métodos de pago", description: "Configura efectivo, tarjeta y pagos en línea.", path: previewPath("payment-methods"), status: "available", actionType: "route" },
      { id: "stripe-connect", title: "Stripe Connect", description: "Conecta tu cuenta Stripe para cobros con tarjeta.", path: previewPath("stripe-connect"), status: "available", actionType: "route" },
      { id: "exports", title: "Exportar reportes", description: "Descarga reportes para contabilidad.", path: previewPath("exports"), status: "available", actionType: "route" },
     // { id: "factura-electronica", title: "Facturación electrónica", description: "Configura y prueba el flujo CFDI con el backend independiente de facturación.", path: POS_V2_PATHS.facturaElectronica, status: "available", actionType: "route" },
      { id: "inventory", title: "Inventario", description: "Consulta y ajusta las existencias de tus productos.", path: POS_V2_PATHS.inventory, status: "available", actionType: "route" },
      { id: "crm", title: "CRM", description: "Conversaciones, contactos y seguimiento comercial.", path: POS_V2_PATHS.crm, status: "available", actionType: "route" },
      { id: "security-questions", title: "Preguntas de seguridad", description: "Crea o valida la pregunta de seguridad para recuperación de contraseña.", path: POS_V2_PATHS.securityQuestions, status: "available", actionType: "route" },
    ],
  },
  {
    title: "Servicios",
    subtitle: "Herramientas adicionales.",
    items: [
      { id: "loyalty", title: "Fidelidad (resumen)", description: "Acceso general del sistema de fidelidad.", path: POS_V2_PATHS.loyalty, status: "preview", actionType: "route" },
    ],
  },
];
