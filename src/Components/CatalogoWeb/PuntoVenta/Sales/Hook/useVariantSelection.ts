import { useCallback, useContext, useMemo, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { Item } from '../../Model/Item';
import { Variant } from '../../Model/Variant';
import { CartPos } from '../../Model/CarPos';
import { getExtrasByProductId, getVariantsByProductId, ProductExtrasByType } from '../../Products/Petitions';
import { VariantModalState, VariantOption } from '../variantTypes';

const BASE_VARIANT_INTERNAL_ID = 0;

const buildVariantOptions = (product: Item, variants: Variant[]): VariantOption[] => {
  const baseOption: VariantOption = {
    __internalId: BASE_VARIANT_INTERNAL_ID,
    Id: BASE_VARIANT_INTERNAL_ID,
    Product_Id: product.Id,
    Description: 'Producto base',
    Barcode: product.Barcode ?? null,
    Color: product.Color ?? null,
    Price: product.Price ?? null,
    PromotionPrice: product.PromotionPrice ?? null,
    CostPerItem: product.CostPerItem ?? null,
    Stock: product.Stock ?? null,
    ExpDate: product.ExpDate ?? null,
    MinStock: product.MinStock ?? null,
    OptStock: product.OptStock ?? null,
  };

  const variantOptions = variants.map((variant, index) => ({
    ...variant,
    __internalId: variant.Id ?? -(index + 1),
  }));

  return [baseOption, ...variantOptions];
};

type UseVariantSelectionOptions = {
  onProductTap?: (product: Item) => void;
  onCartUpdated?: () => void;
};

export const useVariantSelection = ({
  onProductTap,
  onCartUpdated,
}: UseVariantSelectionOptions = {}) => {
  const context = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Item | null>(null);
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<number>>(new Set());
  const [selectedVariantQuantities, setSelectedVariantQuantities] = useState<Map<number, number>>(
    () => new Map(),
  );
  const [extras, setExtras] = useState<ProductExtrasByType>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);

  const addItemToCart = useCallback(
    (product: Item, variant?: Variant, quantityOverride?: number) => {
      if (!product?.Id) {
        return;
      }

      const priceCandidate = variant
        ? variant.PromotionPrice ?? variant.Price ?? product.Price ?? 0
        : product.PromotionPrice && product.PromotionPrice > 0
        ? product.PromotionPrice
        : product.Price ?? 0;

      const resolvedPrice = Number((priceCandidate ?? 0).toFixed(2));
      const rawQuantity = Number(quantityOverride ?? context.quantityNextSell);
      const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
      const productImage = product.Images?.[0] ?? '';
      const variantId = variant?.Id ?? null;
      const isBaseProduct = variant == null || variant.Id === BASE_VARIANT_INTERNAL_ID;
      const selectedColor = isBaseProduct
        ? extras?.COLOR?.find((option) => option.Id === selectedColorId) ?? null
        : null;
      const selectedSize = isBaseProduct
        ? extras?.TALLA?.find((option) => option.Id === selectedSizeId) ?? null
        : null;
      const colorId = selectedColor?.Id ?? null;
      const sizeId = selectedSize?.Id ?? null;

      context.setCart((prevCart: CartPos[]) => {
        const cartIndex = prevCart.findIndex(
          (item: CartPos) =>
            item.Id === product.Id &&
            (item.Variant_Id ?? null) === (variantId ?? null) &&
            (item.Color_Id ?? null) === colorId &&
            (item.Size_Id ?? null) === sizeId,
        );

        if (cartIndex !== -1) {
          const updatedCart = [...prevCart];
          const existingItem = updatedCart[cartIndex];
          const newQuantity = existingItem.Quantity + quantity;
          updatedCart[cartIndex] = {
            ...existingItem,
            Quantity: newQuantity,
            SubTotal: Number((resolvedPrice * newQuantity).toFixed(2)),
          };
          return updatedCart;
        }

        return [
          ...prevCart,
          {
            Id: product.Id,
            Name: variant?.Description && variant.Id !== BASE_VARIANT_INTERNAL_ID
              ? `${product.Name} - ${variant.Description}`
              : product.Name,
            Price: resolvedPrice,
            Barcode: variant?.Barcode ?? product.Barcode ?? undefined,
            Quantity: quantity,
            SubTotal: Number((resolvedPrice * quantity).toFixed(2)),
            Image: productImage,
            Cost: Number(
              (variant?.CostPerItem ?? product.CostPerItem ?? 0).toFixed(2),
            ),
            Variant_Id: variantId,
            Color_Id: colorId,
            Size_Id: sizeId,
            ColorDescription: selectedColor?.Description,
            SizeDescription: selectedSize?.Description,
          },
        ];
      });

      onCartUpdated?.();
    },
    [context.quantityNextSell, extras, onCartUpdated, selectedColorId, selectedSizeId],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedVariantIds(new Set());
    setSelectedVariantQuantities(new Map());
    setExtras(null);
    setSelectedColorId(null);
    setSelectedSizeId(null);
  }, []);

  const openSelectionModal = useCallback(
    (product: Item, variants: Variant[], productExtras: ProductExtrasByType) => {
      const hasOnlyBaseProduct = variants.length === 0;
      const defaultQuantity = Math.max(1, Number(context.quantityNextSell) || 1);
      setVariantOptions(buildVariantOptions(product, variants));
      setCurrentProduct(product);
      setSelectedVariantIds(
        hasOnlyBaseProduct ? new Set([BASE_VARIANT_INTERNAL_ID]) : new Set(),
      );
      setSelectedVariantQuantities(
        hasOnlyBaseProduct
          ? new Map([[BASE_VARIANT_INTERNAL_ID, defaultQuantity]])
          : new Map(),
      );
      setExtras(productExtras);
      setSelectedColorId(null);
      setSelectedSizeId(null);
      setModalVisible(true);
    },
    [context.quantityNextSell],
  );

  const handleProductSelection = useCallback(
    async (product: Item) => {
      onProductTap?.(product);

      if (!product.Id) {
        addItemToCart(product);
        return;
      }

      const inlineVariants = Array.isArray(product.Variants) ? product.Variants : [];

      setIsFetchingVariants(true);
      try {
        const [resolvedVariants, fetchedExtras] = await Promise.all([
          inlineVariants.length > 0
            ? Promise.resolve(inlineVariants)
            : getVariantsByProductId(product.Id, context.user.Token),
          getExtrasByProductId(product.Id, context.user.Token),
        ]);

        const hasVariants = Array.isArray(resolvedVariants) && resolvedVariants.length > 0;
        const hasExtras = Boolean(fetchedExtras);

        if (hasVariants || hasExtras) {
          openSelectionModal(product, hasVariants ? resolvedVariants : [], fetchedExtras);
        } else {
          addItemToCart(product);
        }
      } catch (error) {
        addItemToCart(product);
      } finally {
        setIsFetchingVariants(false);
      }
    },
    [addItemToCart, context.user.Token, onProductTap, openSelectionModal],
  );

  const toggleVariantSelection = useCallback(
    (variantInternalId: number) => {
      setSelectedVariantIds(prev => {
        const next = new Set(prev);
        if (next.has(variantInternalId)) {
          next.delete(variantInternalId);
        } else {
          next.add(variantInternalId);
        }
        return next;
      });

      setSelectedVariantQuantities(prev => {
        const next = new Map(prev);
        if (next.has(variantInternalId)) {
          next.delete(variantInternalId);
        } else {
          const baseQuantity = Math.max(1, Number(context.quantityNextSell) || 1);
          next.set(variantInternalId, baseQuantity);
        }
        return next;
      });
    },
    [context.quantityNextSell],
  );

  const adjustVariantQuantity = useCallback((variantInternalId: number, delta: number) => {
    setSelectedVariantQuantities(prev => {
      if (!prev.has(variantInternalId)) {
        return prev;
      }
      const next = new Map(prev);
      const current = next.get(variantInternalId) ?? 1;
      const updated = Math.max(1, current + delta);
      next.set(variantInternalId, updated);
      return next;
    });
  }, []);

  const canConfirm = useMemo(() => {
    if (selectedVariantIds.size === 0) return false;

    if (!selectedVariantIds.has(BASE_VARIANT_INTERNAL_ID)) {
      return true;
    }

    const requiresColor = (extras?.COLOR?.length ?? 0) > 0;
    const requiresSize = (extras?.TALLA?.length ?? 0) > 0;

    return (!requiresColor || selectedColorId != null) && (!requiresSize || selectedSizeId != null);
  }, [selectedVariantIds, extras, selectedColorId, selectedSizeId]);

  const confirmSelection = useCallback(() => {
    if (!currentProduct || !canConfirm) {
      return;
    }

    const selectedOptions = variantOptions.filter(variant =>
      selectedVariantIds.has(variant.__internalId),
    );

    if (selectedOptions.length === 0) {
      return;
    }

    selectedOptions.forEach(option => {
      if (option.__internalId === BASE_VARIANT_INTERNAL_ID) {
        addItemToCart(
          currentProduct,
          undefined,
          selectedVariantQuantities.get(option.__internalId),
        );
        return;
      }

      addItemToCart(
        currentProduct,
        option,
        selectedVariantQuantities.get(option.__internalId),
      );
    });

    closeModal();
  }, [
    addItemToCart,
    canConfirm,
    closeModal,
    currentProduct,
    selectedVariantIds,
    selectedVariantQuantities,
    variantOptions,
  ]);

  const modalState: VariantModalState = useMemo(
    () => ({
      visible: modalVisible,
      product: currentProduct,
      variants: variantOptions,
      selectedVariantIds,
      selectedVariantQuantities,
      extras,
      selectedColorId,
      selectedSizeId,
      selectColor: setSelectedColorId,
      selectSize: setSelectedSizeId,
      canConfirm,
      toggleVariantSelection,
      adjustVariantQuantity,
      confirmSelection,
      closeModal,
    }),
    [
      modalVisible,
      currentProduct,
      variantOptions,
      selectedVariantIds,
      selectedVariantQuantities,
      extras,
      selectedColorId,
      selectedSizeId,
      canConfirm,
      toggleVariantSelection,
      adjustVariantQuantity,
      confirmSelection,
      closeModal,
    ],
  );

  return {
    handleProductSelection,
    modalState,
    isFetchingVariants,
  };
};
