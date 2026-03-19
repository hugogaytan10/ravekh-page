import { BusinessSettings, UpdateBusinessSettingsDto } from "../model/BusinessSettings";

export interface IBusinessSettingsRepository {
  getByBusinessId(businessId: number, token: string): Promise<BusinessSettings>;
  update(businessId: number, payload: UpdateBusinessSettingsDto, token: string): Promise<BusinessSettings>;
  updateTablesStatus(businessId: number, enabled: boolean, token: string): Promise<boolean>;
  deleteEmployeeAccount(userId: number, token: string): Promise<void>;
}
