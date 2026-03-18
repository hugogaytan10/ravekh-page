import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { IPosSettingsRepository } from "../interface/IPosSettingsRepository";
import type { PosSettingsBootstrap } from "../model/PosSettings";

export class GetPosSettingsService {
  constructor(private readonly repository: IPosSettingsRepository) {}

  async execute(token: string, businessId: number): Promise<Result<PosSettingsBootstrap>> {
    try {
      const data = await this.repository.getBootstrap(token, businessId);
      return ok(data, "POS settings loaded successfully.");
    } catch (error) {
      return fail(
        "Failed to load POS settings.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
