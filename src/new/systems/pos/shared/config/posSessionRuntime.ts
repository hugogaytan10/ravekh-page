import {
  clearPendingPosUpgradeContext,
  POS_SESSION_STORAGE_KEYS,
} from "./posSession";

export type PersistedPosSession = {
  token: string;
  businessId: number;
  employeeId: number;
  email: string;
};

export const POS_SESSION_UPDATED_EVENT = "ravekh:pos-session-updated";

export const persistPosSession = (session: PersistedPosSession): void => {
  clearPendingPosUpgradeContext();

  window.localStorage.setItem(
    POS_SESSION_STORAGE_KEYS.token,
    session.token,
  );
  window.localStorage.setItem(
    POS_SESSION_STORAGE_KEYS.businessId,
    String(session.businessId),
  );
  window.localStorage.setItem(
    POS_SESSION_STORAGE_KEYS.employeeId,
    String(session.employeeId),
  );
  window.localStorage.setItem(
    POS_SESSION_STORAGE_KEYS.email,
    session.email,
  );

  window.dispatchEvent(
    new CustomEvent<PersistedPosSession>(POS_SESSION_UPDATED_EVENT, {
      detail: session,
    }),
  );
};
