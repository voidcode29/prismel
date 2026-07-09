import type { Request, Response } from "express";
import { aliasService } from "./alias.service";

export const aliasController = {
  async getAll(_req: Request, res: Response) {
    const aliases = aliasService.getAll();
    res.json(aliases);
  },

  async getById(req: Request, res: Response) {
    const alias = aliasService.getById(req.params.id);
    if (!alias) {
      res.status(404).json({ error: "Alias not found" });
      return;
    }
    res.json(alias);
  },

  async create(req: Request, res: Response) {
    try {
      const alias = await aliasService.create(req.body);
      res.status(201).json(alias);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const alias = await aliasService.update(req.params.id, req.body);
      if (!alias) {
        res.status(404).json({ error: "Alias not found" });
        return;
      }
      res.json(alias);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await aliasService.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Alias not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  generate(req: Request, res: Response) {
    const { domain } = req.body;
    const result = aliasService.generate(domain);
    if (!result) {
      res.status(400).json({ error: "Invalid domain" });
      return;
    }
    res.json(result);
  },

  async sync(_req: Request, res: Response) {
    try {
      const result = await aliasService.sync();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
