import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accent, Spacing } from '@/constants/theme';
import {
  importHealth,
  isAndroid,
  isHealthConnectAvailable,
  openSettings,
  syncDay,
  type SyncResult,
} from '@/services/healthConnect';
import { useDayStore } from '@/store/useDayStore';

type Status = 'idle' | 'busy' | 'done' | 'unavailable' | 'denied' | 'error';

export function HealthSync() {
  const date = useDayStore((state) => state.date);
  const totals = useDayStore((state) => state.totals);
  const setHealth = useDayStore((state) => state.setHealth);

  const [available, setAvailable] = useState<boolean | null>(null);
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

  const handle = (run: () => Promise<SyncResult>) => async () => {
    setStatus('busy');
    setMessage(null);
    const result = await run();
    if (result.ok) {
      setHealth(result.snapshot);
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
        return 'Synchronise avec Samsung Health.';
      case 'busy':
        return 'Connexion a Health Connect...';
      case 'denied':
        return 'Autorisations refusees. Acceptez-les dans Health Connect.';
      case 'unavailable':
        return 'Health Connect indisponible. Installez-le et liez Samsung Health.';
      case 'error':
        return `Erreur : ${message ?? 'inconnue'}`;
      default:
        return 'Importez vos pas, calories actives et poids, ou envoyez votre journal.';
    }
  })();

  const busy = status === 'busy';

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="watch-outline" size={18} color={Accent.primary} />
          <ThemedText type="smallBold">Samsung Health</ThemedText>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.status}>
        {statusLine}
      </ThemedText>

      <View style={styles.actions}>
        <Pressable
          onPress={handle(() => importHealth(date))}
          disabled={busy}
          style={[styles.button, { backgroundColor: Accent.primary }]}>
          <ThemedText type="smallBold" style={styles.white}>
            Importer mes donnees
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handle(() => syncDay(date, totals))}
          disabled={busy}
          style={[styles.buttonGhost, { borderColor: Accent.primary }]}>
          <ThemedText type="smallBold" style={{ color: Accent.primary }}>
            Envoyer le journal
          </ThemedText>
        </Pressable>
      </View>

      {(status === 'unavailable' || available === false) && (
        <Pressable onPress={openSettings} style={styles.link}>
          <ThemedText type="smallBold" style={{ color: Accent.primary }}>
            Ouvrir Health Connect
          </ThemedText>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  status: {
    marginBottom: Spacing.three,
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
  link: {
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  white: {
    color: '#ffffff',
  },
});
