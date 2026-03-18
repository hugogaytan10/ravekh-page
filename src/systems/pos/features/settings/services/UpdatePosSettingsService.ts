import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { IPosSettingsRepository } from "../interface/IPosSettingsRepository";
import type { PosBusinessSettings, UpdatePosBusinessSettingsInput } from "../model/PosSettings";

export class UpdatePosSettingsService {
  constructor(private readonly repository: IPosSettingsRepository) {}

  async execute(
    token: string,
    businessId: number,
    input: UpdatePosBusinessSettingsInput,
  ): Promise<Result<PosBusinessSettings>> {
    try {
      const updatedSettings = await this.repository.updateSettings(token, businessId, input);
      return ok(updatedSettings, "POS settings updated successfully.");
    } catch (error) {
      return fail(
        "Failed to update POS settings.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
