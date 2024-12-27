export type Item = {
    Id?: number;
    Business_Id?: number;
    Name: string;
    Category_Id?: string | null;
    Price: number | null;
    CostPerItem?: number | null;
    Image: string;
    Stock?: number | null;
    IsLabeled?: boolean;
    Volume?: boolean;
    PromotionPrice?: number | null;
    Barcode?: string | null;
    ForSale?: boolean;
    ShowInStore?: boolean;
    Description?: string;
    Color?: string;
    MinStock?: number | null;
    OptStock?: number | null;
    ExpDate?: string | null;
}