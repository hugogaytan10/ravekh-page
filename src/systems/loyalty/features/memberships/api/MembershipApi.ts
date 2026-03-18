import type { IMembershipRepository } from "../interface/IMembershipRepository";
import type { LoyaltyMember } from "../model/Membership";

const POS_API_BASE_URL = "https://apipos.ravekh.com/api/";

type LegacyRecord = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export class MembershipApi implements IMembershipRepository {
  async getMembers(token: string, businessId: number): Promise<LoyaltyMember[]> {
    const response = await fetch(`${POS_API_BASE_URL}customers/business/${businessId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    });

    if (!response.ok) {
      throw new Error(`Unable to load loyalty members. Status: ${response.status}.`);
    }

    const data = (await response.json()) as LegacyRecord[];

    return data.map((member) => ({
      id: toNumber(member.Id),
      fullName: toStringValue(member.Name),
      visits: toNumber(member.Visits),
      rewardPoints: toNumber(member.Points),
    }));
  }
}
