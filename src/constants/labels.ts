import type { ActivityLevel, Goal, Sex } from '@/types/domain';

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentaire' },
  { value: 'light', label: 'Leger' },
  { value: 'moderate', label: 'Modere' },
  { value: 'active', label: 'Actif' },
  { value: 'very_active', label: 'Tres actif' },
];

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'fast_loss', label: 'Perte rapide' },
  { value: 'slow_loss', label: 'Perte legere' },
  { value: 'maintain', label: 'Maintien' },
  { value: 'slow_gain', label: 'Prise legere' },
  { value: 'gain', label: 'Prise' },
];
