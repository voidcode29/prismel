import type { Request, Response, NextFunction } from "express";
import { createAliasSchema, updateAliasSchema, generateAliasSchema } from "@prismel/shared";

export function validateCreateAlias(req: Request, res: Response, next: NextFunction) {
  const result = createAliasSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  next();
}

export function validateUpdateAlias(req: Request, res: Response, next: NextFunction) {
  const result = updateAliasSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  next();
}

export function validateGenerateAlias(req: Request, res: Response, next: NextFunction) {
  const result = generateAliasSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  next();
}
