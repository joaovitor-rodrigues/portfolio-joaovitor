import fs from "fs";
import path from "path";

export interface Stat {
  valor: string;
  label: string;
}

export interface FotoCrop {
  x: number;     // 0–100, focal point horizontal (%)
  y: number;     // 0–100, focal point vertical (%)
  scale: number; // 1.0–3.0, zoom factor
}

export interface SobreConfig {
  titulo: string;
  paragrafos: string[];
  habilidades: string[];
  stats: Stat[];
  fotoUrl: string;
  fotoCrop?: FotoCrop;
  mostrarBio: boolean;
  mostrarHabilidades: boolean;
  mostrarStats: boolean;
  mostrarFoto: boolean;
}

const filePath = path.join(process.cwd(), "data", "sobre.json");

export function get(): SobreConfig {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SobreConfig;
}

export function update(data: Partial<SobreConfig>): SobreConfig {
  const current = get();
  const updated = { ...current, ...data };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
