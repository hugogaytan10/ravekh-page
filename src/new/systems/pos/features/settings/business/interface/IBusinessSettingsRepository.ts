import { BusinessChangesNoticeStatus, BusinessSettings, UpdateBusinessSettingsDto } from "../model/BusinessSettings";

export interface IBusinessSettingsRepository {
  getByBusinessId(businessId: number, token: string): Promise<BusinessSettings>;
  update(businessId: number, payload: UpdateBusinessSettingsDto, token: string): Promise<BusinessSettings>;
  getChangesNoticeStatus(businessId: number, token: string): Promise<BusinessChangesNoticeStatus>;
  acknowledgeChangesNotice(businessId: number, token: string): Promise<void>;
  updateTablesStatus(businessId: number, enabled: boolean, token: string): Promise<boolean>;
  deleteEmployeeAccount(userId: number, token: string): Promise<void>;
}
