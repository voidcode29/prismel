import crypto from "crypto";
import type { Alias } from "@prismel/shared";

export interface OvhAliasResponse {
  id: string;
  domain: string;
  destination: string;
  account: string;
}

export function mapOvhAliasToInternal(ovh: OvhAliasResponse): Alias {
  return {
    id: crypto.randomUUID(),
    email: `${ovh.account}@${ovh.domain}`,
    provider: "ovh",
    providerId: ovh.id,
    domain: ovh.domain,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
