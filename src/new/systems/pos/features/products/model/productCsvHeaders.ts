const aliases: Record<string, string> = {
  nombre: 'Name', precio: 'Price', 'código de barras': 'Barcode', 'codigo de barras': 'Barcode',
  existencias: 'Stock', costo: 'CostPerItem', categoría: 'Category', categoria: 'Category',
  subcategoría: 'Subcategory', subcategoria: 'Subcategory', descripción: 'Description', descripcion: 'Description',
  imagen: 'Image', 'imagen (url)': 'Image', color: 'Color', volumen: 'Volume',
  'en venta': 'ForSale', 'mostrar en tienda': 'ShowInStore', disponible: 'Available',
  'precio de promoción': 'PromotionPrice', 'fecha de caducidad': 'ExpDate',
  'existencias mínimas': 'MinStock', 'existencias óptimas': 'OptStock',
};

export function productCsvHeaders(values: string[]): string[] {
  const headers = values.map(value => {
    const header = value.trim();
    const key = header.toLowerCase();
    return Object.prototype.hasOwnProperty.call(aliases, key) ? aliases[key] : header;
  });
  if (!headers.includes('Name')) throw new Error('Incluye la columna Nombre.');
  if (headers.some(header => !header) || new Set(headers).size !== headers.length) {
    throw new Error('Los encabezados no deben estar vacíos ni repetidos.');
  }
  return headers;
}
