import type { LoyaltyRewardModel } from "../models/LoyaltyRewardModel";
import { LoyaltyRewardsApi } from "../api/LoyaltyRewardsApi";

export class LoyaltyRewardsService {
  constructor(private readonly rewardsApi: LoyaltyRewardsApi) {}

  async listRewards(): Promise<LoyaltyRewardModel[]> {
    return this.rewardsApi.listRewards();
  }
}
