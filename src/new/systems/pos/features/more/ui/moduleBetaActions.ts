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
  loyalty: {
    requiresBusinessId: true,
    run: async () => ({ message: "Módulo loyalty en transición. Próximo paso: conectar RewardsManagementPage UI." }),
  },
};
