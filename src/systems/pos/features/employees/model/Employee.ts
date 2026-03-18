export interface Employee {
  id: number;
  businessId: number;
  name: string;
  email: string;
  role?: string;
}

export interface EmployeeSearchFilters {
  query?: string;
  excludeIds?: number[];
}
