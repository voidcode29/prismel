import express from "express";
import cors from "cors";
import { config } from "./lib/config.js";
import { aliasController } from "./modules/aliases/alias.controller.js";
import {
  validateCreateAlias,
  validateUpdateAlias,
  validateGenerateAlias,
} from "./validators/alias.validator.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { settingsController } from "./modules/settings/settings.controller.js";
import { getSupportedProviders } from "./providers/registry.js";

const app = express();

// Health check (must not depend on any module)
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(cors());
app.use(express.json());

// Alias routes
app.get("/api/aliases", aliasController.getAll);
app.get("/api/aliases/:id", aliasController.getById);
app.post("/api/aliases", validateCreateAlias, aliasController.create);
app.put("/api/aliases/:id", validateUpdateAlias, aliasController.update);
app.delete("/api/aliases/:id", aliasController.delete);
app.post("/api/aliases/generate", validateGenerateAlias, aliasController.generate);
app.post("/api/aliases/sync", aliasController.sync);

// Settings routes
app.get("/api/settings", settingsController.getAll);
app.put("/api/settings", settingsController.update);

// Provider routes
app.get("/api/settings/providers", (_req, res) => {
  res.json(getSupportedProviders());
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
