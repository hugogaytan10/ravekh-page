import { useCallback } from "react";
import {
  POS_USER_STORAGE_KEY,
  PosSessionCredentials,
} from "../model/posAuthModels";

export const usePosSession = () => {
  const saveSession = useCallback((credentials: PosSessionCredentials) => {
    localStorage.setItem(POS_USER_STORAGE_KEY, JSON.stringify(credentials));
  }, []);

  const getSession = useCallback((): PosSessionCredentials | null => {
    const rawSession = localStorage.getItem(POS_USER_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession);
    } catch {
      return null;
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(POS_USER_STORAGE_KEY);
  }, []);

  return {
    saveSession,
    getSession,
    clearSession,
  };
};
