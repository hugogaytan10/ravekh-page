import { useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { HealthVm } from "../pages/HealthPage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://apipos.ravekh.com/api/";

export const PosHealthV2Screen = () => {
  const [health, setHealth] = useState<HealthVm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const page = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosHealthPage();
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentHealth = await page.loadHealth();
        if (mounted) {
          setHealth(currentHealth);
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Unable to validate API health.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <section style={{ padding: "1.5rem" }}>
      <h1>POS v2 • Health</h1>
      {loading ? <p>Cargando health…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {health ? (
        <ul>
          <li>status: {health.status}</li>
          <li>healthy: {String(health.healthy)}</li>
          <li>checkedAt: {health.checkedAt}</li>
        </ul>
      ) : null}
    </section>
  );
};
