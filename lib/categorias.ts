import { getSupabase } from "./supabase";

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  slug: string;
}

export async function getAll(): Promise<Categoria[]> {
  const { data, error } = await getSupabase()
    .from("categorias")
    .select("data");
  if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`);
  return (data ?? []).map((row) => row.data as Categoria);
}

export async function getBySlug(slug: string): Promise<Categoria | undefined> {
  const all = await getAll();
  return all.find((c) => c.slug === slug);
}

export async function getById(id: string): Promise<Categoria | undefined> {
  const { data, error } = await getSupabase()
    .from("categorias")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar categoria: ${error.message}`);
  return data ? (data.data as Categoria) : undefined;
}

export async function create(input: Omit<Categoria, "id">): Promise<Categoria> {
  const nova: Categoria = { ...input, id: `cat-${Date.now()}` };
  const { error } = await getSupabase()
    .from("categorias")
    .insert({ id: nova.id, data: nova });
  if (error) throw new Error(`Erro ao criar categoria: ${error.message}`);
  return nova;
}

export async function update(
  id: string,
  input: Partial<Omit<Categoria, "id">>
): Promise<Categoria | null> {
  const current = await getById(id);
  if (!current) return null;
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("categorias")
    .update({ data: updated })
    .eq("id", id);
  if (error) throw new Error(`Erro ao atualizar categoria: ${error.message}`);
  return updated;
}

export async function remove(id: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("categorias")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(`Erro ao remover categoria: ${error.message}`);
  return (count ?? 0) > 0;
}

