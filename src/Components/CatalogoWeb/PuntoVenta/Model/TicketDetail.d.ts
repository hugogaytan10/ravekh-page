export type TicketDetail = {
    discount: number;
    total: number;
    paymentMethod: string;
    payment: number;
    totalWithTaxes?: number;
}