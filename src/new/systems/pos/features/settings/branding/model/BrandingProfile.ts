export class BrandingProfile {
  constructor(
    public readonly businessId: number,
    public readonly name: string,
    public readonly address: string,
    public readonly phoneNumber: string,
    public readonly logo: string,
    public readonly color: string,
    public readonly references: string,
  ) {}

  canBeSaved(): boolean {
    return [
      this.name,
      this.address,
      this.phoneNumber,
      this.logo,
      this.color,
      this.references,
    ].every((value) => Boolean(value.trim()));
  }

  withLogo(logo: string): BrandingProfile {
    return new BrandingProfile(
      this.businessId,
      this.name,
      this.address,
      this.phoneNumber,
      logo,
      this.color,
      this.references,
    );
  }
}

export interface UpdateBrandingProfileDto {
  name: string;
  address: string;
  phoneNumber: string;
  logo: string;
  color: string;
  references: string;
}
