import { Platform } from 'react-native';
import {
  getSdkStatus,
  initialize,
  insertRecords,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import type { DailyTotals } from '@/types/domain';

const PERMISSIONS = [
  { accessType: 'write', recordType: 'Nutrition' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
] as const;

export type SyncResult =
  | { ok: true; activeKcal: number }
  | { ok: false; reason: 'unavailable' | 'denied' | 'error'; message?: string };

function dayBounds(dateKey: string): { start: string; end: string } {
  const start = new Date(`${dateKey}T00:00:00`);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function openSettings(): void {
  try {
    openHealthConnectSettings();
  } catch {
    // ignore
  }
}

async function ensureReady(): Promise<boolean> {
  if (!isAndroid()) {
    return false;
  }
  const initialized = await initialize();
  if (!initialized) {
    return false;
  }
  const status = await getSdkStatus();
  return status === SdkAvailabilityStatus.SDK_AVAILABLE;
}

export async function isHealthConnectAvailable(): Promise<boolean> {
  try {
    return await ensureReady();
  } catch {
    return false;
  }
}

export async function syncDay(
  dateKey: string,
  totals: DailyTotals,
): Promise<SyncResult> {
  try {
    const ready = await ensureReady();
    if (!ready) {
      return { ok: false, reason: 'unavailable' };
    }

    const granted = await requestPermission(
      PERMISSIONS.map((permission) => ({ ...permission })),
    );
    if (!granted || granted.length === 0) {
      return { ok: false, reason: 'denied' };
    }

    const { start, end } = dayBounds(dateKey);

    await insertRecords([
      {
        recordType: 'Nutrition',
        mealType: 0,
        startTime: start,
        endTime: end,
        energy: { unit: 'kilocalories', value: totals.kcal },
        protein: { unit: 'grams', value: totals.proteinG },
        totalCarbohydrate: { unit: 'grams', value: totals.carbG },
        totalFat: { unit: 'grams', value: totals.fatG },
      },
    ]);

    let activeKcal = 0;
    try {
      const result = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: {
          operator: 'between',
          startTime: start,
          endTime: end,
        },
      });
      activeKcal = result.records.reduce(
        (sum, record) => sum + (record.energy?.inKilocalories ?? 0),
        0,
      );
    } catch {
      activeKcal = 0;
    }

    return { ok: true, activeKcal };
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
