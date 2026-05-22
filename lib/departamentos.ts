import { getSupabase } from "./supabase";

export interface DepartamentoEquipe {
  id: string;
  nome: string;
}

export async function getAll(): Promise<DepartamentoEquipe[]> {
  const { data, error } = await getSupabase()
    .from("departamentos_equipe")
    .select("data");
  if (error) throw new Error(`Erro ao buscar departamentos: ${error.message}`);
  const departamentos = (data ?? []).map((row) => row.data as DepartamentoEquipe);
  departamentos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return departamentos;
}

export async function getById(id: string): Promise<DepartamentoEquipe | undefined> {
  const { data, error } = await getSupabase()
    .from("departamentos_equipe")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar departamento: ${error.message}`);
  return data ? (data.data as DepartamentoEquipe) : undefined;
}

export async function create(input: Omit<DepartamentoEquipe, "id">): Promise<DepartamentoEquipe> {
  const novo: DepartamentoEquipe = { ...input, id: `dep-${Date.now()}` };
  const { error } = await getSupabase()
    .from("departamentos_equipe")
    .insert({ id: novo.id, data: novo });
  if (error) throw new Error(`Erro ao criar departamento: ${error.message}`);
  return novo;
}

export async function update(
  id: string,
  input: Partial<Omit<DepartamentoEquipe, "id">>
): Promise<DepartamentoEquipe | null> {
  const current = await getById(id);
  if (!current) return null;
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("departamentos_equipe")
    .update({ data: updated })
    .eq("id", id);
  if (error) throw new Error(`Erro ao atualizar departamento: ${error.message}`);
  return updated;
}

export async function remove(id: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from("departamentos_equipe")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(`Erro ao remover departamento: ${error.message}`);
  return (count ?? 0) > 0;
}
