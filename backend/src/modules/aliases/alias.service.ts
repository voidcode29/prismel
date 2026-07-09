import { aliasRepository } from "./alias.repository";
import { OvhClient } from "../../providers/ovh/ovh.client";
import { mapOvhAliasToInternal } from "../../providers/ovh/ovh.mapper";
import type { Alias, CreateAliasInput, UpdateAliasInput, GeneratedAlias } from "@prismel/shared";
import { generateAlias, isDomainValid } from "./alias.generator";
import crypto from "crypto";

const ovhClient = new OvhClient();

export const aliasService = {
  getAll(): Alias[] {
    return aliasRepository.findAll();
  },

  getById(id: string): Alias | undefined {
    return aliasRepository.findById(id);
  },

  async create(input: CreateAliasInput): Promise<Alias> {
    // 1. Create alias at OVH provider
    const [account, domain] = input.email.split("@");
    const ovhResult = await ovhClient.request<{ id: string }>("POST", `/email/domain/${domain}/account/${account}/alias`, {
      alias: account,
      destination: input.email,
    });

    // 2. Map and save locally
    const now = new Date().toISOString();
    const alias: Alias = {
      id: crypto.randomUUID(),
      email: input.email,
      provider: "ovh",
      providerId: ovhResult.id,
      domain: input.domain,
      serviceName: input.serviceName,
      description: input.description,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    return aliasRepository.create(alias);
  },

  async update(id: string, input: UpdateAliasInput): Promise<Alias | undefined> {
    const existing = aliasRepository.findById(id);
    if (!existing) return undefined;

    // Update at OVH if email changed
    if (input.email && input.email !== existing.email) {
      await ovhClient.request("PUT", `/email/domain/${existing.domain}/account/${existing.providerId}/alias/${existing.providerId}`, {
        alias: input.email.split("@")[0],
      });
    }

    const updated = aliasRepository.update(id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const alias = aliasRepository.findById(id);
    if (!alias) return false;

    // Delete from OVH
    await ovhClient.request("DELETE", `/email/domain/${alias.domain}/account/${alias.providerId}/alias/${alias.providerId}`);

    // Delete locally
    return aliasRepository.delete(id);
  },

  generate(domain: string): GeneratedAlias | null {
    if (!isDomainValid(domain)) return null;
    return generateAlias(domain);
  },

  async sync(): Promise<{ synced: number }> {
    // Stub: fetch from OVH and reconcile with local DB
    // TODO: implement full OVH listing + diff
    return { synced: 0 };
  },
};
