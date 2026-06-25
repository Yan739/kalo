import { NUTRITION_CONSTANTS } from '@/services/nutrition';
import type { Goal } from '@/types/domain';

const KCAL_PER_KG_FAT = 7700;

export interface GoalAdvice {
  label: string;
  tagline: string;
  message: string;
  proteinTip: string;
  weeklyKg: number;
  direction: 'loss' | 'maintain' | 'gain';
}

const META: Record<Goal, Omit<GoalAdvice, 'weeklyKg' | 'direction'>> = {
  fast_loss: {
    label: 'Perte rapide',
    tagline: 'Deficit marque',
    message:
      'Vise un deficit important mais tenable. Priorise proteines et legumes pour la satiete, garde un peu de cardio.',
    proteinTip: 'Monte les proteines pour proteger ta masse musculaire en deficit.',
  },
  slow_loss: {
    label: 'Perte legere',
    tagline: 'Deficit doux',
    message:
      'Perte progressive et durable. Un petit deficit constant donne de meilleurs resultats sur la duree.',
    proteinTip: 'Cible 1,6 a 2 g de proteines par kg de poids.',
  },
  maintain: {
    label: 'Maintien',
    tagline: 'Equilibre',
    message:
      'Stabilise ton poids. Mange autour de ton objectif et reste regulier sur l activite.',
    proteinTip: 'Garde des proteines suffisantes pour la recuperation.',
  },
  slow_gain: {
    label: 'Prise legere',
    tagline: 'Surplus doux',
    message:
      'Prise de muscle propre. Un leger surplus combine a la musculation limite la prise de gras.',
    proteinTip: 'Proteines elevees + entrainement en force pour gagner du muscle.',
  },
  gain: {
    label: 'Prise',
    tagline: 'Surplus marque',
    message:
      'Prise de masse plus rapide. Augmente les calories progressivement et entraine-toi lourd.',
    proteinTip: 'Repartis les proteines sur la journee, 4 a 5 prises.',
  },
};

export function goalAdvice(goal: Goal): GoalAdvice {
  const adjustment = NUTRITION_CONSTANTS.GOAL_ADJUSTMENTS[goal];
  const weeklyKg = Math.abs((adjustment * 7) / KCAL_PER_KG_FAT);
  const direction: GoalAdvice['direction'] =
    adjustment < 0 ? 'loss' : adjustment > 0 ? 'gain' : 'maintain';
  return {
    ...META[goal],
    weeklyKg: Math.round(weeklyKg * 100) / 100,
    direction,
  };
}

// Budget ajuste : on ajoute les calories actives (sport) au budget du jour,
// pour les objectifs de maintien et de prise. En perte, on en rend la moitie
// afin de preserver le deficit.
export function adjustedTarget(
  targetKcal: number,
  activeKcal: number,
  goal: Goal,
): number {
  if (targetKcal <= 0) {
    return 0;
  }
  const direction = goalAdvice(goal).direction;
  const factor = direction === 'loss' ? 0.5 : 1;
  return Math.round(targetKcal + activeKcal * factor);
}

export function remainingKcal(
  adjusted: number,
  consumed: number,
): number {
  return Math.round(adjusted - consumed);
}
