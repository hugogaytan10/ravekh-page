import type { Result } from "../../../../shared/models/Result";
import type { FinanceOverview, FinanceRecord, FinanceRecordType } from "../models/FinanceRecord";

export interface FinanceGateway {
  listByMonth(token: string, businessId: string, type: FinanceRecordType, month: number): Promise<FinanceRecord[]>;
  listToday(token: string, businessId: string, type: FinanceRecordType): Promise<FinanceRecord[]>;
  create(token: string, record: FinanceRecord): Promise<Result<FinanceRecord>>;
}

export interface FinanceUseCases {
  getOverviewByMonth(token: string, businessId: string, month: number): Promise<Result<FinanceOverview>>;
  getOverviewToday(token: string, businessId: string): Promise<Result<FinanceOverview>>;
  createRecord(token: string, record: FinanceRecord): Promise<Result<FinanceRecord>>;
}
