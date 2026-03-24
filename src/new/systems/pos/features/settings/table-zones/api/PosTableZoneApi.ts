import { HttpClient } from "../../../../core/api/HttpClient";
import { ITableZoneRepository } from "../interface/ITableZoneRepository";
import { TableZone, UpsertTableZoneDto } from "../model/TableZone";

type TableZoneResponse = {
  Id: number;
  Business_Id: number;
  Name: string;
  Active: boolean | number | null;
};

export class PosTableZoneApi implements ITableZoneRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listByBusiness(businessId: number, token: string): Promise<TableZone[]> {
    const response = await this.httpClient.request<TableZoneResponse[]>({
      method: "GET",
      path: `table_zones/business/${businessId}`,
      token,
    });
    const rows = Array.isArray(response) ? response : [];

    return rows.map((zone) => this.toDomain(zone));
  }

  async create(payload: UpsertTableZoneDto, token: string): Promise<TableZone> {
    const response = await this.httpClient.request<TableZoneResponse>({
      method: "POST",
      path: "table_zones",
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async update(tableZoneId: number, payload: UpsertTableZoneDto, token: string): Promise<TableZone> {
    const response = await this.httpClient.request<TableZoneResponse>({
      method: "PUT",
      path: `table_zones/${tableZoneId}`,
      token,
      body: this.toApiPayload(payload),
    });

    return this.toDomain(response);
  }

  async setActivationByBusiness(businessId: number, isActive: boolean, token: string): Promise<boolean> {
    const response = await this.httpClient.request<TableZoneResponse[]>({
      method: "PUT",
      path: `table_zones/active/${businessId}`,
      token,
      body: { active: isActive },
    });
    const rows = Array.isArray(response) ? response : [];

    return rows.some((zone) => this.toBoolean(zone.Active));
  }

  private toApiPayload(payload: UpsertTableZoneDto): Record<string, unknown> {
    return {
      Business_Id: payload.businessId,
      Name: payload.name,
      Active: payload.isActive ?? true,
    };
  }

  private toDomain(response: TableZoneResponse): TableZone {
    return new TableZone(response.Id, response.Business_Id, response.Name, this.toBoolean(response.Active));
  }

  private toBoolean(value: boolean | number | null): boolean {
    return value === true || value === 1;
  }
}
