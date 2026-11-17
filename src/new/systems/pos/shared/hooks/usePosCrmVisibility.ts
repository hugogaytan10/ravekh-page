import {useEffect, useState} from "react";
import {FetchHttpClient} from "../../../../core/api/FetchHttpClient";
import {getPosApiBaseUrl} from "../config/posEnv";

export function usePosCrmVisibility(businessId: number, token: string) {
  const [visible, setVisible] = useState<boolean | null>(null);
  useEffect(() => {
    if (!token || !businessId) { setVisible(false); return; }
    let active = true;
    setVisible(null);
    void new FetchHttpClient(getPosApiBaseUrl()).request<{businessId: number; crmEnabled: boolean}>({
      method: "GET", path: "feature-flags", token,
    }).then(flags => {
      if (active) setVisible(flags.crmEnabled === true && Number(flags.businessId) === businessId);
    }).catch(() => { if (active) setVisible(false); });
    return () => { active = false; };
  }, [businessId, token]);
  return visible;
}
