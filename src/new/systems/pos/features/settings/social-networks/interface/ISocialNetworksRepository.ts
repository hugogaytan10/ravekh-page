import { SocialNetworks, UpsertSocialNetworksDto } from "../model/SocialNetworks";

export interface ISocialNetworksRepository {
  getByBusinessId(businessId: number, token: string): Promise<SocialNetworks | null>;
  create(payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworks>;
  update(id: number, payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworks>;
}
