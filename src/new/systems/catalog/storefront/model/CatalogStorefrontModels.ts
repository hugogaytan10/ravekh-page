export type StorefrontProduct = {
  id: number;
  businessId: number;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  promotionPrice?: number | null;
  variantsCount?: number;
};

export type StorefrontBusiness = {
  id: number;
  name: string;
  phone: string | null;
  plan: string | null;
};

export type StorefrontCartItem = {
  productId: number;
  variantId?: number;
  name: string;
  price: number;
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
  }>;
};
