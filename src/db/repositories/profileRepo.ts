import { execute, queryFirst } from '@/db/client';
import type {
  ActivityLevel,
  Goal,
  NutritionTargets,
  Profile,
  Sex,
} from '@/types/domain';

interface ProfileRow {
  sex: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  goal: string;
  protein_pct: number;
  carb_pct: number;
  fat_pct: number;
  target_kcal: number;
  target_protein_g: number;
  target_carb_g: number;
  target_fat_g: number;
}

export interface StoredProfile {
  profile: Profile;
  targets: NutritionTargets;
}

function rowToStored(row: ProfileRow): StoredProfile {
  return {
    profile: {
      sex: row.sex as Sex,
      age: row.age,
      heightCm: row.height_cm,
      weightKg: row.weight_kg,
      activityLevel: row.activity_level as ActivityLevel,
      goal: row.goal as Goal,
      split: {
        proteinPct: row.protein_pct,
        carbPct: row.carb_pct,
        fatPct: row.fat_pct,
      },
    },
    targets: {
      bmr: 0,
      tdee: 0,
      targetKcal: row.target_kcal,
      macros: {
        proteinG: row.target_protein_g,
        carbG: row.target_carb_g,
        fatG: row.target_fat_g,
      },
    },
  };
}

export async function getProfile(): Promise<StoredProfile | null> {
  const row = await queryFirst<ProfileRow>(
    'SELECT * FROM profile WHERE id = 1;',
  );
  return row ? rowToStored(row) : null;
}

export async function upsertProfile(
  profile: Profile,
  targets: NutritionTargets,
): Promise<void> {
  await execute(
    `INSERT INTO profile (
       id, sex, age, height_cm, weight_kg, activity_level, goal,
       protein_pct, carb_pct, fat_pct,
       target_kcal, target_protein_g, target_carb_g, target_fat_g
     ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       sex = excluded.sex,
       age = excluded.age,
       height_cm = excluded.height_cm,
       weight_kg = excluded.weight_kg,
       activity_level = excluded.activity_level,
       goal = excluded.goal,
       protein_pct = excluded.protein_pct,
       carb_pct = excluded.carb_pct,
       fat_pct = excluded.fat_pct,
       target_kcal = excluded.target_kcal,
       target_protein_g = excluded.target_protein_g,
       target_carb_g = excluded.target_carb_g,
       target_fat_g = excluded.target_fat_g;`,
    [
      profile.sex,
      profile.age,
      profile.heightCm,
      profile.weightKg,
      profile.activityLevel,
      profile.goal,
      profile.split.proteinPct,
      profile.split.carbPct,
      profile.split.fatPct,
      targets.targetKcal,
      targets.macros.proteinG,
      targets.macros.carbG,
      targets.macros.fatG,
    ],
  );
}
