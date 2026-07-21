import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { resolve } from "path";

const dbPath = resolve(import.meta.dirname, "../../../data/prismel.db");
export const sqlite: Database = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
