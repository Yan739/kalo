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
  { accessType: 'read', recordType: 'TotalCaloriesBurned' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Weight' },
] as const;

export interface HealthSnapshot {
  steps: number;
  activeKcal: number;
  totalKcal: number;
  weightKg: number | null;
}

export type SyncResult =
  | { ok: true; snapshot: HealthSnapshot }
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

async function readSnapshot(dateKey: string): Promise<HealthSnapshot> {
  const { start, end } = dayBounds(dateKey);
  const between = { operator: 'between', startTime: start, endTime: end } as const;

  const safeRead = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const steps = await safeRead(async () => {
    const r = await readRecords('Steps', { timeRangeFilter: between });
    return r.records.reduce((sum, rec) => sum + rec.count, 0);
  }, 0);

  const activeKcal = await safeRead(async () => {
    const r = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: between,
    });
    return r.records.reduce(
      (sum, rec) => sum + (rec.energy?.inKilocalories ?? 0),
      0,
    );
  }, 0);

  const totalKcal = await safeRead(async () => {
    const r = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter: between,
    });
    return r.records.reduce(
      (sum, rec) => sum + (rec.energy?.inKilocalories ?? 0),
      0,
    );
  }, 0);

  const weightKg = await safeRead<number | null>(async () => {
    const monthAgo = new Date(start);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const r = await readRecords('Weight', {
      timeRangeFilter: {
        operator: 'between',
        startTime: monthAgo.toISOString(),
        endTime: end,
      },
    });
    if (r.records.length === 0) {
      return null;
    }
    const last = r.records[r.records.length - 1];
    return last.weight?.inKilograms ?? null;
  }, null);

  return { steps, activeKcal, totalKcal, weightKg };
}

async function withPermissions<T>(
  action: () => Promise<T>,
): Promise<SyncResult & { value?: T }> {
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
    const value = await action();
    return { ok: true, snapshot: value as HealthSnapshot, value };
  } catch (error) {
    return {
      ok: false,
      reason: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function importHealth(dateKey: string): Promise<SyncResult> {
  return withPermissions(() => readSnapshot(dateKey));
}

export function syncDay(
  dateKey: string,
  totals: DailyTotals,
): Promise<SyncResult> {
  const { start, end } = dayBounds(dateKey);
  return withPermissions(async () => {
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
    return readSnapshot(dateKey);
  });
}
