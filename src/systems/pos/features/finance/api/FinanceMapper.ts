import type { FinanceRecord, FinanceRecordType } from "../models/FinanceRecord";

export class FinanceMapper {
  static fromLegacy(payload: Record<string, unknown>, type: FinanceRecordType): FinanceRecord {
    return {
      id: Number(payload.Id ?? payload.id ?? 0) || undefined,
      businessId: Number(payload.Business_Id ?? payload.businessId ?? 0),
      name: String(payload.Name ?? payload.name ?? ""),
      amount: Number(payload.Amount ?? payload.amount ?? 0),
      type,
      createdAt: (payload.CreatedAt as string | undefined) ?? (payload.createdAt as string | undefined),
    };
  }

  static toLegacy(record: FinanceRecord): Record<string, unknown> {
    return {
      Business_Id: record.businessId,
      Name: record.name.trim().toUpperCase(),
      Amount: Number(record.amount),
    };
  }
}
