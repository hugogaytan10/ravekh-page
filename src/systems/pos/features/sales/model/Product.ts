export interface Product {
  id: number;
  name: string;
  salePrice: number;
  stock: number | null;
  sku?: string;
  barcode?: string;
}

export interface LegacyProductDto {
  Id: number;
  Name: string;
  SalePrice?: number;
  Stock?: number | null;
  Sku?: string;
  BarCode?: string;
}

export const mapLegacyProductDto = (dto: LegacyProductDto): Product => ({
  id: dto.Id,
  name: dto.Name,
  salePrice: dto.SalePrice ?? 0,
  stock: dto.Stock ?? null,
  sku: dto.Sku,
  barcode: dto.BarCode,
});
