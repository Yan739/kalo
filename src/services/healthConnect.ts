import { Platform } from 'react-native';
import {
  getSdkStatus,
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import type { DailyTotals } from '@/types/domain';

const PERMISSIONS = [
  { accessType: 'write', recordType: 'Nutrition' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
] as const;

function dayBounds(dateKey: string): { start: string; end: string } {
  const start = new Date(`${dateKey}T00:00:00`);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export async function isHealthConnectAvailable(): Promise<boolean> {
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

export async function ensurePermissions(): Promise<boolean> {
  const granted = await requestPermission(
    PERMISSIONS.map((permission) => ({ ...permission })),
  );
  return granted.length > 0;
}

export async function writeDailyNutrition(
  dateKey: string,
  totals: DailyTotals,
): Promise<void> {
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
}

export async function readActiveCalories(dateKey: string): Promise<number> {
  const { start, end } = dayBounds(dateKey);
  const result = await readRecords('ActiveCaloriesBurned', {
    timeRangeFilter: { operator: 'between', startTime: start, endTime: end },
  });
  return result.records.reduce(
    (sum, record) => sum + record.energy.inKilocalories,
    0,
  );
}
