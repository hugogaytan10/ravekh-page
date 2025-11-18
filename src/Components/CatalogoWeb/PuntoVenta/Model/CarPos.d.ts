export type CartPos = {
    Id?: number;
    Store_Id?: number;
    Name: string;
    Category_Id?: string;
    Price: number;
    Image: string;
    Stock?: number;
    Cost?: number;
    Unit? : string;
    IsLabeled?: boolean;
    Volume?: boolean;
    PromotionPrice?: number;
    Barcode?: string;
    Quantity: number;
    SubTotal: number;
    Variant_Id?: number | null;
}