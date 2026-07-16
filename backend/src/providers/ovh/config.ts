import { settingsRepository } from "../../modules/settings/settings.repository.js";

export function getOvhConfig() {
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
}

export function seedOvhFromEnv() {
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
}
