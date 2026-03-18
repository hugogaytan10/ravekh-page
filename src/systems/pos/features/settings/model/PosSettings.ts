export interface PosBusinessSettings {
  businessId: number;
  displayName: string;
  primaryColor: string;
  taxesId: number | null;
  tablesEnabled: boolean;
}

export interface UpdatePosBusinessSettingsInput {
  displayName?: string;
  primaryColor?: string;
  taxesId?: number | null;
  tablesEnabled?: boolean;
}

export interface PosSettingsBootstrap {
  settings: PosBusinessSettings;
  availableTaxes: Array<{
    id: number;
    name: string;
    percentage: number;
  }>;
}
