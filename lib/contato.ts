import { supabase } from "./supabase";

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

const KEY = "contato";

export async function get(): Promise<ContatoConfig> {
  const { data, error } = await supabase
    .from("config")
    .select("value")
    .eq("key", KEY)
    .single();
  if (error) throw new Error(`Erro ao buscar contato: ${error.message}`);
  return data.value as ContatoConfig;
}

export async function update(input: Partial<ContatoConfig>): Promise<ContatoConfig> {
  const current = await get();
  const updated = { ...current, ...input };
  const { error } = await supabase
    .from("config")
    .upsert({ key: KEY, value: updated });
  if (error) throw new Error(`Erro ao salvar contato: ${error.message}`);
  return updated;
}
