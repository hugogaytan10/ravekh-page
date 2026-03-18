import type { Result } from "../../../../shared/model/Result";
import type { LoyaltyReward } from "../model/LoyaltyReward";

export interface ILoyaltyRewardRepository {
  getRewards(businessId: string): Promise<Result<LoyaltyReward[]>>;
}
