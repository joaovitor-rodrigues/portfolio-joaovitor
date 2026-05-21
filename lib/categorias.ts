import fs from "fs";
import path from "path";

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  slug: string;
}

const filePath = path.join(process.cwd(), "data", "categorias.json");

function readFile(): Categoria[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Categoria[];
}

function writeFile(data: Categoria[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getAll(): Categoria[] {
  return readFile();
}

export function getBySlug(slug: string): Categoria | undefined {
  return readFile().find((c) => c.slug === slug);
}

export function getById(id: string): Categoria | undefined {
  return readFile().find((c) => c.id === id);
}

export function create(data: Omit<Categoria, "id">): Categoria {
  const all = readFile();
  const newCat: Categoria = {
    ...data,
    id: `cat-${Date.now()}`,
  };
  all.push(newCat);
  writeFile(all);
  return newCat;
}

export function update(id: string, data: Partial<Omit<Categoria, "id">>): Categoria | null {
  const all = readFile();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data };
  writeFile(all);
  return all[idx];
}

export function remove(id: string): boolean {
  const all = readFile();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  writeFile(filtered);
  return true;
}
