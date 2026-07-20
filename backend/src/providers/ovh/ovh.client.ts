import { getOvhConfig } from "./config.js";
import crypto from "crypto";

export class OvhApiError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`Provider API error: ${status} ${body}`);
    this.name = "OvhApiError";
    this.status = status;
  }
}

export class OvhClient {
  private get baseUrl(): string {
    const cfg = getOvhConfig();
    return `https://${cfg.endpoint}/1.0`;
  }

  private sign(method: string, path: string, body: string): string {
    const cfg = getOvhConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha1")
      .update(
        `${cfg.applicationSecret}+${cfg.consumerKey}+${method}+${this.baseUrl}${path}+${body}+${timestamp}`
      )
      .digest("hex");
    return `$1$${signature}`;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const cfg = getOvhConfig();
    const bodyStr = body ? JSON.stringify(body) : "";
    const signature = this.sign(method, path, bodyStr);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Ovh-Application": cfg.applicationKey,
          "X-Ovh-Timestamp": timestamp,
          "X-Ovh-Signature": signature,
          "X-Ovh-Consumer": cfg.consumerKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        throw new OvhApiError(
          response.status,
          "The OVH API endpoint returned HTML instead of JSON. Check the 'ovh_endpoint' setting — it should be 'eu.api.ovh.com' (without https:// or /1.0)."
        );
      }

      if (!response.ok) {
        const error = await response.text();
        if (error.startsWith("<!DOCTYPE html") || error.startsWith("<html")) {
          throw new OvhApiError(
            response.status,
            "The OVH API endpoint returned HTML instead of JSON. Check the 'ovh_endpoint' setting — it should be 'eu.api.ovh.com' (without https:// or /1.0)."
          );
        }
        throw new OvhApiError(response.status, error);
      }

      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  static async test(): Promise<{ success: true }> {
    const client = new OvhClient();
    const cfg = getOvhConfig();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = client.sign("GET", "/me", "");
    const response = await fetch(`${client.baseUrl}/me`, {
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": cfg.applicationKey,
        "X-Ovh-Timestamp": timestamp,
        "X-Ovh-Signature": signature,
        "X-Ovh-Consumer": cfg.consumerKey,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new OvhApiError(response.status, body);
    }
    return { success: true };
  }

  static async testWith(config: {
    endpoint: string;
    applicationKey: string;
    applicationSecret: string;
    consumerKey: string;
  }): Promise<{ success: true }> {
    const baseUrl = `https://${config.endpoint}/1.0`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha1")
      .update(
        `${config.applicationSecret}+${config.consumerKey}+GET+${baseUrl}/me++${timestamp}`
      )
      .digest("hex");
    const response = await fetch(`${baseUrl}/me`, {
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": config.applicationKey,
        "X-Ovh-Timestamp": timestamp,
        "X-Ovh-Signature": `$1$${signature}`,
        "X-Ovh-Consumer": config.consumerKey,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new OvhApiError(response.status, body);
    }
    return { success: true };
  }
}
