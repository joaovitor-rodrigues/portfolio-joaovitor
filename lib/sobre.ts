import { getSupabase } from "./supabase";

export interface Stat {
  valor: string;
  label: string;
}

export interface FotoCrop {
  x: number;
  y: number;
  scale: number;
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

const KEY = "sobre";

export async function get(): Promise<SobreConfig> {
  const { data, error } = await getSupabase()
    .from("config")
    .select("value")
    .eq("key", KEY)
    .single();
  if (error) throw new Error(`Erro ao buscar sobre: ${error.message}`);
  return data.value as SobreConfig;
}

export async function update(input: Partial<SobreConfig>): Promise<SobreConfig> {
  const current = await get();
  const updated = { ...current, ...input };
  const { error } = await getSupabase()
    .from("config")
    .upsert({ key: KEY, value: updated });
  if (error) throw new Error(`Erro ao salvar sobre: ${error.message}`);
  return updated;
}

