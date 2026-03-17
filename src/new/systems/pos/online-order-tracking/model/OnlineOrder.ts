export class OnlineOrder {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly status: string,
    public readonly customerName: string,
    public readonly total: number,
  ) {}

  isPending(): boolean {
    return this.status.toLowerCase() === "pending";
  }
}

export interface UpdateOnlineOrderStatusDto {
  status: "pending" | "accepted" | "preparing" | "completed" | "cancelled";
}
