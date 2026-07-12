import { settingsRepository } from "./settings.repository";

export const settingsService = {
  getAll() {
    return settingsRepository.getAll();
  },

  update(data: Record<string, string>) {
    settingsRepository.setMany(data);
    return settingsRepository.getAll();
  },

  /** Seed settings from .env if not already set */
  seedFromEnv() {
    const envMap: Record<string, string> = {
      ovh_endpoint: process.env.OVH_ENDPOINT || "eu.api.ovh.com",
      ovh_application_key: process.env.OVH_APPLICATION_KEY || "",
      ovh_application_secret: process.env.OVH_APPLICATION_SECRET || "",
      ovh_consumer_key: process.env.OVH_CONSUMER_KEY || "",
    };
    for (const [key, value] of Object.entries(envMap)) {
      if (value && !settingsRepository.get(key)) {
        settingsRepository.set(key, value);
      }
    }
  },

  getOvhConfig() {
    return {
      endpoint:
        settingsRepository.get("ovh_endpoint") ||
        process.env.OVH_ENDPOINT ||
        "eu.api.ovh.com",
      applicationKey:
        settingsRepository.get("ovh_application_key") ||
        process.env.OVH_APPLICATION_KEY ||
        "",
      applicationSecret:
        settingsRepository.get("ovh_application_secret") ||
        process.env.OVH_APPLICATION_SECRET ||
        "",
      consumerKey:
        settingsRepository.get("ovh_consumer_key") ||
        process.env.OVH_CONSUMER_KEY ||
        "",
    };
  },

  getRedirectTargets(): string[] {
    const raw = settingsRepository.get("redirect_targets");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
};
