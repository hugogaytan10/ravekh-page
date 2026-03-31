export type StorefrontProduct = {
  id: number;
  businessId: number;
  name: string;
  description: string;
  image: string;
  price: number;
  promotionPrice?: number | null;
  variantsCount?: number;
};

export type StorefrontBusiness = {
  id: number;
  name: string;
  phone: string | null;
};

export type StorefrontCartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};
