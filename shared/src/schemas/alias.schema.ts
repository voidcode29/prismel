import { z } from "zod";

export const createAliasSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  email: z.string().min(1).optional(),
  serviceName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateAliasSchema = z.object({
  email: z.string().min(1).optional(),
  serviceName: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const generateAliasSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

export type CreateAliasRequest = z.infer<typeof createAliasSchema>;
export type UpdateAliasRequest = z.infer<typeof updateAliasSchema>;
export type GenerateAliasRequest = z.infer<typeof generateAliasSchema>;
