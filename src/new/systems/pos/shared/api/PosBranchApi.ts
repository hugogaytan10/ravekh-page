import { HttpClient } from "../../../../core/api/HttpClient";
import { PosBranch } from "../config/posBranch";

export type CreatePosBranchInput = {
  name: string;
  code: string;
  slug: string;
  phoneNumber?: string | null;
  whatsApp?: string | null;
  address?: string | null;
  references?: string | null;
  catalogEnabled?: boolean;
  copyCatalogFromBranchId?: number | null;
};

export type UpdatePosBranchInput = Partial<Omit<CreatePosBranchInput, "copyCatalogFromBranchId">> & {
  active?: boolean;
};

export type PosBranchEmployee = {
  employeeId: number;
  name: string;
  email: string;
  baseRole: string;
  roleOverride: string | null;
  effectiveRole: string;
  isPrimary: boolean;
  active: boolean;
};

type BranchResponse = {
  Id?: number;
  Business_Id?: number;
  Name?: string;
  Code?: string;
  Slug?: string;
  PhoneNumber?: string | null;
  WhatsApp?: string | null;
  Address?: string | null;
  References?: string | null;
  Is_Main?: boolean | number | string;
  Catalog_Enabled?: boolean | number | string;
  Active?: boolean | number | string;
};

type BranchEmployeeResponse = {
  Employee_Id?: number;
  Name?: string;
  Email?: string;
  Base_Role?: string;
  Role_Override?: string | null;
  Effective_Role?: string;
  Is_Primary?: boolean | number | string;
  Active?: boolean | number | string;
};

type ApiWrapper<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

const toBoolean = (value: unknown): boolean =>
  value === true || value === 1 || value === "1" || String(value ?? "").toLowerCase() === "true";

export class PosBranchApi {
  constructor(private readonly httpClient: HttpClient) {}

  async list(token: string): Promise<PosBranch[]> {
    const response = await this.httpClient.request<ApiWrapper<BranchResponse[]> | BranchResponse[]>({
      method: "GET",
      path: "branches",
      token,
      skipBranchHeader: true,
    });

    const rows = Array.isArray(response) ? response : response.data ?? [];
    return rows.map((row) => this.toDomain(row)).filter((branch) => branch.id > 0 && branch.active);
  }

  async get(branchId: number, token: string): Promise<PosBranch> {
    const response = await this.httpClient.request<ApiWrapper<BranchResponse> | BranchResponse>({
      method: "GET",
      path: `branches/${branchId}`,
      token,
      skipBranchHeader: true,
    });
    return this.toDomain("data" in response ? response.data ?? {} : response);
  }

  async create(input: CreatePosBranchInput, token: string): Promise<PosBranch> {
    const response = await this.httpClient.request<ApiWrapper<BranchResponse>>({
      method: "POST",
      path: "branches",
      token,
      skipBranchHeader: true,
      body: {
        name: input.name,
        code: input.code,
        slug: input.slug,
        phoneNumber: input.phoneNumber ?? null,
        whatsapp: input.whatsApp ?? null,
        address: input.address ?? null,
        references: input.references ?? null,
        catalogEnabled: input.catalogEnabled ?? true,
        copyCatalogFromBranchId: input.copyCatalogFromBranchId ?? null,
      },
    });
    return this.toDomain(response.data ?? {});
  }

  async update(branchId: number, input: UpdatePosBranchInput, token: string): Promise<PosBranch> {
    const response = await this.httpClient.request<ApiWrapper<BranchResponse>>({
      method: "PATCH",
      path: `branches/${branchId}`,
      token,
      skipBranchHeader: true,
      body: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber } : {}),
        ...(input.whatsApp !== undefined ? { whatsapp: input.whatsApp } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.references !== undefined ? { references: input.references } : {}),
        ...(input.catalogEnabled !== undefined ? { catalogEnabled: input.catalogEnabled } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      },
    });
    return this.toDomain(response.data ?? {});
  }

  async listEmployees(branchId: number, token: string): Promise<PosBranchEmployee[]> {
    const response = await this.httpClient.request<ApiWrapper<BranchEmployeeResponse[]> | BranchEmployeeResponse[]>({
      method: "GET",
      path: `branches/${branchId}/employees`,
      token,
      skipBranchHeader: true,
    });
    const rows = Array.isArray(response) ? response : response.data ?? [];
    return rows.map((row) => ({
      employeeId: Number(row.Employee_Id ?? 0),
      name: String(row.Name ?? "").trim(),
      email: String(row.Email ?? "").trim(),
      baseRole: String(row.Base_Role ?? "").trim(),
      roleOverride: row.Role_Override ? String(row.Role_Override) : null,
      effectiveRole: String(row.Effective_Role ?? row.Base_Role ?? "").trim(),
      isPrimary: toBoolean(row.Is_Primary),
      active: toBoolean(row.Active),
    }));
  }

  async assignEmployee(
    branchId: number,
    employeeId: number,
    input: { roleOverride?: string | null; isPrimary?: boolean },
    token: string,
  ): Promise<void> {
    await this.httpClient.request<unknown>({
      method: "POST",
      path: `branches/${branchId}/employees/${employeeId}`,
      token,
      skipBranchHeader: true,
      body: {
        roleOverride: input.roleOverride ?? null,
        isPrimary: Boolean(input.isPrimary),
      },
    });
  }

  async removeEmployee(branchId: number, employeeId: number, token: string): Promise<void> {
    await this.httpClient.request<unknown>({
      method: "DELETE",
      path: `branches/${branchId}/employees/${employeeId}`,
      token,
      skipBranchHeader: true,
    });
  }

  private toDomain(row: BranchResponse): PosBranch {
    return {
      id: Number(row.Id ?? 0),
      businessId: Number(row.Business_Id ?? 0),
      name: String(row.Name ?? "Sucursal").trim(),
      code: String(row.Code ?? "").trim(),
      slug: String(row.Slug ?? "").trim(),
      phoneNumber: row.PhoneNumber ? String(row.PhoneNumber).trim() : null,
      whatsApp: row.WhatsApp ? String(row.WhatsApp).trim() : null,
      address: row.Address ? String(row.Address).trim() : null,
      references: row.References ? String(row.References).trim() : null,
      isMain: toBoolean(row.Is_Main),
      catalogEnabled: toBoolean(row.Catalog_Enabled),
      active: row.Active === undefined ? true : toBoolean(row.Active),
    };
  }
}
