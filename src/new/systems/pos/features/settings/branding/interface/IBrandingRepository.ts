import { BrandingProfile, UpdateBrandingProfileDto } from "../model/BrandingProfile";

export interface IBrandingRepository {
  getByBusinessId(businessId: number, token: string): Promise<BrandingProfile>;
  update(businessId: number, payload: UpdateBrandingProfileDto, token: string): Promise<BrandingProfile>;
}
