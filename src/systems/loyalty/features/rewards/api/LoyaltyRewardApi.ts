import { success, type Result } from "../../../../shared/model/Result";
import type { ILoyaltyRewardRepository } from "../interfaces/ILoyaltyRewardRepository";
import type { LoyaltyReward } from "../model/LoyaltyReward";

export class LoyaltyRewardApi implements ILoyaltyRewardRepository {
  public async getRewards(_businessId: string): Promise<Result<LoyaltyReward[]>> {
    // This repository is intentionally isolated from the legacy implementation.
    // The loyalty backend contract can be plugged in here without touching services/pages.
    return success([]);
  }
}
