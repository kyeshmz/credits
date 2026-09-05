import data from "./credits.json" with { type: "json" };
import { CATEGORIES, STAGES, type Category, type Credit, type Stage } from "./types.ts";

const categorySet = new Set<string>(CATEGORIES);
const stageSet = new Set<string>(STAGES);
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function fail(slug: string, field: string): never {
  throw new Error(`Invalid credit ${slug}: ${field}`);
}

function stringField(record: Record<string, unknown>, slug: string, field: string): string {
  const value = record[field];
  if (typeof value !== "string") fail(slug, field);
  return value;
}

function stringArrayField(record: Record<string, unknown>, slug: string, field: string): string[] {
  const value = record[field];
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === "string")) fail(slug, field);
  return value;
}

export function assertCredits(value: unknown): asserts value is Credit[] {
  if (!Array.isArray(value)) throw new Error("Invalid credits: root must be an array");
  const slugs = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) throw new Error("Invalid credit: entry must be an object");
    const record = item as Record<string, unknown>;
    const slugValue = record.slug;
    const slug = typeof slugValue === "string" ? slugValue : "<unknown>";
    if (typeof slugValue !== "string" || !slugPattern.test(slug)) fail(slug, "slug");
    if (slugs.has(slug)) fail(slug, "slug (duplicate)");
    slugs.add(slug);
    for (const field of ["provider", "program", "value", "duration", "eligibility", "howToApply", "applyUrl", "website", "updated", "sourceUrl"]) stringField(record, slug, field);
    const category = record.category;
    if (typeof category !== "string" || !categorySet.has(category)) fail(slug, "category");
    const valueUsd = record.valueUsd;
    if (valueUsd !== null && (typeof valueUsd !== "number" || !Number.isInteger(valueUsd) || valueUsd < 0)) fail(slug, "valueUsd");
    const stages = record.stages;
    if (!Array.isArray(stages) || !stages.every((stage): stage is string => typeof stage === "string" && stageSet.has(stage))) fail(slug, "stages");
    stringArrayField(record, slug, "requirements");
    stringArrayField(record, slug, "tags");
    const updated = record.updated;
    if (typeof updated !== "string" || !datePattern.test(updated)) fail(slug, "updated");
    if (record.notes !== undefined && typeof record.notes !== "string") fail(slug, "notes");
  }
}

const raw: unknown = data;
assertCredits(raw);

export const credits: Credit[] = [...raw].sort((a, b) => a.provider.localeCompare(b.provider) || a.program.localeCompare(b.program));
export const categories: Category[] = CATEGORIES.filter((category) => credits.some((credit) => credit.category === category));

export function getCredit(slug: string): Credit | undefined {
  return credits.find((credit) => credit.slug === slug);
}

export function creditsByCategory(category: Category): Credit[] {
  return credits.filter((credit) => credit.category === category);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  cloud: "Cloud",
  ai: "AI",
  devtools: "Devtools",
  database: "Database",
  analytics: "Analytics",
  productivity: "Productivity",
  "customer-support": "Customer Support",
  "sales-marketing": "Sales & Marketing",
  finance: "Finance",
  other: "Other"
};

export const STAGE_LABELS: Record<Stage, string> = {
  "pre-seed": "Pre-seed",
  seed: "Seed",
  "series-a": "Series A",
  any: "Any stage"
};

export * from "./types.ts";
