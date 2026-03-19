import { BusinessSettingsService } from "../services/BusinessSettingsService";

export interface BusinessSettingsViewModel {
  businessId: number;
  businessName: string;
  taxId: number | null;
  tablesEnabled: boolean;
}

export class BusinessSettingsPage {
  constructor(private readonly service: BusinessSettingsService) {}

  async load(businessId: number, token: string): Promise<BusinessSettingsViewModel> {
    const settings = await this.service.getSettings(businessId, token);

    return {
      businessId: settings.businessId,
      businessName: settings.businessName,
      taxId: settings.taxId,
      tablesEnabled: settings.tablesEnabled,
    };
  }
}
