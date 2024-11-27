export interface IOrderCatalog {
    Id?: number;
    Name: string;
    Address: string;
    Delivery?: number;
    PaymentMethod?: string;
    PhoneNumber: string;
    Business_Id?: number;
    Status?: string;
}

export interface IOrderCatalogDetails {
    Id?: number;
    OrderCatalog_Id?: number;
    Product_Id?: number;
    Quantity: number;
}