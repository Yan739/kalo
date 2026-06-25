import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { QuantityInput } from '@/components/QuantityInput';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { humanizeLabel, nutritionForLabel } from '@/constants/foodNutrition';
import { useTheme } from '@/hooks/use-theme';
import {
  classifyPlate,
  HfHttpError,
  MissingHfTokenError,
  type PlateGuess,
} from '@/services/huggingface';
import { scaleNutrient } from '@/services/nutrition';
import { useDayStore } from '@/store/useDayStore';

function describeError(err: unknown): string {
  if (err instanceof MissingHfTokenError) {
    return 'Token HuggingFace absent. Definir EXPO_PUBLIC_HF_TOKEN.';
  }
  if (err instanceof HfHttpError) {
    if (err.status === 401 || err.status === 403) {
      return 'Token HuggingFace invalide ou revoque. Regenerez-le.';
    }
    if (err.status === 404) {
      return 'Modele indisponible sur HuggingFace (404).';
    }
    if (err.status === 503) {
      return 'Modele en cours de chargement. Reessayez dans un instant.';
    }
    return `Erreur HuggingFace (${err.status}).`;
  }
  return 'Echec reseau. Verifiez la connexion internet.';
}

export default function PlateScreen() {
  const theme = useTheme();
  const addEntry = useDayStore((state) => state.addEntry);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<PlateGuess[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(250);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setImageUri(null);
    setGuesses([]);
    setSelected(null);
    setError(null);
    setQuantity(250);
  };

  const runClassification = async (uri: string) => {
    setImageUri(uri);
    setGuesses([]);
    setSelected(null);
    setError(null);
    setLoading(true);
    try {
      const result = await classifyPlate(uri);
      setGuesses(result);
      if (result.length > 0) {
        applySelection(result[0].label);
      } else {
        setError('Aucun aliment reconnu.');
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  const applySelection = (label: string) => {
    setSelected(label);
    setQuantity(nutritionForLabel(label).nutrition.defaultGrams);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Acces camera refuse.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled) {
      await runClassification(result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!result.canceled) {
      await runClassification(result.assets[0].uri);
    }
  };

  const selectedNutrition = selected ? nutritionForLabel(selected) : null;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        )}

        <View style={styles.actions}>
          <Pressable
            onPress={takePhoto}
            style={[styles.primaryButton, { backgroundColor: Accent.primary }]}>
            <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
              Prendre une photo
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={pickPhoto}
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.backgroundElement },
            ]}>
            <ThemedText type="smallBold">Galerie</ThemedText>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Accent.primary} />
            <ThemedText type="small" themeColor="textSecondary">
              Analyse de l'assiette...
            </ThemedText>
          </View>
        )}

        {error && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small">{error}</ThemedText>
          </ThemedView>
        )}

        {guesses.length > 0 && (
          <View style={styles.guesses}>
            <ThemedText type="smallBold">Propositions</ThemedText>
            <View style={styles.chips}>
              {guesses.map((guess) => {
                const active = guess.label === selected;
                return (
                  <Pressable
                    key={guess.label}
                    onPress={() => applySelection(guess.label)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? Accent.primary
                          : theme.backgroundElement,
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ color: active ? '#ffffff' : theme.text }}>
                      {humanizeLabel(guess.label)} (
                      {Math.round(guess.score * 100)}%)
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {selected && selectedNutrition && (
          <>
            {!selectedNutrition.known && (
              <ThemedText type="small" themeColor="textSecondary">
                Aliment hors table : valeurs generiques, ajustez la quantite.
              </ThemedText>
            )}

            <ThemedText type="smallBold">Quantite</ThemedText>
            <QuantityInput value={quantity} onChange={setQuantity} />

            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                {humanizeLabel(selected)} - {quantity} g
              </ThemedText>
              <Line
                label="Calories"
                value={`${Math.round(scaleNutrient(selectedNutrition.nutrition.kcal, quantity) ?? 0)} kcal`}
              />
              <Line
                label="Proteines"
                value={`${Math.round(scaleNutrient(selectedNutrition.nutrition.protein, quantity) ?? 0)} g`}
              />
              <Line
                label="Glucides"
                value={`${Math.round(scaleNutrient(selectedNutrition.nutrition.carb, quantity) ?? 0)} g`}
              />
              <Line
                label="Lipides"
                value={`${Math.round(scaleNutrient(selectedNutrition.nutrition.fat, quantity) ?? 0)} g`}
              />
            </ThemedView>

            <Pressable
              onPress={async () => {
                const n = selectedNutrition.nutrition;
                await addEntry({
                  foodBarcode: null,
                  foodName: humanizeLabel(selected),
                  quantityG: quantity,
                  kcal: Math.round(scaleNutrient(n.kcal, quantity) ?? 0),
                  proteinG: Math.round(scaleNutrient(n.protein, quantity) ?? 0),
                  carbG: Math.round(scaleNutrient(n.carb, quantity) ?? 0),
                  fatG: Math.round(scaleNutrient(n.fat, quantity) ?? 0),
                });
                reset();
              }}
              style={[styles.primaryButton, { backgroundColor: Accent.primary }]}>
              <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                Ajouter au journal
              </ThemedText>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
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
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  guesses: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
