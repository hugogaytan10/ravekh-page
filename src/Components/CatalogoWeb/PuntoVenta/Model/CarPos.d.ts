export type CartPos = {
    Id?: number;
    Store_Id?: number;
    Business_Id?: number;
    Name: string;
    Category_Id?: string | number;
    Price: number;
    Image: string;
    Images?: string[];
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
    VariantDescription?: string;
}
