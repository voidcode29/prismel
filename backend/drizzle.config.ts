import { defineConfig } from "drizzle-kit";

// Run via workspace scripts only: npm run db:* -w @prismel/backend
// Paths are relative to backend/ (the workspace cwd).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "../data/prismel.db",
  },
});
