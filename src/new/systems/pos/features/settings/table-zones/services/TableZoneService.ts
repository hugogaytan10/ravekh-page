import { ITableZoneRepository } from "../interface/ITableZoneRepository";
import { TableZone, UpsertTableZoneDto } from "../model/TableZone";

export class TableZoneService {
  constructor(private readonly repository: ITableZoneRepository) {}

  async listTableZones(businessId: number, token: string, searchTerm = ""): Promise<TableZone[]> {
    const tableZones = await this.repository.listByBusiness(businessId, token);
    if (!searchTerm) {
      return tableZones;
    }

    return tableZones.filter((zone) => zone.matches(searchTerm));
  }

  async saveTableZone(token: string, payload: UpsertTableZoneDto, tableZoneId?: number): Promise<TableZone> {
    const normalizedPayload: UpsertTableZoneDto = {
      ...payload,
      name: payload.name.trim(),
      isActive: payload.isActive ?? true,
    };

    if (!normalizedPayload.name) {
      throw new Error("Table zone name is required.");
    }

    if (tableZoneId) {
      return this.repository.update(tableZoneId, normalizedPayload, token);
    }

    return this.repository.create(normalizedPayload, token);
  }

  async setBusinessTableOrdersEnabled(businessId: number, enabled: boolean, token: string): Promise<boolean> {
    return this.repository.setActivationByBusiness(businessId, enabled, token);
  }
}
