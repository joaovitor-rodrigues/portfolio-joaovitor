import { supabase } from "./supabase";

export interface SiteConfig {
  siteUrl: string;
  heroTitulo: string;
  heroSubtitulo: string;
  heroCta1Label: string;
  heroCta2Label: string;
  metaTitle: string;
  metaDescription: string;
}

const KEY = "site";

export async function get(): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from("config")
    .select("value")
    .eq("key", KEY)
    .single();
  if (error) throw new Error(`Erro ao buscar site: ${error.message}`);
  return data.value as SiteConfig;
}

export async function update(input: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await get();
  const updated = { ...current, ...input };
  const { error } = await supabase
    .from("config")
    .upsert({ key: KEY, value: updated });
  if (error) throw new Error(`Erro ao salvar site: ${error.message}`);
  return updated;
}
