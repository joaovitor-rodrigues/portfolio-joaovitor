import fs from "fs";
import path from "path";

export type TipoLink =
  | "email"
  | "instagram"
  | "linkedin"
  | "vimeo"
  | "whatsapp"
  | "youtube"
  | "github"
  | "behance"
  | "twitter"
  | "website";

export interface ContatoLink {
  id: string;
  tipo: TipoLink;
  label: string;
  url: string;
}

export interface ContatoConfig {
  intro: string;
  links: ContatoLink[];
  formspreeId: string;
}

const filePath = path.join(process.cwd(), "data", "contato.json");

export function get(): ContatoConfig {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ContatoConfig;
}

export function update(data: Partial<ContatoConfig>): ContatoConfig {
  const current = get();
  const updated = { ...current, ...data };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
