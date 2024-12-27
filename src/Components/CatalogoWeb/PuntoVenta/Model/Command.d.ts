export type ICommand = {
    Id?: number;
    Employee_Id: number;
    Customer_Id?: number;
    Table_Id: string;
    Date?: Date;
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

export type IcommandHasProduct = {
    Id?: number;
    Command_Id?: number;
    Variant_Id?: number;
    Product_Id?: number;
    Quantity: number;
    Notes?: string; 
    Price: number;
    Cost?: number;
    PriceTaxes?: number;
}