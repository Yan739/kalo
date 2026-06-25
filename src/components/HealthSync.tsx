import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import {
  isAndroid,
  isHealthConnectAvailable,
  openSettings,
  syncDay,
} from '@/services/healthConnect';
import { useDayStore } from '@/store/useDayStore';

type Status = 'idle' | 'syncing' | 'done' | 'unavailable' | 'denied' | 'error';

export function HealthSync() {
  const date = useDayStore((state) => state.date);
  const totals = useDayStore((state) => state.totals);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [activeKcal, setActiveKcal] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

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

  const onSync = async () => {
    setStatus('syncing');
    setMessage(null);
    const result = await syncDay(date, totals);
    if (result.ok) {
      setActiveKcal(result.activeKcal);
      setAvailable(true);
      setStatus('done');
      return;
    }
    setStatus(result.reason);
    if (result.reason === 'error') {
      setMessage(result.message ?? null);
    }
    if (result.reason === 'unavailable') {
      setAvailable(false);
    }
  };

  const statusLine = (() => {
    switch (status) {
      case 'done':
        return 'Journal envoye vers Health Connect.';
      case 'syncing':
        return 'Synchronisation...';
      case 'denied':
        return 'Autorisations refusees. Reessayez et acceptez dans Health Connect.';
      case 'unavailable':
        return 'Health Connect indisponible. Installez-le et liez Samsung Health.';
      case 'error':
        return `Erreur : ${message ?? 'inconnue'}`;
      default:
        return 'Envoyer les totaux du jour et lire les calories actives.';
    }
  })();

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

      <ThemedText type="small" themeColor="textSecondary">
        {statusLine}
      </ThemedText>

      <View style={styles.actions}>
        <Pressable
          onPress={onSync}
          disabled={status === 'syncing'}
          style={[styles.button, { backgroundColor: Accent.primary }]}>
          <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
            {status === 'syncing' ? 'Synchronisation...' : 'Synchroniser'}
          </ThemedText>
        </Pressable>

        {(status === 'unavailable' || available === false) && (
          <Pressable
            onPress={openSettings}
            style={[styles.buttonGhost, { borderColor: Accent.primary }]}>
            <ThemedText type="smallBold" style={{ color: Accent.primary }}>
              Ouvrir Health Connect
            </ThemedText>
          </Pressable>
        )}
      </View>
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
