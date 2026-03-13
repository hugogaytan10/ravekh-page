import { useMemo } from 'react';

export const usePosEmployeesFeatureState = () => {
  return useMemo(() => ({ ready: true }), []);
};
