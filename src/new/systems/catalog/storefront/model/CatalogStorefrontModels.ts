export type StorefrontWholesalePrice = {
  id?: number;
  productId?: number | null;
  variantId?: number | null;
  price: number;
  minQuantity: number;
};

export type StorefrontProduct = {
  id: number;
  businessId: number;
  categoryId?: number | null;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  promotionPrice?: number | null;
  /** Legacy fields kept while old records/front versions still exist. */
  wholesalePrice?: number | null;
  wholesaleMinQuantity?: number | null;
  /** Current source of truth for multiple wholesale tiers. */
  wholesalePrices?: StorefrontWholesalePrice[];
  variantsCount?: number;
  forSale?: boolean;
  available?: boolean;
  showInStore?: boolean;
  showPrice?: boolean;
};

export type StorefrontBusiness = {
  id: number;
  name: string;
  phone: string | null;
  plan: string | null;
  logo: string | null;
  catalogFeature: number | null;
};

export type StorefrontCartItem = {
  cartKey?: string;
  productId: number;
  variantId?: number;
  colorId?: number;
  sizeId?: number;
  colorName?: string;
  sizeName?: string;
  name: string;
  price?: number | null;
  promotionPrice?: number | null;
  /** Legacy fields for carts created before wholesale tiers existed. */
  wholesalePrice?: number | null;
  wholesaleMinQuantity?: number | null;
  wholesalePrices?: StorefrontWholesalePrice[];
  cost?: number;
  quantity: number;
  image: string;
};

export type CatalogOrderPayload = {
  Order: {
    Name: string;
    Business_Id: number;
    Delivery: number;
    PaymentMethod: string;
    Address: string;
    PhoneNumber: string;
  };
  OrderDetails: Array<{
    Quantity: number;
    Product_Id?: number;
    Variant_Id?: number;
    Color_Id?: number;
    Size_Id?: number;
    Price?: number;
    Cost?: number;
    WholesalePrice_Id?: number;
  }>;
};
