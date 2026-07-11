import { db } from "../../db";
import { settings } from "../../db/schema";
import { eq } from "drizzle-orm";

export const settingsRepository = {
  get(key: string): string | undefined {
    const row = db.select().from(settings).where(eq(settings.key, key)).get();
    return row?.value;
  },

  getAll(): Record<string, string> {
    const rows = db.select().from(settings).all();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },

  set(key: string, value: string): void {
    db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } })
      .run();
  },

  setMany(entries: Record<string, string>): void {
    for (const [key, value] of Object.entries(entries)) {
      this.set(key, value);
    }
  },
};
