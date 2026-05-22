import { getSupabase } from "./supabase";

export interface Pessoa {
  id: string;
  nome: string;
  /** equipe = só aparece em equipe; elenco = só aparece em elenco; ambos = nos dois */
  tipo: "equipe" | "elenco" | "ambos";
  /** IDs das funções que este profissional exerce (para filtro na seção Equipe) */
  funcaoIds: string[];
  fotoUrl?: string;
  instagramUrl?: string;
}

export async function getAll(): Promise<Pessoa[]> {
  const { data, error } = await getSupabase().from("pessoas").select("data");
  if (error) throw new Error(`Erro ao buscar pessoas: ${error.message}`);
  const pessoas = (data ?? []).map((row) => row.data as Pessoa);
  pessoas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return pessoas;
}

export async function getById(id: string): Promise<Pessoa | undefined> {
  const { data, error } = await getSupabase()
    .from("pessoas")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar pessoa: ${error.message}`);
  return data ? (data.data as Pessoa) : undefined;
}

export async function create(
  input: Omit<Pessoa, "id">
): Promise<Pessoa> {
  const nova: Pessoa = { ...input, id: `pessoa-${Date.now()}` };
  const { error } = await getSupabase()
    .from("pessoas")
    .insert({ id: nova.id, data: nova });
  if (error) throw new Error(`Erro ao criar pessoa: ${error.message}`);
  return nova;
}

export async function update(
  id: string,
  input: Partial<Omit<Pessoa, "id">>
): Promise<Pessoa | null> {
  const current = await getById(id);
  if (!current) return null;
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("pessoas")
    .update({ data: updated })
    .eq("id", id);
  if (error) throw new Error(`Erro ao atualizar pessoa: ${error.message}`);
  return updated;
}

export async function remove(id: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("pessoas")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(`Erro ao remover pessoa: ${error.message}`);
  return (count ?? 0) > 0;
}
