export type MoreModuleStatus = "available" | "beta" | "preview";

export type MoreModuleActionType = "route" | "beta-action";

export interface MoreModuleLink {
  id: string;
  title: string;
  description: string;
  path: string;
  status: MoreModuleStatus;
  actionType: MoreModuleActionType;
}

export interface MoreModuleSection {
  title: string;
  subtitle: string;
  items: MoreModuleLink[];
}

export type MoreModuleExecutionContext = {
  token: string;
  businessId: number;
  employeeId: number;
};

export type MoreModuleExecutionResult = {
  moduleId: string;
  moduleTitle: string;
  payload: unknown;
};
