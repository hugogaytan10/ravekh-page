export class BusinessSettings {
  constructor(
    public readonly businessId: number,
    public readonly businessName: string,
    public readonly taxId: number | null,
    public readonly tablesEnabled: boolean,
  ) {}

  withTaxId(taxId: number): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, taxId, this.tablesEnabled);
  }

  withTablesEnabled(tablesEnabled: boolean): BusinessSettings {
    return new BusinessSettings(this.businessId, this.businessName, this.taxId, tablesEnabled);
  }
}

export interface UpdateBusinessSettingsDto {
  businessName?: string;
  taxId?: number;
}
