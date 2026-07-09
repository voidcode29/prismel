import { ALIAS_DOMAINS } from "@prismel/shared";
import type { GeneratedAlias } from "@prismel/shared";
import crypto from "crypto";

const adjectives = [
  "green", "silent", "bold", "swift", "calm", "bright", "dark", "golden",
  "quick", "quiet", "wild", "mild", "cool", "warm", "fresh", "deep",
];

const nouns = [
  "otter", "river", "moon", "star", "cloud", "wolf", "hawk", "stone",
  "lake", "pine", "fox", "bear", "deer", "bird", "fish", "tree",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generateAlias(domain: string): GeneratedAlias {
  const adj = randomItem(adjectives);
  const noun = randomItem(nouns);
  const digits = randomDigits(3);
  const prefix = `${adj}-${noun}-${digits}`;
  const email = `${prefix}@${domain}`;

  return { prefix, domain, email };
}

export function isDomainValid(domain: string): boolean {
  return ALIAS_DOMAINS.includes(domain as never);
}
