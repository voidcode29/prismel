import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const aliases = sqliteTable("aliases", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  provider: text("provider").notNull().default("ovh"),
  providerId: text("provider_id").notNull(),
  domain: text("domain").notNull(),
  destination: text("destination"),
  serviceName: text("service_name"),
  description: text("description"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastSyncAt: text("last_sync_at"),
});
