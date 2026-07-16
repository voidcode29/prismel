import type { Request, Response } from "express";
import { settingsService } from "./settings.service.js";

export const settingsController = {
  getAll(_req: Request, res: Response) {
    const data = settingsService.getAll();
    res.json(data);
  },

  update(req: Request, res: Response) {
    const data = settingsService.update(req.body);
    res.json(data);
  },
};
