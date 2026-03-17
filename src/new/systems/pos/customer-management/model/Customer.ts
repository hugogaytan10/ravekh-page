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
}
