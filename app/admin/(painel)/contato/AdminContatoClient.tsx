"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContatoConfig, ContatoLink } from "@/lib/contato";
import { TIPOS_LINK, ContatoIcon } from "@/lib/contatoIcons";

interface Props {
  initialData: ContatoConfig;
}

function newLink(): ContatoLink {
  return {
    id: `link-${Date.now()}`,
    tipo: "website",
    label: "",
    url: "",
  };
}

export default function AdminContatoClient({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ContatoConfig>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function markDirty() {
    setSaved(false);
  }

  // Links
  function updateLink(id: string, field: keyof ContatoLink, value: string) {
    setForm((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
    markDirty();
  }

  function addLink() {
    setForm((prev) => ({ ...prev, links: [...prev.links, newLink()] }));
    markDirty();
  }

  function removeLink(id: string) {
    setForm((prev) => ({ ...prev, links: prev.links.filter((l) => l.id !== id) }));
    markDirty();
  }

  function moveLink(idx: number, dir: -1 | 1) {
    const links = [...form.links];
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    [links[idx], links[target]] = [links[target], links[idx]];
    setForm((prev) => ({ ...prev, links }));
    markDirty();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/contato", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* Intro */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">Texto de abertura</h2>
        <textarea
          rows={2}
          value={form.intro}
          onChange={(e) => { setForm((p) => ({ ...p, intro: e.target.value })); markDirty(); }}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none"
        />
      </section>

      {/* Links */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">Links de contato</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Arraste com as setas para reordenar</p>
          </div>
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar link
          </button>
        </div>

        {form.links.length === 0 && (
          <div className="text-center py-8 text-sm text-[#9CA3AF] border border-dashed border-[#E5E7EB] rounded-lg">
            Nenhum link adicionado. Clique em &quot;Adicionar link&quot; para começar.
          </div>
        )}

        <div className="space-y-2">
          {form.links.map((link, idx) => (
            <div
              key={link.id}
              className="flex items-start gap-2 p-3 bg-[#F8F8FA] rounded-xl border border-[#E5E7EB]"
            >
              {/* Ícone preview */}
              <div className="mt-1 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <ContatoIcon tipo={link.tipo} className="w-4 h-4 text-purple-600" />
              </div>

              {/* Campos */}
              <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                {/* Tipo */}
                <select
                  value={link.tipo}
                  onChange={(e) => updateLink(link.id, "tipo", e.target.value)}
                  className="border border-[#E5E7EB] bg-white rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                >
                  {TIPOS_LINK.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Label */}
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, "label", e.target.value)}
                  placeholder="Texto exibido"
                  className="border border-[#E5E7EB] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                />

                {/* URL */}
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, "url", e.target.value)}
                  placeholder="URL ou mailto:"
                  className="border border-[#E5E7EB] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                />
              </div>

              {/* Controles */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveLink(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Mover para cima"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(idx, 1)}
                  disabled={idx === form.links.length - 1}
                  className="p-1 rounded text-[#9CA3AF] hover:text-[#374151] hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Mover para baixo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="mt-1 p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Remover link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <section className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">Formulário de Contato</h2>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">
            ID do Formspree
            <span className="ml-2 font-normal text-[#9CA3AF]">
              (obtenha em{" "}
              <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                formspree.io
              </a>
              )
            </span>
          </label>
          <input
            type="text"
            value={form.formspreeId}
            onChange={(e) => { setForm((p) => ({ ...p, formspreeId: e.target.value })); markDirty(); }}
            placeholder="abcd1234"
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
          />
          <p className="mt-1 text-xs text-[#9CA3AF]">
            O formulário envia para: https://formspree.io/f/{form.formspreeId || "SEU_ID"}
          </p>
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
