import { ModernSystemsFactory } from "../../../../../index";

type ModuleContext = {
  token: string;
  businessId: number;
  employeeId?: number;
};

export type ModuleBetaAction = {
  requiresBusinessId?: boolean;
  requiresEmployeeId?: boolean;
  run: (context: ModuleContext, factory: ModernSystemsFactory) => Promise<unknown>;
};

export const MODULE_BETA_ACTIONS: Record<string, ModuleBetaAction> = {
  business: {
    requiresBusinessId: true,
    run: ({ businessId, token }, factory) => factory.createPosBusinessSettingsPage().load(businessId, token),
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
  roles: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "pending-integration",
      message: "Roles y permisos preparados en v2, falta endpoint de permisos granulares.",
    }),
  },
  printers: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "pending-integration",
      message: "Vista de impresoras habilitada en beta; esperando integración de dispositivos.",
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
  branches: {
    requiresBusinessId: true,
    run: async ({ businessId }) => ({
      businessId,
      status: "pending-integration",
      message: "Gestión multi-sucursal lista para endpoint de sucursales reales.",
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
};
