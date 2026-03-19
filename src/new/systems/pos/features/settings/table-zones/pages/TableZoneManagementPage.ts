import { TableZoneService } from "../services/TableZoneService";
import { UpsertTableZoneDto } from "../model/TableZone";

type TableZoneCardViewModel = {
  id: number;
  name: string;
  isActive: boolean;
};

export class TableZoneManagementPage {
  constructor(private readonly service: TableZoneService) {}

  async getTableZoneCards(businessId: number, token: string, searchTerm = ""): Promise<TableZoneCardViewModel[]> {
    const tableZones = await this.service.listTableZones(businessId, token, searchTerm);

    return tableZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      isActive: zone.isActive,
    }));
  }

  async upsertTableZone(token: string, payload: UpsertTableZoneDto, tableZoneId?: number): Promise<void> {
    await this.service.saveTableZone(token, payload, tableZoneId);
  }

  async updateTableOrdersStatus(businessId: number, enabled: boolean, token: string): Promise<boolean> {
    return this.service.setBusinessTableOrdersEnabled(businessId, enabled, token);
  }
}
