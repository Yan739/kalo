import { execute, queryFirst } from '@/db/client';
import type { FoodItem } from '@/types/domain';

interface FoodRow {
  barcode: string;
  name: string;
  brand: string | null;
  kcal_100g: number | null;
  protein_100g: number | null;
  carb_100g: number | null;
  fat_100g: number | null;
  sugar_100g: number | null;
  salt_100g: number | null;
}

function rowToFood(row: FoodRow): FoodItem {
  return {
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    kcal100g: row.kcal_100g,
    protein100g: row.protein_100g,
    carb100g: row.carb_100g,
    fat100g: row.fat_100g,
    sugar100g: row.sugar_100g,
    salt100g: row.salt_100g,
  };
}

export async function getFood(barcode: string): Promise<FoodItem | null> {
  const row = await queryFirst<FoodRow>(
    'SELECT * FROM food WHERE barcode = ?;',
    [barcode],
  );
  return row ? rowToFood(row) : null;
}

export async function upsertFood(food: FoodItem): Promise<void> {
  const updatedAt = new Date().toISOString();
  await execute(
    `INSERT INTO food (
       barcode, name, brand, kcal_100g, protein_100g,
       carb_100g, fat_100g, sugar_100g, salt_100g, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(barcode) DO UPDATE SET
       name = excluded.name,
       brand = excluded.brand,
       kcal_100g = excluded.kcal_100g,
       protein_100g = excluded.protein_100g,
       carb_100g = excluded.carb_100g,
       fat_100g = excluded.fat_100g,
       sugar_100g = excluded.sugar_100g,
       salt_100g = excluded.salt_100g,
       updated_at = excluded.updated_at;`,
    [
      food.barcode,
      food.name,
      food.brand,
      food.kcal100g,
      food.protein100g,
      food.carb100g,
      food.fat100g,
      food.sugar100g,
      food.salt100g,
      updatedAt,
    ],
  );
}
