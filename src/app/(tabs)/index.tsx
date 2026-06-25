import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HealthSync } from '@/components/HealthSync';
import { MacroBar } from '@/components/MacroBar';
import { NutritionRing } from '@/components/NutritionRing';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDayStore } from '@/store/useDayStore';
import type { LogEntry } from '@/types/domain';

export default function TodayScreen() {
  const entries = useDayStore((state) => state.entries);
  const totals = useDayStore((state) => state.totals);
  const targetKcal = useDayStore((state) => state.targetKcal);
  const targetMacros = useDayStore((state) => state.targetMacros);
  const loadDay = useDayStore((state) => state.loadDay);
  const removeEntry = useDayStore((state) => state.removeEntry);

  useFocusEffect(
    useCallback(() => {
      loadDay();
    }, [loadDay]),
  );

  const confirmDelete = (entry: LogEntry) => {
    Alert.alert('Supprimer', `Retirer "${entry.foodName}" du journal ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => removeEntry(entry.id),
      },
    ]);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ringWrap}>
          <NutritionRing current={totals.kcal} target={targetKcal} />
        </View>

        <ThemedView type="backgroundElement" style={styles.macros}>
          <MacroBar
            label="Proteines"
            current={totals.proteinG}
            target={targetMacros.proteinG}
            color={Accent.protein}
          />
          <MacroBar
            label="Glucides"
            current={totals.carbG}
            target={targetMacros.carbG}
            color={Accent.carb}
          />
          <MacroBar
            label="Lipides"
            current={totals.fatG}
            target={targetMacros.fatG}
            color={Accent.fat}
          />
        </ThemedView>

        <HealthSync />

        <ThemedText type="subtitle">Journal du jour</ThemedText>

        {entries.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Aucune entree. Scannez un produit pour commencer.
          </ThemedText>
        ) : (
          entries.map((entry) => (
            <Pressable
              key={entry.id}
              onLongPress={() => confirmDelete(entry)}
              delayLongPress={350}>
              <EntryRow entry={entry} />
            </Pressable>
          ))
        )}

        {entries.length > 0 && (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.hint}>
            Appui long sur une entree pour la supprimer.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function EntryRow({ entry }: { entry: LogEntry }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.entry, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.entryInfo}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {entry.foodName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {entry.quantityG} g - P {entry.proteinG} / G {entry.carbG} / L{' '}
          {entry.fatG}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{entry.kcal} kcal</ThemedText>
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
  ringWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  macros: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  entryInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  hint: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
