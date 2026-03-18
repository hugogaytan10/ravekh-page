import type { PosBusinessSettings, PosSettingsBootstrap, UpdatePosBusinessSettingsInput } from "../model/PosSettings";

export interface IPosSettingsRepository {
  getSettings(token: string, businessId: number): Promise<PosBusinessSettings>;
  getBootstrap(token: string, businessId: number): Promise<PosSettingsBootstrap>;
  updateSettings(token: string, businessId: number, input: UpdatePosBusinessSettingsInput): Promise<PosBusinessSettings>;
}
