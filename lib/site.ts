import fs from "fs";
import path from "path";

export interface SiteConfig {
  siteUrl: string;
  heroTitulo: string;
  heroSubtitulo: string;
  heroCta1Label: string;
  heroCta2Label: string;
  metaTitle: string;
  metaDescription: string;
}

const filePath = path.join(process.cwd(), "data", "site.json");

export function get(): SiteConfig {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SiteConfig;
}

export function update(data: Partial<SiteConfig>): SiteConfig {
  const current = get();
  const updated = { ...current, ...data };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
