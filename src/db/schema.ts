import type * as SQLite from 'expo-sqlite';

type Migration = {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          sex TEXT NOT NULL,
          age INTEGER NOT NULL,
          height_cm REAL NOT NULL,
          weight_kg REAL NOT NULL,
          activity_level TEXT NOT NULL,
          goal TEXT NOT NULL,
          protein_pct REAL NOT NULL,
          carb_pct REAL NOT NULL,
          fat_pct REAL NOT NULL,
          target_kcal INTEGER NOT NULL,
          target_protein_g INTEGER NOT NULL,
          target_carb_g INTEGER NOT NULL,
          target_fat_g INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS food (
          barcode TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT,
          kcal_100g REAL,
          protein_100g REAL,
          carb_100g REAL,
          fat_100g REAL,
          sugar_100g REAL,
          salt_100g REAL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS log_entry (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          log_date TEXT NOT NULL,
          food_barcode TEXT,
          food_name TEXT NOT NULL,
          quantity_g REAL NOT NULL,
          kcal INTEGER NOT NULL,
          protein_g INTEGER NOT NULL,
          carb_g INTEGER NOT NULL,
          fat_g INTEGER NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_log_entry_date ON log_entry (log_date);
      `);
    },
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  const current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
      });
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    }
  }
}
