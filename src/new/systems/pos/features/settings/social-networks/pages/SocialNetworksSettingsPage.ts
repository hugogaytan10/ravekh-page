import { SocialNetworks, UpsertSocialNetworksDto } from "../model/SocialNetworks";
import { SocialNetworksService } from "../services/SocialNetworksService";

export interface SocialNetworksViewModel {
  id: number | null;
  businessId: number;
  facebook: string;
  instagram: string;
  tikTok: string;
}

export class SocialNetworksSettingsPage {
  constructor(private readonly service: SocialNetworksService) {}

  async getSocialNetworksSettings(businessId: number, token: string): Promise<SocialNetworksViewModel> {
    const socialNetworks = await this.service.getSocialNetworks(businessId, token);

    if (!socialNetworks) {
      return {
        id: null,
        businessId,
        facebook: "",
        instagram: "",
        tikTok: "",
      };
    }

    return this.toViewModel(socialNetworks);
  }

  async saveSocialNetworksSettings(payload: UpsertSocialNetworksDto, token: string): Promise<SocialNetworksViewModel> {
    const socialNetworks = await this.service.saveSocialNetworks(payload, token);
    return this.toViewModel(socialNetworks);
  }

  private toViewModel(socialNetworks: SocialNetworks): SocialNetworksViewModel {
    return {
      id: socialNetworks.id,
      businessId: socialNetworks.businessId,
      facebook: socialNetworks.facebook,
      instagram: socialNetworks.instagram,
      tikTok: socialNetworks.tikTok,
    };
  }
}
