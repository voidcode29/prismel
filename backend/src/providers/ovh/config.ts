import { settingsRepository } from "../../modules/settings/settings.repository.js";

export function getOvhConfig() {
  return {
    endpoint: settingsRepository.get("ovh_endpoint") || "eu.api.ovh.com",
    applicationKey: settingsRepository.get("ovh_application_key") || "",
    applicationSecret: settingsRepository.get("ovh_application_secret") || "",
    consumerKey: settingsRepository.get("ovh_consumer_key") || "",
  };
}
