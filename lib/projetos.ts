import { getSupabase } from "./supabase";

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
  festivalId?: string;
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

function normalize(p: Projeto): Projeto {
  const base = {
    ...p,
    festivais: p.festivais ?? [],
    premios: p.premios ?? [],
    mostrarFestivais: p.mostrarFestivais ?? true,
    mostrarPremios: p.mostrarPremios ?? true,
    categorias: p.categorias ?? [],
  };
  if (base.categorias.length === 0 && base.categoriaId) {
    base.categorias = [base.categoriaId];
  }
  return base;
}

export async function getAll(filters?: {
  destaque?: boolean;
}): Promise<Projeto[]> {
  const { data, error } = await getSupabase().from("projetos").select("data");
  if (error) throw new Error(`Erro ao buscar projetos: ${error.message}`);

  let projetos = (data ?? []).map((row) => normalize(row.data as Projeto));

  if (filters?.destaque !== undefined) {
    projetos = projetos.filter((p) => p.destaque === filters.destaque);
  }

  // Ordena por criadoEm decrescente
  projetos.sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  return projetos;
}

export async function getBySlug(slug: string): Promise<Projeto | undefined> {
  const { data, error } = await getSupabase()
    .from("projetos")
    .select("data")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar projeto: ${error.message}`);
  return data ? normalize(data.data as Projeto) : undefined;
}

export async function create(
  input: Omit<Projeto, "criadoEm"> &
    Partial<Pick<Projeto, "festivais" | "premios" | "mostrarFestivais" | "mostrarPremios">>
): Promise<Projeto> {
  const novo: Projeto = { ...input, criadoEm: new Date().toISOString() };
  const { error } = await getSupabase()
    .from("projetos")
    .insert({ slug: novo.slug, data: novo });
  if (error) throw new Error(`Erro ao criar projeto: ${error.message}`);
  return novo;
}

export async function update(
  slug: string,
  input: Partial<Projeto>
): Promise<Projeto | null> {
  const current = await getBySlug(slug);
  if (!current) return null;
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("projetos")
    .update({ data: updated })
    .eq("slug", slug);
  if (error) throw new Error(`Erro ao atualizar projeto: ${error.message}`);
  return updated;
}

export async function remove(slug: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("projetos")
    .delete({ count: "exact" })
    .eq("slug", slug);
  if (error) throw new Error(`Erro ao remover projeto: ${error.message}`);
  return (count ?? 0) > 0;
}

