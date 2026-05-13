import { ISocialNetworksRepository } from "../interface/ISocialNetworksRepository";
import { SocialNetworks, UpsertSocialNetworksDto } from "../model/SocialNetworks";

export class SocialNetworksService {
  constructor(private readonly repository: ISocialNetworksRepository) {}

  async getSocialNetworks(businessId: number, token: string): Promise<SocialNetworks | null> {
    this.ensureIdentifiers(businessId, token);
    return this.repository.getByBusinessId(businessId, token);
  }

  async saveSocialNetworks(payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworks> {
    const normalizedPayload = this.normalizePayload(payload);
    this.ensureIdentifiers(normalizedPayload.businessId, token);

    const current = await this.repository.getByBusinessId(normalizedPayload.businessId, token);
    if (current?.id) {
      return this.repository.update(current.id, normalizedPayload, token);
    }

    return this.repository.create(normalizedPayload, token);
  }

  private normalizePayload(payload: UpsertSocialNetworksDto): UpsertSocialNetworksDto {
    return {
      businessId: payload.businessId,
      facebook: payload.facebook.trim(),
      instagram: payload.instagram.trim(),
      tikTok: payload.tikTok.trim(),
    };
  }

  private ensureIdentifiers(businessId: number, token: string): void {
    if (!Number.isFinite(businessId) || businessId <= 0) {
      throw new Error("A valid business id is required.");
    }

    if (!token.trim()) {
      throw new Error("Authentication token is required.");
    }
  }
}
