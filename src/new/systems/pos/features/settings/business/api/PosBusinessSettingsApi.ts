import { HttpClient } from "../../../../core/api/HttpClient";
import { IBusinessSettingsRepository } from "../interface/IBusinessSettingsRepository";
import { BusinessSettings, UpdateBusinessSettingsDto } from "../model/BusinessSettings";

type BusinessResponse = {
  Id: number;
  Name: string;
  Taxes_Id?: number | null;
  Plan?: string | null;
  plan?: string | null;
};

type TableZoneResponse = {
  Active: boolean;
};

export class PosBusinessSettingsApi implements IBusinessSettingsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(businessId: number, token: string): Promise<BusinessSettings> {
    const [business, tableZones] = await Promise.all([
      this.httpClient.request<BusinessResponse>({
        method: "GET",
        path: `business/${businessId}`,
        token,
      }),
      this.httpClient.request<TableZoneResponse[]>({
        method: "GET",
        path: `table_zones/business/${businessId}`,
        token,
      }),
    ]);

    const tablesEnabled = tableZones.some((zone) => zone.Active);
    return this.toDomain(business, tablesEnabled);
  }

  async update(businessId: number, payload: UpdateBusinessSettingsDto, token: string): Promise<BusinessSettings> {
    const businessPayload: Record<string, unknown> = {};

    if (payload.businessName !== undefined) {
      businessPayload.Name = payload.businessName;
    }

    if (payload.taxId !== undefined) {
      businessPayload.Taxes_Id = payload.taxId;
    }

    const updated = await this.httpClient.request<BusinessResponse>({
      method: "PUT",
      path: `business/${businessId}`,
      token,
      body: businessPayload,
    });

    return this.toDomain(updated, false);
  }

  async updateTablesStatus(businessId: number, enabled: boolean, token: string): Promise<boolean> {
    const updatedZones = await this.httpClient.request<TableZoneResponse[]>({
      method: "PUT",
      path: `table_zones/active/${businessId}`,
      token,
      body: { active: enabled },
    });

    return updatedZones.some((zone) => zone.Active);
  }

  async deleteEmployeeAccount(userId: number, token: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "DELETE",
      path: `employee/${userId}`,
      token,
    });
  }

  private toDomain(business: BusinessResponse, tablesEnabled: boolean): BusinessSettings {
    return new BusinessSettings(business.Id, business.Name, business.Taxes_Id ?? null, tablesEnabled, business.Plan ?? business.plan ?? null);
  }
}
