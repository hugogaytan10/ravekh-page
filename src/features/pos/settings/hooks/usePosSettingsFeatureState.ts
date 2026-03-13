import { useMemo } from 'react';

export const usePosSettingsFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
