// Seed script — popula o Supabase com os dados dos JSONs locais
// Uso: node scripts/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SUPABASE_URL = "https://flhqrsqregmwiiaxwakk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsaHFyc3FyZWdtd2lpYXh3YWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODI4ODIsImV4cCI6MjA5NDk1ODg4Mn0.IrEtB0Pohn53QYQ-44A_etxWLL15UUFnJNPMfcbfHow";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function readJson(file) {
  return JSON.parse(readFileSync(join(root, "data", file), "utf-8"));
}

async function seed() {
  console.log("🌱 Iniciando seed...\n");

  // --- config: sobre, contato, site ---
  const configs = [
    { key: "sobre", value: readJson("sobre.json") },
    { key: "contato", value: readJson("contato.json") },
    { key: "site", value: readJson("site.json") },
  ];

  for (const cfg of configs) {
    const { error } = await supabase
      .from("config")
      .upsert({ key: cfg.key, value: cfg.value });
    if (error) {
      console.error(`❌ config/${cfg.key}:`, error.message);
    } else {
      console.log(`✅ config/${cfg.key}`);
    }
  }

  // --- categorias ---
  const categorias = readJson("categorias.json");
  for (const cat of categorias) {
    const { error } = await supabase
      .from("categorias")
      .upsert({ id: cat.id, data: cat });
    if (error) {
      console.error(`❌ categoria ${cat.id}:`, error.message);
    } else {
      console.log(`✅ categoria: ${cat.nome}`);
    }
  }

  // --- projetos ---
  const projetos = readJson("projetos.json");
  for (const p of projetos) {
    const { error } = await supabase
      .from("projetos")
      .upsert({ slug: p.slug, data: p });
    if (error) {
      console.error(`❌ projeto ${p.slug}:`, error.message);
    } else {
      console.log(`✅ projeto: ${p.titulo}`);
    }
  }

  console.log("\n✅ Seed concluído!");
}

seed().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
