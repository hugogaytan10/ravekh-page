export type Tax = {
    Id?: number;
    IsPercent: boolean;
    Description: string;
    Value: number;
    //AppliedInProduct: boolean;
    QuitInSale: boolean;
}