import { useMemo } from 'react';

export const usePosReportsFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
