import { useEffect, useMemo, useState } from "react";
import { MembershipApi } from "../api/MembershipApi";
import type { MembershipMetrics } from "../model/Membership";
import { GetMembershipMetricsService } from "../services/GetMembershipMetricsService";

interface MembershipMetricsPageProps {
  token: string;
  businessId: number;
}

export const MembershipMetricsPage = ({ token, businessId }: MembershipMetricsPageProps) => {
  const [metrics, setMetrics] = useState<MembershipMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new GetMembershipMetricsService(new MembershipApi()), []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const result = await service.execute(token, businessId);

      if (!isMounted) {
        return;
      }

      if (!result.success || !result.data) {
        setError(result.error || result.message);
        return;
      }

      setMetrics(result.data);
      setError(null);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [businessId, service, token]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!metrics) {
    return <p>Loading membership metrics...</p>;
  }

  return (
    <section>
      <h2>Loyalty Membership Metrics</h2>
      <p>Total members: {metrics.totalMembers}</p>
      <p>Average visits: {metrics.avgVisits.toFixed(2)}</p>
      <p>Average reward points: {metrics.avgRewardPoints.toFixed(2)}</p>
    </section>
  );
};
