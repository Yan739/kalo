import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import {
  ensurePermissions,
  isAndroid,
  isHealthConnectAvailable,
  readActiveCalories,
  writeDailyNutrition,
} from '@/services/healthConnect';
import { useDayStore } from '@/store/useDayStore';

type Status = 'idle' | 'syncing' | 'done' | 'error';

export function HealthSync() {
  const date = useDayStore((state) => state.date);
  const totals = useDayStore((state) => state.totals);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [activeKcal, setActiveKcal] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!isAndroid()) {
      setAvailable(false);
      return;
    }
    isHealthConnectAvailable()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  if (!isAndroid()) {
    return null;
  }

  const sync = async () => {
    setStatus('syncing');
    try {
      const granted = await ensurePermissions();
      if (!granted) {
        setStatus('error');
        return;
      }
      await writeDailyNutrition(date, totals);
      const active = await readActiveCalories(date);
      setActiveKcal(active);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Montre & Health Connect</ThemedText>
        {activeKcal !== null && (
          <ThemedText type="small" themeColor="textSecondary">
            {Math.round(activeKcal)} kcal actives
          </ThemedText>
        )}
      </View>

      {available === false ? (
        <ThemedText type="small" themeColor="textSecondary">
          Health Connect indisponible. Installez l'application Health Connect et
          liez Samsung Health.
        </ThemedText>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {status === 'done'
            ? 'Journal envoye vers Health Connect.'
            : status === 'error'
              ? 'Echec de la synchronisation. Verifiez les autorisations.'
              : 'Envoyer les totaux du jour et lire les calories actives.'}
        </ThemedText>
      )}

      <Pressable
        onPress={sync}
        disabled={available !== true || status === 'syncing'}
        style={[
          styles.button,
          {
            backgroundColor:
              available === true ? Accent.primary : Accent.primary + '55',
          },
        ]}>
        <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
          {status === 'syncing' ? 'Synchronisation...' : 'Synchroniser'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
