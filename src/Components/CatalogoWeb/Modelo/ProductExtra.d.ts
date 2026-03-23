export type ProductExtra = {
  Id: number;
  Product_Id: number;
  Description: string;
  Type: "COLOR" | "TALLA" | string;
};

export type ProductExtrasResponse = {
  COLOR?: ProductExtra[];
  TALLA?: ProductExtra[];
} | null;
