import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
if (!input) throw new Error("Usage: node scripts/import-csv.mjs /path/to/startup-credits.csv");

const text = fs.readFileSync(input, "utf8");
const rows = parseCsv(text);
const used = new Set();
const credits = rows.map((row, index) => {
  const base = slugify(`${row.Offer || row.Name}-${row.URL}`) || `program-${index + 1}`;
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) slug = `${base}-${suffix++}`;
  used.add(slug);
  const category = mapCategory(row.Category);
  const valueUsd = Number.parseInt(row.Value, 10);
  return {
    slug,
    provider: row.Name.trim(),
    program: row.Offer.trim(),
    category,
    value: row["Value Basis"].trim() || (valueUsd ? `$${valueUsd.toLocaleString("en-US")}` : "See offer"),
    valueUsd: Number.isInteger(valueUsd) && valueUsd > 0 ? valueUsd : null,
    duration: row.Deadline.trim() || "Varies",
    eligibility: row.Eligibility.trim() || "Eligibility varies by offer.",
    stages: mapStages(row.Stages),
    requirements: [row.Eligibility.trim() || "Review the provider's eligibility requirements."],
    howToApply: row["Contact / Apply"].trim() || `Apply through ${row.URL.trim()}.`,
    applyUrl: row.URL.trim(),
    website: new URL(row.URL.trim()).origin + "/",
    tags: [...new Set([category, row.Type.trim().toLowerCase(), ...row.Category.split(/[\s/,&-]+/).filter(Boolean).map((tag) => tag.toLowerCase())])].slice(0, 8),
    ...(row.Notes.trim() || row.Details.trim() || row.Status.trim() ? { notes: [row.Status.trim(), row.Notes.trim(), row.Details.trim()].filter(Boolean).join(". ") } : {}),
    updated: "2026-09-05",
    sourceUrl: row.URL.trim()
  };
});

fs.writeFileSync(path.resolve("packages/credits-data/src/credits.json"), JSON.stringify(credits, null, 2) + "\n");
fs.mkdirSync(path.resolve("migrations"), { recursive: true });
const sql = credits.map((credit) => {
  const values = [credit.slug, credit.provider, credit.program, credit.category, credit.value, credit.valueUsd, credit.duration, credit.eligibility, JSON.stringify(credit.stages), JSON.stringify(credit.requirements), credit.howToApply, credit.applyUrl, credit.website, JSON.stringify(credit.tags), credit.notes ?? null, credit.updated, credit.sourceUrl];
  return `INSERT OR REPLACE INTO credits (slug, provider, program, category, value, value_usd, duration, eligibility, stages, requirements, how_to_apply, apply_url, website, tags, notes, updated, source_url) VALUES (${values.map(sqlValue).join(", ")});`;
}).join("\n");
fs.writeFileSync(path.resolve("migrations/0002_seed_credits.sql"), sql + "\n");
console.log(`Imported ${credits.length} offers`);

function sqlValue(value) { return value === null ? "NULL" : `'${String(value).replaceAll("'", "''")}'`; }
function slugify(value) { return value.toLowerCase().replaceAll("&", " and ").replace(/https?:\/\/|www\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function mapStages(value) {
  const stages = value.toLowerCase();
  const result = ["pre-seed", "seed", "series-a"].filter((stage) => stages.includes(stage.replace("-", " ")) || stages.includes(stage));
  return result.length ? result : ["any"];
}
function mapCategory(value) {
  const category = value.toLowerCase();
  if (/ai|llm|model|inference|voice|compute/.test(category)) return "ai";
  if (/cloud|hosting|infra|edge|cdn/.test(category)) return "cloud";
  if (/database|data platform|sql|nosql|vector/.test(category)) return "database";
  if (/analytic|monitor|observability|marketing|attribution|cdp/.test(category)) return "analytics";
  if (/customer|support|communication|calling|chat/.test(category)) return "customer-support";
  if (/sales|crm|growth|advert|brand/.test(category)) return "sales-marketing";
  if (/finance|fintech|bank|legal|account/.test(category)) return "finance";
  if (/product|design|collab|education|student/.test(category)) return "productivity";
  if (/dev|security|bug|code|api/.test(category)) return "devtools";
  return "other";
}
function parseCsv(input) {
  const records = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i], next = input[i + 1];
    if (quoted && char === '"' && next === '"') { cell += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (!quoted && char === ",") { row.push(cell); cell = ""; continue; }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((part) => part.length)) records.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  if (cell || row.length) { row.push(cell); records.push(row); }
  const [header, ...data] = records;
  return data.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}
