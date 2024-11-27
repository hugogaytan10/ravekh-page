export type Order = {
    Id?: number;
    Employee_Id: number;
    Customer_Id?: number;
    Note?: string;
    Date?: string;
    Address?: string;
    Delivery?: number;
    Status?: string;
    Total?: number;
    PaymentMethod?: string;
    Discount?: number;
    Tax?: boolean;
    TaxValue?: number;
    AppliedInProduct?: boolean;
    IsPercent?: boolean;
    TotalTaxes?: number;
    TotalDiscount?: number;
}