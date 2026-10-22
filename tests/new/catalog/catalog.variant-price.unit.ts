import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { selectVariantForColor } from "../../../src/new/systems/catalog/storefront/ui/catalogVariantSelection";
import { getEffectiveCatalogPriceForQuantity, normalizeWholesalePriceTiers } from "../../../src/new/systems/catalog/storefront/ui/catalogPrice";
const { transformSync } = createRequire(import.meta.url)("esbuild");

export async function run() {
  const variant = {id: 5828, description: "Dorado", color: "", price: 300, promotionPrice: null, stock: 0, image: "", wholesalePrice: null, wholesaleMinQuantity: null, wholesalePrices: [], costPerItem: null};
  const color = {id: 3745, productId: 5810, description: "Dorado", type: "COLOR"};
  const selectedVariantId = selectVariantForColor([variant], color, null);
  assert.equal(selectedVariantId, variant.id, "A unique color selects its priced variant");
  assert.equal(selectVariantForColor([variant, {...variant, id: 99}], color, null), null, "Ambiguous colors require explicit variant selection");
  assert.equal(selectVariantForColor([], color, null), null, "An extra alone does not invent a variant");
  const source = readFileSync("src/new/systems/catalog/storefront/ui/CatalogProductDetailPage.tsx", "utf8");
  const start = source.indexOf("  const buildCartWithSelection = () => {");
  const end = source.indexOf("\n  };", start) + 5;
  const code = transformSync(source.slice(start, end), {loader: "ts"}).code;
  let saved = "";
  const runtime = {
    product: {id: 5810, businessId: 177, name: "Aretes", price: 250, promotionPrice: null, wholesalePrices: [{price: 200, minQuantity: 2}]},
    variants: [variant], colors: [color], sizes: [], selectedVariantId, selectedColorId: color.id, selectedSizeId: null, quantity: 2,
    normalizeWholesalePriceTiers, branchContext: {branchSlug: null}, getCatalogCartKey: () => "cart",
    window: {localStorage: {getItem: () => null, setItem: (_key: string, value: string) => {saved = value;}}},
  };
  new Function(...Object.keys(runtime), code + "; return buildCartWithSelection();")(...Object.values(runtime));
  const cart = JSON.parse(saved);
  assert.equal(cart[0].variantId, 5828);
  assert.equal(cart[0].price, 300);
  assert.deepEqual(cart[0].wholesalePrices, [], "Variant cannot inherit the base product wholesale price");
  assert.equal(getEffectiveCatalogPriceForQuantity(cart[0].price, cart[0].promotionPrice, cart[0].wholesalePrices, 2), 300);
  const orderSource = readFileSync("src/new/systems/catalog/storefront/ui/CatalogOrderInfoPage.tsx", "utf8");
  const payloadStart = orderSource.indexOf("      const orderPayload = {");
  const payloadEnd = orderSource.indexOf("\n      if (paymentMethod", payloadStart);
  const payloadCode = transformSync(orderSource.slice(payloadStart, payloadEnd), {loader: "ts"}).code;
  const payloadRuntime = {cart, businessId: 177, checkoutOptions: {}, deliveryMethod: "recoger", paymentMethod: "efectivo", buildAddress: () => "", resolveCartPricing: (item: typeof cart[number]) => ({unitPrice: getEffectiveCatalogPriceForQuantity(item.price, item.promotionPrice, item.wholesalePrices, item.quantity), appliedWholesaleTier: null})};
  const payload = new Function(...Object.keys(payloadRuntime), payloadCode + "; return orderPayload;")(...Object.values(payloadRuntime));
  assert.equal(payload.OrderDetails[0].Variant_Id, 5828);
  assert.equal(payload.OrderDetails[0].Price, 300);
  assert.equal(payload.OrderDetails[0].Quantity, 2);
  assert.equal(payload.OrderDetails[0].Product_Id, undefined);
  assert.equal(getEffectiveCatalogPriceForQuantity(300, 280, [], 1), 280);
  assert.equal(getEffectiveCatalogPriceForQuantity(300, null, [{price: 270, minQuantity: 2}], 2), 270);
}
