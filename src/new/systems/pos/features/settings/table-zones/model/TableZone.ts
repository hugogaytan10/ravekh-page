export class TableZone {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly isActive: boolean,
  ) {}

  rename(nextName: string): TableZone {
    return new TableZone(this.id, this.businessId, nextName.trim(), this.isActive);
  }

  activate(): TableZone {
    return new TableZone(this.id, this.businessId, this.name, true);
  }

  deactivate(): TableZone {
    return new TableZone(this.id, this.businessId, this.name, false);
  }

  matches(searchTerm: string): boolean {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return true;
    }

    return this.name.toLowerCase().includes(normalized);
  }
}

export interface UpsertTableZoneDto {
  businessId: number;
  name: string;
  isActive?: boolean;
}
