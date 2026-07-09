import express from "express";
import cors from "cors";
import { config } from "./lib/config";
import { aliasController } from "./modules/aliases/alias.controller";
import {
  validateCreateAlias,
  validateUpdateAlias,
  validateGenerateAlias,
} from "./validators/alias.validator";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

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

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
