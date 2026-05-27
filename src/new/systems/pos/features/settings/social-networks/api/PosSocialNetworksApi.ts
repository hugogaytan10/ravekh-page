import { HttpClient } from "../../../../../core/api/HttpClient";
import { ISocialNetworksRepository } from "../interface/ISocialNetworksRepository";
import { SocialNetworks, UpsertSocialNetworksDto } from "../model/SocialNetworks";

type SocialNetworksResponse = {
  Id?: number;
  id?: number;
  Facebook?: string;
  facebook?: string;
  Instagram?: string;
  instagram?: string;
  TikTok?: string;
  tikTok?: string;
  Tiktok?: string;
  tiktok?: string;
  Business_Id?: number;
  businessId?: number;
};

export class PosSocialNetworksApi implements ISocialNetworksRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getByBusinessId(businessId: number, token: string): Promise<SocialNetworks | null> {
    try {
      const response = await this.httpClient.request<SocialNetworksResponse | SocialNetworksResponse[] | null>({
        method: "GET",
        path: `socialnetworks/business/${businessId}`,
        token,
      });
      const socialNetworks = Array.isArray(response) ? response[0] : response;

      return socialNetworks ? this.toDomain(socialNetworks, businessId) : null;
    } catch (cause) {
      if (this.isNotFound(cause)) return null;
      throw cause;
    }
  }

  async create(payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworks> {
    const created = await this.httpClient.request<SocialNetworksResponse | number>({
      method: "POST",
      path: "socialnetworks",
      token,
      body: this.toCreatePayload(payload),
    });

    if (typeof created === "number") {
      return new SocialNetworks(created, payload.businessId, payload.facebook, payload.instagram, payload.tikTok);
    }

    return this.toDomain(created, payload.businessId);
  }

  async update(id: number, payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworks> {
    const updated = await this.httpClient.request<SocialNetworksResponse | null>({
      method: "PUT",
      path: `socialnetworks/${id}`,
      token,
      body: this.toUpdatePayload(payload),
    });

    return updated ? this.toDomain(updated, payload.businessId) : new SocialNetworks(id, payload.businessId, payload.facebook, payload.instagram, payload.tikTok);
  }

  private toCreatePayload(payload: UpsertSocialNetworksDto): Record<string, unknown> {
    return {
      ...this.toUpdatePayload(payload),
      Business_Id: payload.businessId,
    };
  }

  private toUpdatePayload(payload: UpsertSocialNetworksDto): Record<string, unknown> {
    return {
      Facebook: payload.facebook,
      Instagram: payload.instagram,
      TikTok: payload.tikTok,
    };
  }

  private toDomain(response: SocialNetworksResponse, fallbackBusinessId: number): SocialNetworks {
    return new SocialNetworks(
      Number(response.Id ?? response.id ?? 0) || null,
      Number(response.Business_Id ?? response.businessId ?? fallbackBusinessId),
      String(response.Facebook ?? response.facebook ?? ""),
      String(response.Instagram ?? response.instagram ?? ""),
      String(response.TikTok ?? response.tikTok ?? response.Tiktok ?? response.tiktok ?? ""),
    );
  }

  private isNotFound(cause: unknown): boolean {
    return typeof cause === "object" && cause !== null && "status" in cause && Number((cause as { status?: number }).status) === 404;
  }
}
