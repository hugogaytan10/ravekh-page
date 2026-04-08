import { HttpClient } from "../../../../core/api/HttpClient";
import { ITableZoneRepository } from "../interface/ITableZoneRepository";
import { TableZone, UpsertTableZoneDto } from "../model/TableZone";

type TableZoneResponse = {
  Id?: number;
  id?: number;
  Business_Id?: number;
  business_Id?: number;
  businessId?: number;
  Name?: string;
  name?: string;
  Active?: boolean | number | string | null;
  active?: boolean | number | string | null;
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
    return new TableZone(
      response.Id ?? response.id ?? 0,
      response.Business_Id ?? response.business_Id ?? response.businessId ?? 0,
      response.Name ?? response.name ?? "",
      this.toBoolean(response.Active ?? response.active),
    );
  }

  private toBoolean(value: boolean | number | string | null | undefined): boolean {
    return value === true || value === 1 || value === "1" || value === "true";
  }
}
