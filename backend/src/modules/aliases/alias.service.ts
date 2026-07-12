import { aliasRepository } from "./alias.repository";
import { OvhClient } from "../../providers/ovh/ovh.client";
import { mapRedirectionToAlias, type OvhRedirection } from "../../providers/ovh/ovh.mapper";
import type { Alias, CreateAliasInput, UpdateAliasInput, GeneratedAlias, SyncResult } from "@prismel/shared";
import { generateAlias, isDomainValid } from "./alias.generator";
import { ALIAS_DOMAINS, DOMAIN_PROVIDERS } from "@prismel/shared";
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
    const [, domain] = input.email.split("@");
    const destination = input.destination || input.email;

    // Create redirection at OVH
    try {
      await ovhClient.request("POST", `/email/domain/${domain}/redirection`, {
        from: input.email,
        to: destination,
        localCopy: false,
      });
    } catch (e) {
      throw new Error(`OVH create redirection failed: ${(e as Error).message}`);
    }

    const now = new Date().toISOString();
    const alias: Alias = {
      id: crypto.randomUUID(),
      email: input.email,
      provider: "ovh",
      providerId: "", // will be set on next sync
      domain: input.domain,
      destination,
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

    // Push destination change to OVH if destination changed
    if (input.destination && input.destination !== existing.destination && existing.providerId) {
      try {
        await ovhClient.request(
          "PUT",
          `/email/domain/${existing.domain}/redirection/${existing.providerId}`,
          { to: input.destination },
        );
      } catch (e) {
        throw new Error(`OVH update redirection failed: ${(e as Error).message}`);
      }
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

    // providerId is the numeric OVH redirection ID
    if (alias.providerId) {
      try {
        await ovhClient.request(
          "DELETE",
          `/email/domain/${alias.domain}/redirection/${alias.providerId}`
        );
      } catch (e) {
        console.warn("OVH delete failed:", (e as Error).message);
      }
    }

    return aliasRepository.delete(id);
  },

  generate(domain: string): GeneratedAlias | null {
    if (!isDomainValid(domain)) return null;
    return generateAlias(domain);
  },

  async sync(onLog?: (line: string) => void): Promise<SyncResult> {
    const result: SyncResult = { new: 0, updated: 0, total: 0, errors: [], logs: [] };
    const logs: string[] = [];
    const log = (line: string) => { logs.push(line); if (onLog) onLog(line); };
    const startTime = Date.now();

    log("═══════════════════════════════════════");
    log(`Sync started at ${new Date().toISOString()}`);
    log(`Configured domains: ${ALIAS_DOMAINS.join(", ")}`);
    log("═══════════════════════════════════════");
    log("");

    for (const domain of ALIAS_DOMAINS) {
      const domainStart = Date.now();
      const provider = DOMAIN_PROVIDERS[domain];

      log(`┌─ Domain: ${domain}`);
      log(`│  Provider: ${provider || "none"}`);

      if (!provider) {
        log(`│  → No provider configured for this domain — skipped`);
        log(`└─ Skipped`);
        log("");
        continue;
      }

      if (provider !== "ovh") {
        log(`│  → Provider "${provider}" not yet implemented — skipped`);
        log(`└─ Skipped`);
        log("");
        continue;
      }

      // OVH provider sync
      log(`│  Endpoint: /email/domain/${domain}/redirection`);

      try {
        const redirIds = await ovhClient.request<number[]>(
          "GET",
          `/email/domain/${domain}/redirection`
        );
        const listTime = ((Date.now() - domainStart) / 1000).toFixed(1);
        log(`│  Response: ${redirIds.length} redirection(s) found (took ${listTime}s)`);

        if (redirIds.length === 0) {
          log(`│  → No redirections on this domain`);
          log(`└─ Done (0s)`);
          log("");
          continue;
        }

        let imported = 0;
        let alreadySynced = 0;
        let domainErrors = 0;

        for (let i = 0; i < redirIds.length; i++) {
          const redirId = redirIds[i];
          const progress = `[${i + 1}/${redirIds.length}]`;

          try {
            const redir = await ovhClient.request<OvhRedirection>(
              "GET",
              `/email/domain/${domain}/redirection/${redirId}`
            );

            const providerId = String(redir.id);
            const existing = aliasRepository.findByProviderId(providerId);

            if (!existing) {
              const alias = mapRedirectionToAlias(domain, redir);
              aliasRepository.create(alias);
              result.new++;
              imported++;
              log(`│  ${progress} + NEW  #${redirId}  ${redir.from} → ${redir.to}`);
            } else {
              alreadySynced++;
              if (existing.destination !== redir.to) {
                aliasRepository.update(existing.id, {
                  destination: redir.to,
                  email: redir.from,
                  updatedAt: new Date().toISOString(),
                });
                result.updated++;
                log(`│  ${progress} ↻ UPD  #${redirId}  ${redir.from} → ${redir.to} (was: ${existing.destination})`);
              } else {
                // Skip logging identical entries to keep output lean; uncomment for verbose:
                // log(`│  ${progress} = OK   #${redirId}  ${redir.from}`);
              }
            }
          } catch (e) {
            domainErrors++;
            const msg = `Failed to fetch redirection #${redirId}: ${(e as Error).message}`;
            result.errors.push(msg);
            log(`│  ${progress} ✗ ERR  #${redirId}  ${msg}`);
          }
        }

        const domainTime = ((Date.now() - domainStart) / 1000).toFixed(1);
        log(`│`);
        log(`│  Summary: ${imported} new, ${alreadySynced} existing, ${domainErrors} error(s)`);
        log(`└─ Done (${domainTime}s)`);
        log("");
      } catch (e) {
        const msg = `Failed to list redirections: ${(e as Error).message}`;
        result.errors.push(msg);
        log(`│  ✗ ${msg}`);
        log(`└─ Failed`);
        log("");
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log("═══════════════════════════════════════");
    log(`Sync finished in ${elapsed}s`);
    log(`New: ${result.new}  |  Updated: ${result.updated}  |  Errors: ${result.errors.length}  |  Total in DB: ${aliasRepository.findAll().length}`);
    log("═══════════════════════════════════════");

    result.total = aliasRepository.findAll().length;
    result.logs = logs;
    return result;
  },
};
