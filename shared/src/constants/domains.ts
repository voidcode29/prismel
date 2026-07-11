export const ALIAS_DOMAINS = ["tical.fr", "marzin.org"] as const;

export type AliasDomain = (typeof ALIAS_DOMAINS)[number];

export const DOMAIN_PROVIDERS: Record<string, string> = {
  "tical.fr": "ovh",
};
