import { OvhClient } from "./ovh/ovh.client";
import { mapRedirectionToAlias, type OvhRedirection } from "./ovh/ovh.mapper";
import type { Alias } from "@prismel/shared";

export interface ProviderClient {
  readonly name: string;
  /** Create a redirection, returns the provider-specific ID */
  createRedirection(domain: string, from: string, to: string): Promise<string>;
  /** Delete a redirection */
  deleteRedirection(domain: string, providerId: string): Promise<void>;
  /** Verify a redirection was deleted (throws if it still exists) */
  verifyDeleted(domain: string, providerId: string): Promise<void>;
  /** Update a redirection destination */
  updateRedirection(domain: string, providerId: string, to: string): Promise<void>;
  /** List all redirection IDs for a domain */
  listRedirectionIds(domain: string): Promise<number[]>;
  /** Get a single redirection detail */
  getRedirection(domain: string, providerId: string): Promise<{ id: number; from: string; to: string }>;
  /** Map a raw redirection to an Alias */
  mapToAlias(domain: string, raw: { id: number; from: string; to: string }): Alias;
}

class OvhProviderClient implements ProviderClient {
  readonly name = "OVH";
  private client = new OvhClient();

  async createRedirection(domain: string, from: string, to: string): Promise<string> {
    await this.client.request("POST", `/email/domain/${domain}/redirection`, { from, to, localCopy: false });
    const ids = await this.client.request<number[]>(
      "GET",
      `/email/domain/${domain}/redirection?from=${encodeURIComponent(from)}`,
    );
    if (!ids || ids.length === 0) throw new Error("Redirection created but not found in provider listing");
    return String(ids[0]);
  }

  async deleteRedirection(domain: string, providerId: string): Promise<void> {
    await this.client.request("DELETE", `/email/domain/${domain}/redirection/${providerId}`);
  }

  async verifyDeleted(domain: string, providerId: string): Promise<void> {
    try {
      await this.client.request("GET", `/email/domain/${domain}/redirection/${providerId}`);
      throw new Error(`Redirection ${providerId} still exists after delete`);
    } catch (e) {
      if ((e as Error).message.includes("still exists")) throw e;
      // Any other error (including 404) means it's gone
    }
  }

  async updateRedirection(domain: string, providerId: string, to: string): Promise<void> {
    await this.client.request("PUT", `/email/domain/${domain}/redirection/${providerId}`, { to });
  }

  async listRedirectionIds(domain: string): Promise<number[]> {
    return this.client.request<number[]>("GET", `/email/domain/${domain}/redirection`);
  }

  async getRedirection(domain: string, providerId: string): Promise<{ id: number; from: string; to: string }> {
    return this.client.request<OvhRedirection>("GET", `/email/domain/${domain}/redirection/${providerId}`);
  }

  mapToAlias(domain: string, raw: { id: number; from: string; to: string }): Alias {
    return mapRedirectionToAlias(domain, raw as OvhRedirection);
  }
}

const providers: Record<string, ProviderClient> = {
  OVH: new OvhProviderClient(),
};

export function getProviderClient(name: string): ProviderClient | undefined {
  return providers[name];
}

export function getSupportedProviders(): string[] {
  return Object.keys(providers);
}
