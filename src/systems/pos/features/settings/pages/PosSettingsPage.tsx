import { useEffect, useMemo, useState } from "react";
import { PosSettingsApi } from "../api/PosSettingsApi";
import type { PosBusinessSettings } from "../model/PosSettings";
import { GetPosSettingsService } from "../services/GetPosSettingsService";
import { UpdatePosSettingsService } from "../services/UpdatePosSettingsService";

interface PosSettingsPageProps {
  token: string;
  businessId: number;
}

export const PosSettingsPage = ({ token, businessId }: PosSettingsPageProps) => {
  const [settings, setSettings] = useState<PosBusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const services = useMemo(() => {
    const repository = new PosSettingsApi();
    return {
      getSettings: new GetPosSettingsService(repository),
      updateSettings: new UpdatePosSettingsService(repository),
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const result = await services.getSettings.execute(token, businessId);

      if (!isMounted) {
        return;
      }

      if (!result.success || !result.data) {
        setError(result.error || result.message);
        setIsLoading(false);
        return;
      }

      setSettings(result.data.settings);
      setError(null);
      setIsLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [businessId, services.getSettings, token]);

  const toggleTables = async () => {
    if (!settings) {
      return;
    }

    const result = await services.updateSettings.execute(token, businessId, {
      tablesEnabled: !settings.tablesEnabled,
    });

    if (!result.success || !result.data) {
      setError(result.error || result.message);
      return;
    }

    setSettings(result.data);
    setError(null);
  };

  if (isLoading) {
    return <p>Loading POS settings...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!settings) {
    return <p>No settings found.</p>;
  }

  return (
    <section>
      <h2>POS Settings</h2>
      <p>Business: {settings.displayName}</p>
      <p>Primary color: {settings.primaryColor}</p>
      <p>Selected tax: {settings.taxesId ?? "None"}</p>
      <button type="button" onClick={toggleTables}>
        {settings.tablesEnabled ? "Disable tables" : "Enable tables"}
      </button>
    </section>
  );
};
