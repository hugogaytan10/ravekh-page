import { useMemo } from 'react';

export const usePosProductsFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
