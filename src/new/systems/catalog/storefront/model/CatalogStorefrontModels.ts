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
  forSale?: boolean;
  available?: boolean;
  showInStore?: boolean;
};

export type StorefrontBusiness = {
  id: number;
  name: string;
  phone: string | null;
  plan: string | null;
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
  price: number;
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
  }>;
};
