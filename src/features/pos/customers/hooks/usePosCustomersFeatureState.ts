import { useMemo } from 'react';

export const usePosCustomersFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
