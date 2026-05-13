import { HttpClient } from "../../../../../core/api/HttpClient";
import { IBrandingRepository } from "../interface/IBrandingRepository";
import { BrandingProfile, UpdateBrandingProfileDto } from "../model/BrandingProfile";

type BusinessResponse = {
  Id?: number;
  id?: number;
  Name?: string;
  name?: string;
  Address?: string;
  address?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
  Logo?: string;
  logo?: string;
  Color?: string;
  color?: string;
  References?: string;
  references?: string;
};

type BusinessUpdateResult = {
  affectedRows?: number;
  changedRows?: number;
};

export class PosBrandingApi implements IBrandingRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(businessId: number, token: string): Promise<BrandingProfile> {
    const business = await this.httpClient.request<BusinessResponse>({
      method: "GET",
      path: `business/${businessId}`,
      token,
    });

    return this.toDomain(business, businessId);
  }

  async update(businessId: number, payload: UpdateBrandingProfileDto, token: string): Promise<BrandingProfile> {
    await this.httpClient.request<BusinessUpdateResult>({
      method: "PUT",
      path: `business/${businessId}`,
      token,
      body: {
        Name: payload.name,
        Address: payload.address,
        PhoneNumber: payload.phoneNumber,
        Logo: payload.logo,
        Color: payload.color,
        References: payload.references,
      },
    });

    return new BrandingProfile(
      businessId,
      payload.name,
      payload.address,
      payload.phoneNumber,
      payload.logo,
      payload.color,
      payload.references,
    );
  }

  private toDomain(response: BusinessResponse, fallbackBusinessId: number): BrandingProfile {
    return new BrandingProfile(
      response.Id ?? response.id ?? fallbackBusinessId,
      response.Name ?? response.name ?? "",
      response.Address ?? response.address ?? "",
      response.PhoneNumber ?? response.phoneNumber ?? "",
      response.Logo ?? response.logo ?? "",
      response.Color ?? response.color ?? "",
      response.References ?? response.references ?? "",
    );
  }
}
