import { ModernSystemsFactory } from "../../../../../index";
import { MODULE_BETA_ACTIONS } from "../ui/moduleBetaActions";
import { MoreModuleExecutionContext } from "../model/MoreModule";

export class MoreModuleService {
  constructor(private readonly apiBaseUrl: string) {}

  hasBetaAction(moduleId: string): boolean {
    return Boolean(MODULE_BETA_ACTIONS[moduleId]);
  }

  async runBetaAction(moduleId: string, context: MoreModuleExecutionContext): Promise<unknown> {
    const action = MODULE_BETA_ACTIONS[moduleId];
    if (!action) {
      throw new Error("Este módulo aún no tiene acciones beta habilitadas.");
    }

    if (!context.token.trim()) {
      throw new Error("No hay token activo. Inicia sesión para ejecutar acciones del módulo.");
    }

    if (action.requiresBusinessId && (!Number.isFinite(context.businessId) || context.businessId <= 0)) {
      throw new Error("No hay Business ID válido en sesión.");
    }

    if (action.requiresEmployeeId && (!Number.isFinite(context.employeeId) || Number(context.employeeId) <= 0)) {
      throw new Error("Este módulo requiere Employee ID válido en sesión.");
    }

    const factory = new ModernSystemsFactory(this.apiBaseUrl);
    return action.run(context, factory);
  }
}
