export interface LoyaltyReward {
  id: string;
  title: string;
  requiredPoints: number;
  isActive: boolean;
}

export interface LegacyRewardDto {
  id: string;
  name: string;
  points: number;
  active: boolean;
}

export const mapLegacyRewardDto = (dto: LegacyRewardDto): LoyaltyReward => ({
  id: dto.id,
  title: dto.name,
  requiredPoints: dto.points,
  isActive: dto.active,
});
