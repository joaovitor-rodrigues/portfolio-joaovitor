import fs from "fs";
import path from "path";

export interface Festival {
  id: string;
  nome: string;
  edicao: string;
  resultado: string;
}

export interface Premio {
  id: string;
  nome: string;
  categoria: string;
  ano: string;
  festivalId?: string; // vínculo opcional com um festival do mesmo projeto
}

export interface Projeto {
  slug: string;
  titulo: string;
  funcaoRealizada: string;
  formato: string[];
  ano: number;
  duracao: string;
  genero: string;
  /** @deprecated use categorias[] */
  categoriaId?: string;
  categorias: string[];
  descricaoCurta: string;
  descricaoLonga: string;
  thumb: string;
  galeria: string[];
  videoUrl: string;
  destaque: boolean;
  publicado: boolean;
  criadoEm: string;
  festivais: Festival[];
  premios: Premio[];
  mostrarFestivais: boolean;
  mostrarPremios: boolean;
}

const filePath = path.join(process.cwd(), "data", "projetos.json");

function readFile(): Projeto[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as Projeto[];
  // garante compatibilidade com projetos criados antes desses campos existirem
  return data.map((p) => {
    const base = {
      ...p,
      festivais: p.festivais ?? [],
      premios: p.premios ?? [],
      mostrarFestivais: p.mostrarFestivais ?? true,
      mostrarPremios: p.mostrarPremios ?? true,
      categorias: p.categorias ?? [],
    };
    // migra categoriaId legado → categorias[]
    if (base.categorias.length === 0 && base.categoriaId) {
      base.categorias = [base.categoriaId];
    }
    return base;
  });
}

function writeFile(data: Projeto[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getAll(filters?: { categoriaSlug?: string; destaque?: boolean }): Projeto[] {
  let all = readFile();
  if (filters?.destaque !== undefined) {
    all = all.filter((p) => p.destaque === filters.destaque);
  }
  return all;
}

export function getBySlug(slug: string): Projeto | undefined {
  return readFile().find((p) => p.slug === slug);
}

export function create(data: Omit<Projeto, "criadoEm"> & Partial<Pick<Projeto, "festivais" | "premios" | "mostrarFestivais" | "mostrarPremios">>): Projeto {
  const all = readFile();
  const newProjeto: Projeto = {
    ...data,
    criadoEm: new Date().toISOString(),
  };
  all.push(newProjeto);
  writeFile(all);
  return newProjeto;
}

export function update(slug: string, data: Partial<Projeto>): Projeto | null {
  const all = readFile();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data };
  writeFile(all);
  return all[idx];
}

export function remove(slug: string): boolean {
  const all = readFile();
  const filtered = all.filter((p) => p.slug !== slug);
  if (filtered.length === all.length) return false;
  writeFile(filtered);
  return true;
}
