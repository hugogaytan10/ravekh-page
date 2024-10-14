export type Producto = {
    Barcode: string;
    Business_Id: number;
    Category_Id: number;
    Color: string;
    Description: string;
    ExpDate: string | null;
    ForSale: number;
    Id: number;
    Image: string;
    MinStock: number | null;
    Name: string;
    OptStock: number | null;
    Price: number;
    PromotionPrice: number;
    ShowInStore: number;
    Stock: number;
    Volume: number;
    PhoneNumber?: string;
    Quantity?: number;
}
