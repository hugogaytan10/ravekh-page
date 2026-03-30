import { ModernSystemsFactory } from "../../../../../index";
import { MoreModuleExecutionContext } from "../model/MoreModule";

export type ModuleBetaAction = {
  requiresBusinessId?: boolean;
  requiresEmployeeId?: boolean;
  run: (context: MoreModuleExecutionContext, factory: ModernSystemsFactory) => Promise<unknown>;
};

export const MODULE_BETA_ACTIONS: Record<string, ModuleBetaAction> = {
  business: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosBusinessSettingsPage().load(businessId, token),
  },
  "settings-hub": {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "ready",
      areas: ["Información del negocio", "Catálogo", "Impuestos", "Métodos de pago", "Branding"],
      message: "Ajustes generales consolidados para navegación desacoplada v2.",
    }),
  },
  "sales-tax": {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosSalesTaxPage().getSalesTaxSettings(businessId, token),
  },
  branding: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosBrandingPage().loadProfile(businessId, token),
  },
  "payment-methods": {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosPaymentMethodPage().getViewModel(businessId, token),
  },
  "stripe-connect": {
    requiresBusinessId: true,
    run: ({ token }, factory) => factory.createPosStripeConnectPage().getConfig(token),
  },
  exports: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosExportReportPage().load(businessId, "products", "month", token),
  },
  inventory: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosInventoryPage().getInventoryCards(businessId, token, 5),
  },
  customers: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosCustomerPage().getCustomerCards(businessId, token),
  },
  employees: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosEmployeePage().getEmployeeCards(businessId, token),
  },
  "cash-closing": {
    requiresEmployeeId: true,
    run: ({ employeeId, token }, factory) => factory.createPosCashClosingPage().loadCurrent(Number(employeeId), token),
  },
  "online-store": {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosOnlineOrderPage().loadPendingOrders(businessId, token),
  },
  "catalog-settings": {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createCatalogPage().loadPublishedProducts(businessId, token),
  },
  printers: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "beta",
      message: "Impresoras beta: preparado para flujo Wi‑Fi con validación de datos antes de imprimir ticket/PDF.",
      strategy: {
        transport: "wifi-first",
        fallback: ["pdf", "browser-print"],
        validations: ["id de pedido/folio", "items > 0", "total > 0"],
      },
    }),
  },
  support: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "pending-integration",
      message: "Centro de ayuda v2 activo con datos de demostración.",
    }),
  },
  "delete-account": {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "protected",
      message: "El módulo está bloqueado hasta completar validaciones legales de eliminación.",
    }),
  },
  loyalty: {
    requiresBusinessId: true,
    run: async () => ({ message: "Módulo loyalty en transición. Próximo paso: conectar RewardsManagementPage UI." }),
  },
  coupons: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "beta",
      message: "Cupones v2 habilitado para pruebas. Próximo paso: editor de campañas.",
    }),
  },
  visits: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "beta",
      message: "Visitas v2 habilitado para pruebas. Próximo paso: historial de recompensas por cliente.",
    }),
  },
  "switch-user": {
    requiresBusinessId: true,
    run: async () => ({
      status: "secure-action",
      message: "Confirma cambio de usuario desde Más para limpiar sesión de forma segura.",
    }),
  },
};
