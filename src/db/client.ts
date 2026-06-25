import * as SQLite from 'expo-sqlite';

import { runMigrations } from './schema';

const DB_NAME = 'kalo.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

export async function queryAll<T>(
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
}

export async function queryFirst<T>(
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<T | null> {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
}

export async function execute(
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<SQLite.SQLiteRunResult> {
  const db = await getDb();
  return db.runAsync(sql, params);
}
