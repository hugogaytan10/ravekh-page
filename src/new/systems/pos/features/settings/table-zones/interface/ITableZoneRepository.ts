import { TableZone, UpsertTableZoneDto } from "../model/TableZone";

export interface ITableZoneRepository {
  listByBusiness(businessId: number, token: string): Promise<TableZone[]>;
  create(payload: UpsertTableZoneDto, token: string): Promise<TableZone>;
  update(tableZoneId: number, payload: UpsertTableZoneDto, token: string): Promise<TableZone>;
  setActivationByBusiness(businessId: number, isActive: boolean, token: string): Promise<boolean>;
}
