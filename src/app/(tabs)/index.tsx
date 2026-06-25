import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { GoalBanner } from '@/components/GoalBanner';
import { HealthSync } from '@/components/HealthSync';
import { MacroBar } from '@/components/MacroBar';
import { NutritionRing } from '@/components/NutritionRing';
import { StatTile } from '@/components/StatTile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { adjustedTarget } from '@/services/coaching';
import { useDayStore } from '@/store/useDayStore';
import type { LogEntry } from '@/types/domain';

export default function TodayScreen() {
  const entries = useDayStore((s) => s.entries);
  const totals = useDayStore((s) => s.totals);
  const targetKcal = useDayStore((s) => s.targetKcal);
  const targetMacros = useDayStore((s) => s.targetMacros);
  const goal = useDayStore((s) => s.goal);
  const hasProfile = useDayStore((s) => s.hasProfile);
  const health = useDayStore((s) => s.health);
  const loadDay = useDayStore((s) => s.loadDay);
  const removeEntry = useDayStore((s) => s.removeEntry);

  useFocusEffect(
    useCallback(() => {
      loadDay();
    }, [loadDay]),
  );

  const activeKcal = health?.activeKcal ?? 0;
  const budget = goal ? adjustedTarget(targetKcal, activeKcal, goal) : targetKcal;

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
        {!hasProfile && (
          <Link href="/profile" asChild>
            <Pressable>
              <Card style={styles.setup}>
                <Ionicons
                  name="person-add-outline"
                  size={22}
                  color={Accent.primary}
                />
                <View style={styles.setupText}>
                  <ThemedText type="smallBold">Configurez votre profil</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Renseignez vos objectifs pour calculer votre budget.
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Accent.primary}
                />
              </Card>
            </Pressable>
          </Link>
        )}

        {goal && <GoalBanner goal={goal} />}

        <Card style={styles.ringCard}>
          <NutritionRing current={totals.kcal} target={budget} />
          {activeKcal > 0 && targetKcal > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              Budget ajuste avec {Math.round(activeKcal)} kcal de sport
            </ThemedText>
          )}
        </Card>

        <View style={styles.tiles}>
          <StatTile
            icon="footsteps-outline"
            color={Accent.steps}
            value={health ? Math.round(health.steps).toLocaleString('fr-FR') : '-'}
            label="Pas"
          />
          <StatTile
            icon="flame-outline"
            color={Accent.energy}
            value={health ? `${Math.round(health.activeKcal)}` : '-'}
            label="Kcal actives"
          />
          <StatTile
            icon="scale-outline"
            color={Accent.primary}
            value={health?.weightKg ? `${health.weightKg.toFixed(1)}` : '-'}
            label="Poids (kg)"
          />
        </View>

        <Card>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Macros du jour
          </ThemedText>
          <View style={styles.macros}>
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
          </View>
        </Card>

        <HealthSync />

        <ThemedText type="subtitle" style={styles.journalTitle}>
          Journal du jour
        </ThemedText>

        {entries.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Aucune entree. Scannez un produit ou une assiette pour commencer.
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
    <Card style={styles.entry}>
      <View style={styles.entryInfo}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {entry.foodName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {entry.quantityG} g - P {entry.proteinG} / G {entry.carbG} / L{' '}
          {entry.fatG}
        </ThemedText>
      </View>
      <View style={[styles.kcalPill, { backgroundColor: theme.background }]}>
        <ThemedText type="smallBold">{entry.kcal}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          kcal
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  setup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  setupText: { flex: 1, gap: 2 },
  ringCard: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  tiles: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cardTitle: { marginBottom: Spacing.three },
  macros: { gap: Spacing.three },
  journalTitle: { marginTop: Spacing.one },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  entryInfo: { flex: 1, gap: Spacing.half },
  kcalPill: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  hint: { textAlign: 'center', marginTop: Spacing.one },
});
