import { useEffect, useMemo, useState } from "react";
import { LoyaltyRewardApi } from "../api/LoyaltyRewardApi";
import type { LoyaltyReward } from "../model/LoyaltyReward";
import { GetAvailableRewardsService } from "../services/GetAvailableRewardsService";

interface LoyaltyRewardsPageProps {
  businessId: string;
}

export const LoyaltyRewardsPage = ({ businessId }: LoyaltyRewardsPageProps) => {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);

  const service = useMemo(() => {
    const repository = new LoyaltyRewardApi();
    return new GetAvailableRewardsService(repository);
  }, []);

  useEffect(() => {
    service.execute(businessId).then((result) => {
      if (result.ok) {
        setRewards(result.data);
      }
    });
  }, [businessId, service]);

  return (
    <section>
      <h1>Loyalty Rewards</h1>
      <p>{rewards.length} rewards available.</p>
    </section>
  );
};
