import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { resolve } from "path";

const dbPath = resolve(import.meta.dirname, "../../../data/prismel.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: resolve(import.meta.dirname, "./migrations") });
console.log("Migrations applied");
sqlite.close();
