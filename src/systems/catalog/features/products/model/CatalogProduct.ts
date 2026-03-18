export interface CatalogProduct {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
}

export interface LegacyCatalogProductDto {
  Id: number;
  Name: string;
  SalePrice?: number;
  Photo?: string;
  Stock?: number | null;
}

export const mapLegacyCatalogProduct = (
  dto: LegacyCatalogProductDto,
): CatalogProduct => ({
  id: dto.Id,
  title: dto.Name,
  price: dto.SalePrice ?? 0,
  imageUrl: dto.Photo,
  inStock: dto.Stock === null ? true : (dto.Stock ?? 0) > 0,
});
