import { fail, ok, type Result } from "../../../../shared/models/Result";
import type { IMembershipRepository } from "../interface/IMembershipRepository";
import type { MembershipMetrics } from "../model/Membership";

export class GetMembershipMetricsService {
  constructor(private readonly repository: IMembershipRepository) {}

  async execute(token: string, businessId: number): Promise<Result<MembershipMetrics>> {
    try {
      const members = await this.repository.getMembers(token, businessId);

      if (members.length === 0) {
        return ok(
          {
            totalMembers: 0,
            avgVisits: 0,
            avgRewardPoints: 0,
          },
          "Membership metrics loaded successfully.",
        );
      }

      const totalVisits = members.reduce((sum, member) => sum + member.visits, 0);
      const totalPoints = members.reduce((sum, member) => sum + member.rewardPoints, 0);

      return ok(
        {
          totalMembers: members.length,
          avgVisits: totalVisits / members.length,
          avgRewardPoints: totalPoints / members.length,
        },
        "Membership metrics loaded successfully.",
      );
    } catch (error) {
      return fail(
        "Failed to load membership metrics.",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
