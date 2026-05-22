import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios");
    }
    // Passa cache: "no-store" para todos os fetches do Supabase,
    // impedindo que o Next.js Data Cache sirva respostas antigas do banco.
    _client = createClient(url, key, {
      global: {
        fetch: (input, init = {}) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return _client;
}
