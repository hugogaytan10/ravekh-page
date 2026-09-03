export class BusinessSettings {
  constructor(
    public readonly businessId: number,
    public readonly businessName: string,
    public readonly taxId: number | null,
    public readonly tablesEnabled: boolean,
    public readonly plan: string | null,
    public readonly changesNoticeViewed: boolean,
    public readonly changesNoticeViewedAt: string | null,
  ) {}

  withTaxId(taxId: number): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, taxId, this.tablesEnabled, this.plan, this.changesNoticeViewed, this.changesNoticeViewedAt);
  }

  withTablesEnabled(tablesEnabled: boolean): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, this.taxId, tablesEnabled, this.plan, this.changesNoticeViewed, this.changesNoticeViewedAt);
  }
}

export interface UpdateBusinessSettingsDto {
  businessName?: string;
  taxId?: number;
}

export type BusinessChangesNoticeStatus = {
  viewed: boolean;
  viewedAt: string | null;
};
