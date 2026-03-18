import type { IPosSettingsRepository } from "../interface/IPosSettingsRepository";
import type { PosBusinessSettings, PosSettingsBootstrap, UpdatePosBusinessSettingsInput } from "../model/PosSettings";

const POS_API_BASE_URL = "https://apipos.ravekh.com/api/";

type LegacyRecord = Record<string, unknown>;

class PosHttpGateway {
  constructor(private readonly token: string) {}

  async get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, "GET");
  }

  async put<TBody extends object, TResponse>(path: string, body: TBody): Promise<TResponse> {
    return this.request<TResponse>(path, "PUT", body);
  }

  private async request<TResponse>(path: string, method: "GET" | "PUT", body?: object): Promise<TResponse> {
    const response = await fetch(`${POS_API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        token: this.token,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`POS settings request failed with status ${response.status}.`);
    }

    return (await response.json()) as TResponse;
  }
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const toBooleanValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return fallback;
};

const mapBusinessSettings = (data: LegacyRecord): PosBusinessSettings => ({
  businessId: toNumber(data.Id),
  displayName: toStringValue(data.Name),
  primaryColor: toStringValue(data.Color, "#7C3AED"),
  taxesId: toOptionalNumber(data.Taxes_Id),
  tablesEnabled: toBooleanValue(data.Tables, false),
});

export class PosSettingsApi implements IPosSettingsRepository {
  async getSettings(token: string, businessId: number): Promise<PosBusinessSettings> {
    const client = new PosHttpGateway(token);
    const business = await client.get<LegacyRecord>(`business/${businessId}`);
    return mapBusinessSettings(business);
  }

  async getBootstrap(token: string, businessId: number): Promise<PosSettingsBootstrap> {
    const client = new PosHttpGateway(token);
    const [business, taxes] = await Promise.all([
      client.get<LegacyRecord>(`business/${businessId}`),
      client.get<LegacyRecord[]>(`taxes/business/${businessId}`),
    ]);

    return {
      settings: mapBusinessSettings(business),
      availableTaxes: taxes.map((tax) => ({
        id: toNumber(tax.Id),
        name: toStringValue(tax.Name),
        percentage: toNumber(tax.Percentage),
      })),
    };
  }

  async updateSettings(
    token: string,
    businessId: number,
    input: UpdatePosBusinessSettingsInput,
  ): Promise<PosBusinessSettings> {
    const client = new PosHttpGateway(token);
    const payload = {
      Name: input.displayName,
      Color: input.primaryColor,
      Taxes_Id: input.taxesId,
      Tables: input.tablesEnabled,
    };

    const updatedBusiness = await client.put<typeof payload, LegacyRecord>(`business/${businessId}`, payload);

    return mapBusinessSettings(updatedBusiness);
  }
}
