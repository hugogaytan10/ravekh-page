/*import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronBack } from '../../assets/SVG/ChevronBack';
import { ThemeLight } from '../Theme/Theme';
import { AppContext } from '../Context/AppContext';
import InputBasic from '../Utilities/InputBasic';
import ScanIcon from '../../assets/SVG/ScanCircleIcon';
import { ScannProduct } from '../LectorQR/ScannProduct';
import ChevronGo from '../../assets/SVG/ChevronGo';
import {
  VariantDraft,
  VariantDraftEditableField,
  createEmptyVariantDraft,
} from './CRUDProducts/variantTypes';
import { Variant } from '../Model/Variant';
import {
  calculateVariantChanges,
  syncDraftColors,
  variantsToDrafts,
} from './CRUDProducts/variantUtils';
import {
  deleteVariant as deleteVariantRequest,
  getVariantsByProductId,
  insertVariant as insertVariantRequest,
  updateVariant as updateVariantRequest,
} from './Petitions';

interface VariantRouteParams {
  variants?: VariantDraft[];
  accentColor?: string;
  returnTo?: string;
  productId?: number;
  originalVariants?: Variant[];
}

const AddVariant: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const context = useContext(AppContext);
  const {
    variants = [],
    accentColor,
    returnTo,
    productId,
    originalVariants = [],
  }: VariantRouteParams = (route.params as VariantRouteParams) || {};

  const initialColor = accentColor || context.store?.Color || ThemeLight.btnBackground;
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>(
    variants.length > 0
      ? syncDraftColors(variants, initialColor)
      : [createEmptyVariantDraft(initialColor)]
  );
  const [detailsExpanded, setDetailsExpanded] = useState<Record<string, boolean>>({});
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const highlightColor = useMemo(
    () => accentColor || context.store?.Color || ThemeLight.btnBackground,
    [accentColor, context.store?.Color]
  );

  useEffect(() => {
    setDetailsExpanded(prev => {
      const next: Record<string, boolean> = {};
      variantDrafts.forEach(variant => {
        next[variant.key] = prev[variant.key] ?? false;
      });
      return next;
    });
  }, [variantDrafts]);

  const handleFieldChange = (
    index: number,
    field: VariantDraftEditableField,
    value: string,
  ) => {
    setVariantDrafts(prev =>
      prev.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  useEffect(() => {
    setVariantDrafts(prev => syncDraftColors(prev, highlightColor));
  }, [highlightColor]);

  const handleAddVariant = () => {
    setVariantDrafts(prev => [...prev, createEmptyVariantDraft(highlightColor)]);
  };

  const handleRemoveVariant = (index: number) => {
    const variantToRemove = variantDrafts[index];
    setVariantDrafts(prev => prev.filter((_, variantIndex) => variantIndex !== index));
    if (variantToRemove) {
      setDetailsExpanded(prev => {
        const next = { ...prev };
        delete next[variantToRemove.key];
        return next;
      });
    }
  };

  const toggleDetails = (key: string) => {
    setDetailsExpanded(prev => ({ ...prev, [key]: !(prev[key] ?? false) }));
  };

  const handleOpenScanner = (key: string) => {
    setScannerTarget(key);
    setScannerVisible(true);
  };

  const handleScannerVisibility = (isVisible: boolean) => {
    setScannerVisible(isVisible);
    if (!isVisible) {
      setScannerTarget(null);
    }
  };

  const handleBarcodeScanned = (code: string) => {
    if (!scannerTarget) {
      return;
    }

    setVariantDrafts(prev =>
      prev.map(variant =>
        variant.key === scannerTarget ? { ...variant, barcode: code } : variant
      )
    );
    setScannerTarget(null);
  };

  const truncate = (text: string, length: number) =>
    text.length > length ? `${text.substring(0, length)}...` : text;

  const finishNavigation = (
    drafts: VariantDraft[],
    originals?: Variant[],
  ) => {
    const draftsWithColor = syncDraftColors(drafts, highlightColor);

    if (returnTo) {
      navigation.navigate({
        name: returnTo,
        params: {
          variantsResult: draftsWithColor,
          ...(originals ? { variantsOriginalsResult: originals } : {}),
        },
        merge: true,
      });
      return;
    }

    navigation.goBack();
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const isEditingExistingProduct = typeof productId === 'number';

    if (!isEditingExistingProduct) {
      finishNavigation(variantDrafts);
      return;
    }

    const token = context.user?.Token;
    if (!token || !context.user) {
      finishNavigation(variantDrafts);
      return;
    }

    setIsSaving(true);
    context.setIsShowSplash(true);

    try {
      const { toCreate, toUpdate, toDelete } = calculateVariantChanges(
        variantDrafts,
        originalVariants,
        highlightColor,
      );

      for (const variant of toCreate) {
        await insertVariantRequest(productId as number, variant, token);
      }

      for (const variant of toUpdate) {
        if (typeof variant.Id === 'number') {
          await updateVariantRequest(variant.Id, productId as number, variant, token);
        }
      }

      for (const variantId of toDelete) {
        await deleteVariantRequest(variantId, productId as number, token);
      }

      const refreshed = await getVariantsByProductId(productId as number, token);

      if (Array.isArray(refreshed)) {
        finishNavigation(variantsToDrafts(refreshed, highlightColor), refreshed);
      } else {
        finishNavigation(variantDrafts, originalVariants);
      }
    } catch (error) {
      console.error('Error al guardar variantes:', error);
      finishNavigation(variantDrafts, originalVariants);
    } finally {
      context.setIsShowSplash(false);
      setIsSaving(false);
    }
  };

  const hasVariants = variantDrafts.length > 0;

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: highlightColor,
          height: Platform.OS === 'ios' ? 40 : 0,
        }}
      />
      <StatusBar backgroundColor={highlightColor} barStyle={'light-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronBack />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Variantes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {hasVariants ? (
          variantDrafts.map((variant, index) => {
            const variantColor = variant.color || highlightColor;
            const isDetailsExpanded = detailsExpanded[variant.key] ?? false;
            const variantLabel = variant.description.trim() || `Variante ${index + 1}`;
            const truncatedLabel = truncate(variantLabel, 14);

            return (
              <View key={variant.key} style={styles.variantCard}>
                <View style={styles.previewSection}>
                  <View
                    style={[
                      styles.leftSquare,
                      { backgroundColor: variantColor },
                    ]}
                  />
                  <View style={styles.mainInfo}>
                    <View
                      style={[
                        styles.previewBadge,
                        { backgroundColor: variantColor },
                      ]}
                    >
                      <View style={styles.previewBadgeFooter}>
                        <Text style={styles.previewBadgeText}>{truncatedLabel}</Text>
                        <Text style={styles.previewBadgePrice}>
                          {variant.price ? `$${variant.price}` : '$0'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.removeVariantButton, { borderColor: highlightColor }]}
                  onPress={() => handleRemoveVariant(index)}
                >
                  <Text style={[styles.removeVariantButtonText, { color: highlightColor }]}>Eliminar variante</Text>
                </TouchableOpacity>

                <View style={styles.formSection}>
                  <InputBasic
                    placeholder="Nombre de la variante"
                    value={variant.description}
                    onChangeText={text => handleFieldChange(index, 'description', text)}
                  />
                  <InputBasic
                    placeholder="Precio"
                    value={variant.price}
                    onChangeText={text => handleFieldChange(index, 'price', text)}
                    keyboardType="decimal-pad"
                  />
                  <InputBasic
                    placeholder="Costo de adquisición"
                    value={variant.costPerItem}
                    onChangeText={text => handleFieldChange(index, 'costPerItem', text)}
                    keyboardType="decimal-pad"
                  />
                  <View style={styles.barcodeRow}>
                    <View style={styles.barcodeInputWrapper}>
                      <InputBasic
                        placeholder="Código de barras"
                        value={variant.barcode}
                        onChangeText={text => handleFieldChange(index, 'barcode', text)}
                      />
                    </View>
                    <Pressable
                      style={styles.scanButton}
                      onPress={() => handleOpenScanner(variant.key)}
                    >
                      <ScanIcon />
                    </Pressable>
                  </View>
                </View>

                  <TouchableOpacity
                    style={styles.detailsSection}
                    onPress={() => toggleDetails(variant.key)}
                  >
                    <Text style={styles.detailsText}>Detalles</Text>
                  <View style={isDetailsExpanded ? styles.rotateToUp : styles.rotateToDown}>
                    <ChevronGo
                      height={20}
                      width={20}
                      stroke={ThemeLight.borderColor}
                    />
                  </View>
                </TouchableOpacity>

                {isDetailsExpanded && (
                  <View style={styles.detailsContent}>
                    <InputBasic
                      placeholder="Stock"
                      value={variant.stock}
                      onChangeText={text => handleFieldChange(index, 'stock', text)}
                      keyboardType="numeric"
                    />
                    <InputBasic
                      placeholder="Stock mínimo"
                      value={variant.minStock}
                      onChangeText={text => handleFieldChange(index, 'minStock', text)}
                      keyboardType="numeric"
                    />
                    <InputBasic
                      placeholder="Stock óptimo"
                      value={variant.optStock}
                      onChangeText={text => handleFieldChange(index, 'optStock', text)}
                      keyboardType="numeric"
                    />
                    <InputBasic
                      placeholder="Precio de promoción"
                      value={variant.promotionPrice}
                      onChangeText={text => handleFieldChange(index, 'promotionPrice', text)}
                      keyboardType="decimal-pad"
                    />
                    <InputBasic
                      placeholder="Fecha de caducidad"
                      value={variant.expDate}
                      onChangeText={text => handleFieldChange(index, 'expDate', text)}
                    />
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            Aún no has agregado variantes. Presiona el botón para comenzar.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.addVariantButton, { backgroundColor: highlightColor }]}
          onPress={handleAddVariant}
        >
          <Text style={styles.addVariantButtonText}>Agregar variante</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: highlightColor }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>Guardar variantes</Text>
        </TouchableOpacity>
      </View>

      <ScannProduct
        isShow={scannerVisible}
        setIsShow={handleScannerVisibility}
        setBarCode={handleBarcodeScanned}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },
  scrollContent: {
    paddingBottom: 160,
    paddingHorizontal: 16,
  },
  variantCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 15,
    borderRadius: 12,
  },
  leftSquare: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  mainInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBadge: {
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  previewBadgeFooter: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  previewBadgeText: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
  },
  previewBadgePrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginTop: 4,
  },
  removeVariantButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  removeVariantButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  formSection: {
    marginTop: 16,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  barcodeInputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  scanButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E1F5',
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.2,
    borderBottomColor: '#ddd',
    width: '100%',
    marginTop: 10,
  },
  detailsText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
  detailsContent: {
    paddingVertical: 15,
    width: '100%',
  },
  addVariantButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  addVariantButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    textAlign: 'center',
    color: ThemeLight.textColor,
    fontFamily: 'Poppins-Regular',
    marginVertical: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  rotateToUp: {
    transform: [{ rotate: '-90deg' }],
  },
  rotateToDown: {
    transform: [{ rotate: '90deg' }],
  },
});

export default AddVariant;
*/