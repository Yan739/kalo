import { execute, queryAll, queryFirst } from '@/db/client';
import type { DailyTotals, LogEntry, NewLogEntry } from '@/types/domain';

interface LogRow {
  id: number;
  log_date: string;
  food_barcode: string | null;
  food_name: string;
  quantity_g: number;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  created_at: string;
}

function rowToEntry(row: LogRow): LogEntry {
  return {
    id: row.id,
    logDate: row.log_date,
    foodBarcode: row.food_barcode,
    foodName: row.food_name,
    quantityG: row.quantity_g,
    kcal: row.kcal,
    proteinG: row.protein_g,
    carbG: row.carb_g,
    fatG: row.fat_g,
    createdAt: row.created_at,
  };
}

export async function listByDate(logDate: string): Promise<LogEntry[]> {
  const rows = await queryAll<LogRow>(
    'SELECT * FROM log_entry WHERE log_date = ? ORDER BY created_at DESC;',
    [logDate],
  );
  return rows.map(rowToEntry);
}

export async function insertEntry(entry: NewLogEntry): Promise<number> {
  const createdAt = new Date().toISOString();
  const result = await execute(
    `INSERT INTO log_entry (
       log_date, food_barcode, food_name, quantity_g,
       kcal, protein_g, carb_g, fat_g, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      entry.logDate,
      entry.foodBarcode,
      entry.foodName,
      entry.quantityG,
      entry.kcal,
      entry.proteinG,
      entry.carbG,
      entry.fatG,
      createdAt,
    ],
  );
  return result.lastInsertRowId;
}

export async function deleteEntry(id: number): Promise<void> {
  await execute('DELETE FROM log_entry WHERE id = ?;', [id]);
}

export async function totalsByDate(logDate: string): Promise<DailyTotals> {
  const row = await queryFirst<{
    kcal: number | null;
    protein_g: number | null;
    carb_g: number | null;
    fat_g: number | null;
  }>(
    `SELECT
       SUM(kcal) AS kcal,
       SUM(protein_g) AS protein_g,
       SUM(carb_g) AS carb_g,
       SUM(fat_g) AS fat_g
     FROM log_entry WHERE log_date = ?;`,
    [logDate],
  );
  return {
    kcal: row?.kcal ?? 0,
    proteinG: row?.protein_g ?? 0,
    carbG: row?.carb_g ?? 0,
    fatG: row?.fat_g ?? 0,
  };
}
