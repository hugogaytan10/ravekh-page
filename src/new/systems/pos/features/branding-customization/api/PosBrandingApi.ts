import { HttpClient } from "../../../../../core/api/HttpClient";
import { IBrandingRepository } from "../interface/IBrandingRepository";
import { BrandingProfile, UpdateBrandingProfileDto } from "../model/BrandingProfile";

type BusinessResponse = {
  Id?: number;
  Name?: string;
  Address?: string;
  PhoneNumber?: string;
  Logo?: string;
  Color?: string;
  References?: string;
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
    const updated = await this.httpClient.request<BusinessResponse>({
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

    return this.toDomain(updated, businessId);
  }

  private toDomain(response: BusinessResponse, fallbackBusinessId: number): BrandingProfile {
    return new BrandingProfile(
      response.Id ?? fallbackBusinessId,
      response.Name ?? "",
      response.Address ?? "",
      response.PhoneNumber ?? "",
      response.Logo ?? "",
      response.Color ?? "",
      response.References ?? "",
    );
  }
}
