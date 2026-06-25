import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { QuantityInput } from '@/components/QuantityInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { useProduct } from '@/hooks/use-product';
import { useTheme } from '@/hooks/use-theme';
import { ProductNotFoundError } from '@/services/openfoodfacts';
import { scaleNutrient } from '@/services/nutrition';
import { useDayStore } from '@/store/useDayStore';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

function formatValue(value: number | null, suffix = ''): string {
  if (value === null) {
    return '-';
  }
  return `${Math.round(value)}${suffix}`;
}

export default function ScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(100);
  const addEntry = useDayStore((state) => state.addEntry);

  const { data: product, isLoading, error } = useProduct(barcode);

  const reset = () => {
    setBarcode(null);
    setQuantity(100);
  };

  if (!permission) {
    return <ThemedView style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Acces camera requis</ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.centerText}>
          La camera sert a scanner les codes-barres des produits.
        </ThemedText>
        <Pressable
          onPress={requestPermission}
          style={[styles.primaryButton, { backgroundColor: Accent.primary }]}>
          <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
            Autoriser la camera
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (barcode === null) {
    return (
      <View style={styles.screen}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
          onBarcodeScanned={({ data }) => setBarcode(data)}
        />
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.reticle} />
          <ThemedText type="smallBold" style={styles.overlayText}>
            Visez un code-barres
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.result}>
        {isLoading && (
          <ThemedText type="small" themeColor="textSecondary">
            Recherche du produit...
          </ThemedText>
        )}

        {error && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">
              {error instanceof ProductNotFoundError
                ? 'Produit introuvable'
                : 'Erreur reseau'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {error instanceof ProductNotFoundError
                ? `Code-barres ${barcode} absent d'Open Food Facts.`
                : 'Impossible de joindre Open Food Facts. Verifiez la connexion.'}
            </ThemedText>
          </ThemedView>
        )}

        {product && (
          <>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="subtitle">{product.name}</ThemedText>
              {product.brand && (
                <ThemedText type="small" themeColor="textSecondary">
                  {product.brand}
                </ThemedText>
              )}
              <View style={styles.divider} />
              <NutrientLine
                label="Calories (100 g)"
                value={formatValue(product.kcal100g, ' kcal')}
              />
              <NutrientLine
                label="Proteines (100 g)"
                value={formatValue(product.protein100g, ' g')}
              />
              <NutrientLine
                label="Glucides (100 g)"
                value={formatValue(product.carb100g, ' g')}
              />
              <NutrientLine
                label="Lipides (100 g)"
                value={formatValue(product.fat100g, ' g')}
              />
            </ThemedView>

            <ThemedText type="smallBold">Quantite</ThemedText>
            <QuantityInput value={quantity} onChange={setQuantity} />

            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                Pour {quantity} g
              </ThemedText>
              <NutrientLine
                label="Calories"
                value={formatValue(
                  scaleNutrient(product.kcal100g, quantity),
                  ' kcal',
                )}
              />
              <NutrientLine
                label="Proteines"
                value={formatValue(
                  scaleNutrient(product.protein100g, quantity),
                  ' g',
                )}
              />
              <NutrientLine
                label="Glucides"
                value={formatValue(
                  scaleNutrient(product.carb100g, quantity),
                  ' g',
                )}
              />
              <NutrientLine
                label="Lipides"
                value={formatValue(
                  scaleNutrient(product.fat100g, quantity),
                  ' g',
                )}
              />
            </ThemedView>

            <Pressable
              onPress={async () => {
                await addEntry({
                  foodBarcode: product.barcode,
                  foodName: product.name,
                  quantityG: quantity,
                  kcal: Math.round(
                    scaleNutrient(product.kcal100g, quantity) ?? 0,
                  ),
                  proteinG: Math.round(
                    scaleNutrient(product.protein100g, quantity) ?? 0,
                  ),
                  carbG: Math.round(
                    scaleNutrient(product.carb100g, quantity) ?? 0,
                  ),
                  fatG: Math.round(
                    scaleNutrient(product.fat100g, quantity) ?? 0,
                  ),
                });
                reset();
              }}
              style={[
                styles.primaryButton,
                { backgroundColor: Accent.primary },
              ]}>
              <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                Ajouter au journal
              </ThemedText>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={reset}
          style={[
            styles.secondaryButton,
            { backgroundColor: theme.backgroundElement },
          ]}>
          <ThemedText type="smallBold">Scanner un autre produit</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

function NutrientLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrientLine}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  reticle: {
    width: 240,
    height: 150,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 16,
  },
  overlayText: {
    color: '#ffffff',
  },
  result: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#88888855',
    marginVertical: Spacing.two,
  },
  nutrientLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
