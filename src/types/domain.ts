export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Goal =
  | 'fast_loss'
  | 'slow_loss'
  | 'maintain'
  | 'slow_gain'
  | 'gain';

export interface MacroSplit {
  proteinPct: number;
  carbPct: number;
  fatPct: number;
}

export interface MacroGrams {
  proteinG: number;
  carbG: number;
  fatG: number;
}

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  split: MacroSplit;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  targetKcal: number;
  macros: MacroGrams;
}

export interface FoodItem {
  barcode: string;
  name: string;
  brand: string | null;
  kcal100g: number | null;
  protein100g: number | null;
  carb100g: number | null;
  fat100g: number | null;
  sugar100g: number | null;
  salt100g: number | null;
}

export interface LogEntry {
  id: number;
  logDate: string;
  foodBarcode: string | null;
  foodName: string;
  quantityG: number;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  createdAt: string;
}

export type NewLogEntry = Omit<LogEntry, 'id' | 'createdAt'>;

export interface DailyTotals {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}
