// utils/payload.ts
import { uploadImage } from "../../Cloudinary/Cloudinary";
import { Item } from "../../Model/Item";
import { Category } from "../../Model/Category";

export const isDataUrl = (s?: string | null) => !!s && s.startsWith("data:");
export const toNullableFloat = (s: string) => (s === "" ? null : Number.parseFloat(s));
export const toNullableInt = (s: string) => (s === "" ? null : Number.parseInt(s, 10));

export async function uploadIfNeeded(image: string | null): Promise<string | null> {
  if (!image) return null;                 // borrar imagen
  if (isDataUrl(image)) return await uploadImage(image); // convertir base64 -> URL
  return image;                            // ya es URL, conservar
}

type BuildArgs = {
  businessId?: number | null;
  productId?: number;
  productName: string;
  price: string;
  cost: string;
  stock: string;
  barcode: string;
  promoPrice: string;
  description: string;
  colorSelected: string;
  isAvailableForSale: boolean;
  isDisplayedInStore: boolean;
  categorySelected: Category;
  minStock: string;
  optStock: string;
  imageUrl: string | null;
};

export function buildProductPayload(a: BuildArgs): Item {
  return {
    Id: a.productId,
    Business_Id: a.businessId ?? undefined,
    Name: a.productName.trim(),
    Price: toNullableFloat(a.price),
    CostPerItem: toNullableFloat(a.cost),
    Stock: toNullableFloat(a.stock),
    Barcode: a.barcode.trim() || null,
    PromotionPrice: toNullableFloat(a.promoPrice),
    Description: a.description.trim(),
    Color: a.colorSelected,
    ForSale: !!a.isAvailableForSale,        // siempre boolean
    ShowInStore: !!a.isDisplayedInStore,    // siempre boolean
    Category_Id: a.categorySelected?.Id?.toString() || null, // string o null
    MinStock: toNullableInt(a.minStock),
    OptStock: toNullableInt(a.optStock),
    Image: a.imageUrl ?? '',                // URL o empty string
  };
}
