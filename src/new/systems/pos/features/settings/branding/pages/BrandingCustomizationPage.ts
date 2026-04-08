import { BrandingProfile, UpdateBrandingProfileDto } from "../model/BrandingProfile";
import { BrandingService } from "../services/BrandingService";

export interface BrandingProfileViewModel {
  businessId: number;
  name: string;
  address: string;
  phoneNumber: string;
  logo: string;
  color: string;
  references: string;
}

export class BrandingCustomizationPage {
  constructor(private readonly brandingService: BrandingService) {}

  async loadProfile(businessId: number, token: string): Promise<BrandingProfileViewModel> {
    const profile = await this.brandingService.getProfile(businessId, token);
    return this.toViewModel(profile);
  }

  async saveProfile(
    businessId: number,
    payload: UpdateBrandingProfileDto,
    token: string,
  ): Promise<BrandingProfileViewModel> {
    const profile = await this.brandingService.updateProfile(businessId, payload, token);
    return this.toViewModel(profile);
  }

  private toViewModel(profile: BrandingProfile): BrandingProfileViewModel {
    return {
      businessId: profile.businessId,
      name: profile.name,
      address: profile.address,
      phoneNumber: profile.phoneNumber,
      logo: profile.logo,
      color: profile.color,
      references: profile.references,
    };
  }
}
