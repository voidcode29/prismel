import { config } from "../../lib/config";
import crypto from "crypto";

export class OvhClient {
  private baseUrl: string;
  private timeout: number;

  constructor(timeout = 15000) {
    this.baseUrl = `https://${config.ovh.endpoint}/1.0`;
    this.timeout = timeout;
  }

  private sign(method: string, path: string, body: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha1")
      .update(
        `${config.ovh.applicationSecret}+${config.ovh.consumerKey}+${method}+${this.baseUrl}${path}+${body}+${timestamp}`
      )
      .digest("hex");
    return `$1$${signature}`;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const bodyStr = body ? JSON.stringify(body) : "";
    const signature = this.sign(method, path, bodyStr);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Ovh-Application": config.ovh.applicationKey,
          "X-Ovh-Timestamp": timestamp,
          "X-Ovh-Signature": signature,
          "X-Ovh-Consumer": config.ovh.consumerKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OVH API error: ${response.status} ${error}`);
      }

      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }
}
