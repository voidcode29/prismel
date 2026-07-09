export const ALIAS_DOMAINS = ["tical.fr", "marzin.org"] as const;

export type AliasDomain = (typeof ALIAS_DOMAINS)[number];
