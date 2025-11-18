export type Item = {
    Id?: number;
    Barcode?: string | null;
    Business_Id: number;
    Category_Id?: number | null;
    Name: string;
    Color?: string | null;
    Price?: number | null;
    CostPerItem?: number | null;
    Stock?: number | null;
    Description: string;
    Volume: boolean;
    ForSale: boolean;
    ShowInStore: boolean;
    Available: boolean;
    Images?: string[];
    Image?: string;
    PromotionPrice?: number | null;
    ExpDate?: string | null;
    MinStock?: number | null;
    OptStock?: number | null;
    Quantity?: number | null;
    Category_Name?: string;
    Variants?: import('./Variant').Variant[];
}