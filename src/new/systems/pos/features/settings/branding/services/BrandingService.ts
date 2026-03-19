import { IBrandingRepository } from "../interface/IBrandingRepository";
import { BrandingProfile, UpdateBrandingProfileDto } from "../model/BrandingProfile";

export class BrandingService {
  constructor(private readonly repository: IBrandingRepository) {}

  async getProfile(businessId: number, token: string): Promise<BrandingProfile> {
    this.ensureIdentifiers(businessId, token);
    return this.repository.getByBusinessId(businessId, token);
  }

  async updateProfile(
    businessId: number,
    payload: UpdateBrandingProfileDto,
    token: string,
  ): Promise<BrandingProfile> {
    this.ensureIdentifiers(businessId, token);
    this.ensurePayload(payload);

    const profile = new BrandingProfile(
      businessId,
      payload.name.trim(),
      payload.address.trim(),
      payload.phoneNumber.trim(),
      payload.logo.trim(),
      payload.color.trim(),
      payload.references.trim(),
    );

    if (!profile.canBeSaved()) {
      throw new Error("Branding profile fields are required.");
    }

    return this.repository.update(businessId, {
      name: profile.name,
      address: profile.address,
      phoneNumber: profile.phoneNumber,
      logo: profile.logo,
      color: profile.color,
      references: profile.references,
    }, token);
  }

  private ensureIdentifiers(businessId: number, token: string): void {
    if (!businessId || businessId <= 0) {
      throw new Error("A valid business id is required.");
    }

    if (!token.trim()) {
      throw new Error("Authentication token is required.");
    }
  }

  private ensurePayload(payload: UpdateBrandingProfileDto): void {
    const values = [
      payload.name,
      payload.address,
      payload.phoneNumber,
      payload.logo,
      payload.color,
      payload.references,
    ];

    if (values.some((value) => !value?.trim())) {
      throw new Error("All branding fields are required.");
    }
  }
}
