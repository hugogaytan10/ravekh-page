import { useMemo } from 'react';

export const usePosDashboardFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
