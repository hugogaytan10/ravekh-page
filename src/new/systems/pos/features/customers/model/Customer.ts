export type CustomerSex = "M" | "F" | "O";

export class Customer {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly name: string,
    public readonly phoneNumber: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly notes: string | null,
    public readonly canPayLater: boolean,
    public readonly sex: CustomerSex,
  ) {}

  matches(term: string): boolean {
    const query = term.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [this.name, this.phoneNumber ?? "", this.email ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  }
}

export interface UpsertCustomerDto {
  businessId: number;
  name: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  canPayLater?: boolean;
  sex?: CustomerSex;
}


export type CustomerSalesPeriod = "DAY" | "MONTH" | "YEAR";

export class CustomerSale {
  constructor(
    public readonly orderId: number,
    public readonly date: string,
    public readonly total: number,
    public readonly status: string,
  ) {}
}
