import { getSupabase } from "./supabase";

export interface FuncaoEquipe {
  id: string;
  nome: string;
}

export async function getAll(): Promise<FuncaoEquipe[]> {
  const { data, error } = await getSupabase()
    .from("funcoes_equipe")
    .select("data");
  if (error) throw new Error(`Erro ao buscar funções: ${error.message}`);
  const funcoes = (data ?? []).map((row) => row.data as FuncaoEquipe);
  funcoes.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return funcoes;
}

export async function getById(id: string): Promise<FuncaoEquipe | undefined> {
  const { data, error } = await getSupabase()
    .from("funcoes_equipe")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar função: ${error.message}`);
  return data ? (data.data as FuncaoEquipe) : undefined;
}

export async function create(input: Omit<FuncaoEquipe, "id">): Promise<FuncaoEquipe> {
  const nova: FuncaoEquipe = { ...input, id: `func-${Date.now()}` };
  const { error } = await getSupabase()
    .from("funcoes_equipe")
    .insert({ id: nova.id, data: nova });
  if (error) throw new Error(`Erro ao criar função: ${error.message}`);
  return nova;
}

export async function update(
  id: string,
  input: Partial<Omit<FuncaoEquipe, "id">>
): Promise<FuncaoEquipe | null> {
  const current = await getById(id);
  if (!current) return null;
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("funcoes_equipe")
    .update({ data: updated })
    .eq("id", id);
  if (error) throw new Error(`Erro ao atualizar função: ${error.message}`);
  return updated;
}

export async function remove(id: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("funcoes_equipe")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(`Erro ao remover função: ${error.message}`);
  return (count ?? 0) > 0;
}
