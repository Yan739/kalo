import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Accent, Spacing } from '@/constants/theme';
import { goalAdvice } from '@/services/coaching';
import type { Goal } from '@/types/domain';

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  loss: 'trending-down',
  gain: 'trending-up',
  maintain: 'remove',
};

const COLOR: Record<string, string> = {
  loss: Accent.primary,
  gain: Accent.energy,
  maintain: Accent.success,
};

export function GoalBanner({ goal }: { goal: Goal }) {
  const advice = goalAdvice(goal);
  const color = COLOR[advice.direction];

  const projection =
    advice.direction === 'maintain'
      ? 'Maintien du poids'
      : `${advice.direction === 'loss' ? '-' : '+'}${advice.weeklyKg.toFixed(2)} kg / semaine (estimation)`;

  return (
    <View style={[styles.banner, { backgroundColor: color }]}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={ICON[advice.direction]} size={22} color="#ffffff" />
        </View>
        <View style={styles.headTexts}>
          <ThemedText type="smallBold" style={styles.white}>
            {advice.label} - {advice.tagline}
          </ThemedText>
          <ThemedText type="small" style={styles.whiteSoft}>
            {projection}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="small" style={styles.whiteSoft}>
        {advice.message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTexts: {
    flex: 1,
    gap: 2,
  },
  white: {
    color: '#ffffff',
  },
  whiteSoft: {
    color: 'rgba(255,255,255,0.9)',
  },
});
