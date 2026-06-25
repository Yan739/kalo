import type {
  ActivityLevel,
  DailyTotals,
  Goal,
  MacroGrams,
  MacroSplit,
  NutritionTargets,
  Profile,
  Sex,
} from '@/types/domain';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  fast_loss: -500,
  slow_loss: -250,
  maintain: 0,
  slow_gain: 250,
  gain: 500,
};

const KCAL_PER_GRAM = {
  protein: 4,
  carb: 4,
  fat: 9,
} as const;

export const DEFAULT_SPLIT: MacroSplit = {
  proteinPct: 30,
  carbPct: 40,
  fatPct: 30,
};

export function calcBmr(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel];
}

export function calcTargetKcal(tdee: number, goal: Goal): number {
  return tdee + GOAL_ADJUSTMENTS[goal];
}

export function calcMacros(targetKcal: number, split: MacroSplit): MacroGrams {
  return {
    proteinG: Math.round(
      (targetKcal * (split.proteinPct / 100)) / KCAL_PER_GRAM.protein,
    ),
    carbG: Math.round(
      (targetKcal * (split.carbPct / 100)) / KCAL_PER_GRAM.carb,
    ),
    fatG: Math.round(
      (targetKcal * (split.fatPct / 100)) / KCAL_PER_GRAM.fat,
    ),
  };
}

export function computeTargets(profile: Profile): NutritionTargets {
  const bmr = calcBmr(
    profile.sex,
    profile.weightKg,
    profile.heightCm,
    profile.age,
  );
  const tdee = calcTdee(bmr, profile.activityLevel);
  const targetKcal = calcTargetKcal(tdee, profile.goal);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetKcal: Math.round(targetKcal),
    macros: calcMacros(targetKcal, profile.split),
  };
}

export function scaleNutrient(
  per100g: number | null,
  quantityG: number,
): number | null {
  if (per100g === null) {
    return null;
  }
  return (per100g * quantityG) / 100;
}

export function sumTotals(
  entries: ReadonlyArray<DailyTotals>,
): DailyTotals {
  return entries.reduce<DailyTotals>(
    (acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      proteinG: acc.proteinG + entry.proteinG,
      carbG: acc.carbG + entry.carbG,
      fatG: acc.fatG + entry.fatG,
    }),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );
}

export const NUTRITION_CONSTANTS = {
  ACTIVITY_FACTORS,
  GOAL_ADJUSTMENTS,
  KCAL_PER_GRAM,
} as const;
