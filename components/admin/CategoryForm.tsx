"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#7C3AED");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setNome(val);
    if (!slugManual) setSlug(slugify(val));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugManual(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim() || !slug.trim()) {
      setError("Nome e slug são obrigatórios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cor, slug }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar");
      }
      setNome("");
      setCor("#7C3AED");
      setSlug("");
      setSlugManual(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 bg-[#F8F8FA] rounded-lg border border-[#E5E7EB]">
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={handleNomeChange}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-40"
          placeholder="Ex: Fotografia"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={handleSlugChange}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-36 font-mono"
          placeholder="fotografia"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Cor</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            className="w-10 h-9 rounded border border-[#E5E7EB] cursor-pointer"
          />
          <span className="text-xs text-[#6B7280] font-mono">{cor}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Criando..." : "+ Nova Categoria"}
        </button>
      </div>
    </form>
  );
}
