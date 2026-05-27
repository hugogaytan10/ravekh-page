export class BusinessSettings {
  constructor(
    public readonly businessId: number,
    public readonly businessName: string,
    public readonly taxId: number | null,
    public readonly tablesEnabled: boolean,
    public readonly plan: string | null,
  ) {}

  withTaxId(taxId: number): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, taxId, this.tablesEnabled, this.plan);
  }

  withTablesEnabled(tablesEnabled: boolean): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, this.taxId, tablesEnabled, this.plan);
  }
}

export interface UpdateBusinessSettingsDto {
  businessName?: string;
  taxId?: number;
}
