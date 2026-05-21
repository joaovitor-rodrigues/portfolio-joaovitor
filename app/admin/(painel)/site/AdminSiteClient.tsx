"use client";

import { useState } from "react";
import type { SiteConfig } from "@/lib/site";

interface Props {
  initialData: SiteConfig;
}

export default function AdminSiteClient({ initialData }: Props) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof SiteConfig, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Hero */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">Seção Hero</h2>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            Título principal
            <span className="ml-2 font-normal text-[#9CA3AF]">(use \n para quebrar linha)</span>
          </label>
          <textarea
            rows={3}
            value={form.heroTitulo}
            onChange={(e) => set("heroTitulo", e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Subtítulo</label>
          <textarea
            rows={2}
            value={form.heroSubtitulo}
            onChange={(e) => set("heroSubtitulo", e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Botão primário</label>
            <input
              type="text"
              value={form.heroCta1Label}
              onChange={(e) => set("heroCta1Label", e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">Botão secundário</label>
            <input
              type="text"
              value={form.heroCta2Label}
              onChange={(e) => set("heroCta2Label", e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
            />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">SEO / Metadados</h2>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Título da aba (meta title)</label>
          <input
            type="text"
            value={form.metaTitle}
            onChange={(e) => set("metaTitle", e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Descrição (meta description)</label>
          <textarea
            rows={2}
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none"
          />
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Salvo com sucesso</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}
