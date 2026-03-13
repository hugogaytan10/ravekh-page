import { useMemo } from 'react';

export const usePosFinanceFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
