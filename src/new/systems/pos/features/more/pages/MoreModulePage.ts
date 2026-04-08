import { MoreModuleExecutionContext, MoreModuleExecutionResult } from "../model/MoreModule";
import { MoreModuleService } from "../services/MoreModuleService";

export class MoreModulePage {
  constructor(private readonly service: MoreModuleService) {}

  async execute(moduleId: string, moduleTitle: string, context: MoreModuleExecutionContext): Promise<MoreModuleExecutionResult> {
    const payload = await this.service.runBetaAction(moduleId, context);
    return {
      moduleId,
      moduleTitle,
      payload,
    };
  }

  supportsInlineExecution(moduleId: string): boolean {
    return this.service.hasBetaAction(moduleId);
  }
}
