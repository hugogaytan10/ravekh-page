import { useCallback, useContext, useMemo, useState } from 'react';
import { AppContext } from '../../../Context/AppContext';
import { Item } from '../../Model/Item';
import { Variant } from '../../Model/Variant';
import { CartPos } from '../../Model/CarPos';
import { getVariantsByProductId } from '../../Products/Petitions';
import { VariantModalState, VariantOption } from '../variantTypes';

const buildVariantOptions = (variants: Variant[]): VariantOption[] =>
  variants.map((variant, index) => ({
    ...variant,
    __internalId: variant.Id ?? -(index + 1),
  }));

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

      context.setCart((prevCart: CartPos[]) => {
        const cartIndex = prevCart.findIndex(
          (item: CartPos) =>
            item.Id === product.Id &&
            (item.Variant_Id ?? null) === (variantId ?? null),
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
            Name: variant?.Description
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
          },
        ];
      });

      onCartUpdated?.();
    },
    [context.quantityNextSell, onCartUpdated],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedVariantIds(new Set());
    setSelectedVariantQuantities(new Map());
  }, []);

  const handleProductSelection = useCallback(
    async (product: Item) => {
      onProductTap?.(product);

      const inlineVariants = Array.isArray(product.Variants)
        ? product.Variants
        : [];

      if (inlineVariants.length > 0) {
        setVariantOptions(buildVariantOptions(inlineVariants));
        setCurrentProduct(product);
        setSelectedVariantIds(new Set());
        setSelectedVariantQuantities(new Map());
        setModalVisible(true);
        return;
      }

      if (!product.Id) {
        addItemToCart(product);
        return;
      }

      setIsFetchingVariants(true);
      try {
        const fetchedVariants = await getVariantsByProductId(
          product.Id,
          context.user.Token,
        );
        if (Array.isArray(fetchedVariants) && fetchedVariants.length > 0) {
          setVariantOptions(buildVariantOptions(fetchedVariants));
          setCurrentProduct(product);
          setSelectedVariantIds(new Set());
          setSelectedVariantQuantities(new Map());
          setModalVisible(true);
        } else {
          addItemToCart(product);
        }
      } catch (error) {
        addItemToCart(product);
      } finally {
        setIsFetchingVariants(false);
      }
    },
    [addItemToCart, context.user.Token, onProductTap],
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

  const confirmSelection = useCallback(() => {
    if (!currentProduct) {
      return;
    }
    const selectedVariants = variantOptions.filter(variant =>
      selectedVariantIds.has(variant.__internalId),
    );
    if (selectedVariants.length === 0) {
      return;
    }

    selectedVariants.forEach(variant =>
      addItemToCart(
        currentProduct,
        variant,
        selectedVariantQuantities.get(variant.__internalId),
      ),
    );
    closeModal();
  }, [
    addItemToCart,
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
