export const CATEGORIES = ["cloud", "ai", "devtools", "database", "analytics", "productivity", "customer-support", "sales-marketing", "finance", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STAGES = ["pre-seed", "seed", "series-a", "any"] as const;
export type Stage = (typeof STAGES)[number];

export interface Credit {
  slug: string;
  provider: string;
  program: string;
  category: Category;
  value: string;
  valueUsd: number | null;
  duration: string;
  eligibility: string;
  stages: Stage[];
  requirements: string[];
  howToApply: string;
  applyUrl: string;
  website: string;
  tags: string[];
  notes?: string;
  updated: string;
  sourceUrl: string;
}
