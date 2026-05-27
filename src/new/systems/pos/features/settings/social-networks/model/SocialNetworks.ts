export class SocialNetworks {
  constructor(
    public readonly id: number | null,
    public readonly businessId: number,
    public readonly facebook: string,
    public readonly instagram: string,
    public readonly tikTok: string,
  ) {}
}

export interface UpsertSocialNetworksDto {
  businessId: number;
  facebook: string;
  instagram: string;
  tikTok: string;
}
