export type OnlineOrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  itemType?: string;
};

export class OnlineOrder {
  constructor(
    public readonly id: number,
    public readonly businessId: number,
    public readonly status: string,
    public readonly customerName: string,
    public readonly total: number,
    public readonly address: string = "",
    public readonly paymentMethod: string = "",
    public readonly phoneNumber: string = "",
    public readonly items: OnlineOrderItem[] = [],
  ) {}

  isPending(): boolean {
    const normalized = this.status.trim().toLowerCase();
    return normalized === "pending" || normalized === "pedido";
  }
}

export interface UpdateOnlineOrderStatusDto {
  status: "ENTREGADO" | "CANCELADO" | "PEDIDO" | "pending" | "accepted" | "preparing" | "completed" | "cancelled";
}
