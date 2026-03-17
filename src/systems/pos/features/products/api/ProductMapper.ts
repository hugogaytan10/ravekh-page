import type { Product } from "../models/Product";

type LegacyProduct = {
  Id?: number;
  Business_Id: number;
  Category_Id?: number | null;
  Name: string;
  Description: string;
  ForSale: boolean;
  ShowInStore: boolean;
  Available: boolean;
  Image?: string;
  Images?: string[];
  Barcode?: string | null;
  Price?: number | null;
  CostPerItem?: number | null;
  Stock?: number | null;
};

export class ProductMapper {
  static fromLegacy(legacy: LegacyProduct): Product {
    return {
      id: legacy.Id,
      businessId: legacy.Business_Id,
      categoryId: legacy.Category_Id,
      name: legacy.Name,
      description: legacy.Description,
      forSale: legacy.ForSale,
      showInStore: legacy.ShowInStore,
      available: legacy.Available,
      image: legacy.Image || legacy.Images?.[0],
      images: legacy.Images,
      barcode: legacy.Barcode,
      price: legacy.Price,
      costPerItem: legacy.CostPerItem,
      stock: legacy.Stock,
    };
  }

  static toLegacy(product: Product): LegacyProduct {
    return {
      Id: product.id,
      Business_Id: product.businessId,
      Category_Id: product.categoryId,
      Name: product.name,
      Description: product.description,
      ForSale: product.forSale,
      ShowInStore: product.showInStore,
      Available: product.available,
      Image: product.image,
      Images: product.images,
      Barcode: product.barcode,
      Price: product.price,
      CostPerItem: product.costPerItem,
      Stock: product.stock,
    };
  }
}
