import { FormEvent, useEffect, useMemo, useState } from "react";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_SESSION_STORAGE_KEYS } from "../../../shared/config/posSession";
import {
  persistPosSession,
  type PersistedPosSession,
} from "../../../shared/config/posSessionRuntime";
import {
  type LoginSessionLimitPayload,
  processLoginFailure,
} from "../../auth/model/LoginSessionLimit";

type CatalogAiSessionRefreshModalProps = {
  open: boolean;
  expectedBusinessId: number;
  onContinueLater: () => void;
  onRefreshed: (session: PersistedPosSession) => Promise<void> | void;
};

export const CatalogAiSessionRefreshModal = ({
  open,
  expectedBusinessId,
  onContinueLater,
  onRefreshed,
}: CatalogAiSessionRefreshModalProps) => {
  const [email, setEmail] = useState(
    () =>
      window.localStorage.getItem(POS_SESSION_STORAGE_KEYS.email) ?? "",
  );
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closingSessions, setClosingSessions] = useState(false);
  const [sessionLimit, setSessionLimit] =
    useState<LoginSessionLimitPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(getPosApiBaseUrl());
    return factory.createPosAuthOnboardingPage();
  }, []);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError(null);
    setNotice(null);
    setSessionLimit(null);
    const storedEmail = window.localStorage.getItem(
      POS_SESSION_STORAGE_KEYS.email,
    );
    if (storedEmail) setEmail(storedEmail);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Escribe tu correo y contraseña para continuar.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    setSessionLimit(null);

    try {
      const session = await authPage.signIn({
        email: email.trim(),
        password,
      });

      if (session.businessId !== expectedBusinessId) {
        throw new Error(
          "La cuenta pertenece a otro negocio. Inicia sesión con la cuenta con la que comenzaste esta importación.",
        );
      }

      const refreshedSession: PersistedPosSession = {
        token: session.token,
        businessId: session.businessId,
        employeeId: session.employeeId,
        email: session.email,
      };

      persistPosSession(refreshedSession);
      await onRefreshed(refreshedSession);
      setPassword("");
    } catch (cause) {
      const failure = processLoginFailure(cause);
      setSessionLimit(failure.sessionLimit);
      setError(
        failure.error ??
          failure.sessionLimit?.error ??
          "No se pudo renovar la sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseOtherSessions = async () => {
    if (!sessionLimit) return;

    setClosingSessions(true);
    setError(null);
    setNotice(null);

    try {
      await authPage.closeOtherSessions(sessionLimit);
      setSessionLimit(null);
      setNotice(
        "Se cerraron las otras sesiones. Escribe nuevamente tu contraseña para continuar.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cerrar las sesiones activas.",
      );
    } finally {
      setClosingSessions(false);
    }
  };

  return (
    <div
      className="catalog-ai-auth__backdrop"
      role="presentation"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <section
        className="catalog-ai-auth__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-ai-auth-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="catalog-ai-auth__eyebrow">Sesión expirada</span>
        <h3 id="catalog-ai-auth-title">Vuelve a iniciar sesión</h3>
        <p>
          Por seguridad, tu sesión terminó. Inicia sesión nuevamente para
          continuar exactamente donde estabas. Tus fotos y avances se
          conservarán.
        </p>

        <form className="catalog-ai-auth__form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              required
              autoFocus
            />
          </label>

          {notice ? (
            <p className="catalog-ai-auth__notice" role="status">
              {notice}
            </p>
          ) : null}

          {error ? (
            <p className="catalog-ai-auth__error" role="alert">
              {error}
            </p>
          ) : null}

          {sessionLimit ? (
            <button
              type="button"
              className="catalog-ai-auth__session-button"
              onClick={() => void handleCloseOtherSessions()}
              disabled={closingSessions}
            >
              {closingSessions
                ? "Cerrando sesiones…"
                : "Cerrar otras sesiones"}
            </button>
          ) : null}

          <div className="catalog-ai-auth__actions">
            <button
              type="button"
              className="is-secondary"
              onClick={onContinueLater}
              disabled={submitting || closingSessions}
            >
              Continuar después
            </button>
            <button
              type="submit"
              className="is-primary"
              disabled={submitting || closingSessions}
            >
              {submitting
                ? "Renovando sesión…"
                : "Iniciar sesión y continuar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
