import { IBusinessSettingsRepository } from "../interface/IBusinessSettingsRepository";
import { BusinessChangesNoticeStatus, BusinessSettings, UpdateBusinessSettingsDto } from "../model/BusinessSettings";

export class BusinessSettingsService {
  constructor(private readonly repository: IBusinessSettingsRepository) {}

  async getSettings(businessId: number, token: string): Promise<BusinessSettings> {
    return this.repository.getByBusinessId(businessId, token);
  }

  async getChangesNoticeStatus(businessId: number, token: string): Promise<BusinessChangesNoticeStatus> {
    return this.repository.getChangesNoticeStatus(businessId, token);
  }

  async acknowledgeChangesNotice(businessId: number, token: string): Promise<void> {
    return this.repository.acknowledgeChangesNotice(businessId, token);
  }

  async updateSettings(businessId: number, payload: UpdateBusinessSettingsDto, token: string): Promise<BusinessSettings> {
    const currentSettings = await this.repository.getByBusinessId(businessId, token);
    const updated = await this.repository.update(businessId, payload, token);

    return new BusinessSettings(
      updated.businessId,
      updated.businessName,
      updated.taxId,
      currentSettings.tablesEnabled,
      currentSettings.plan,
      currentSettings.changesNoticeViewed,
      currentSettings.changesNoticeViewedAt,
    );
  }

  async changeTablesAvailability(businessId: number, enabled: boolean, token: string): Promise<BusinessSettings> {
    const currentSettings = await this.repository.getByBusinessId(businessId, token);
    const tablesEnabled = await this.repository.updateTablesStatus(businessId, enabled, token);
    return currentSettings.withTablesEnabled(tablesEnabled);
  }

  async removeEmployeeAccount(userId: number, token: string): Promise<void> {
    await this.repository.deleteEmployeeAccount(userId, token);
  }
}
