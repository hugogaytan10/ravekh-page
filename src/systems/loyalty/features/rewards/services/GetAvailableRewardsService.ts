import type { Result } from "../../../../shared/model/Result";
import type { ILoyaltyRewardRepository } from "../interfaces/ILoyaltyRewardRepository";
import type { LoyaltyReward } from "../model/LoyaltyReward";

export class GetAvailableRewardsService {
  constructor(private readonly repository: ILoyaltyRewardRepository) {}

  public execute(businessId: string): Promise<Result<LoyaltyReward[]>> {
    return this.repository.getRewards(businessId);
  }
}
