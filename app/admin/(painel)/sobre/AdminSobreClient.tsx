"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SobreConfig, Stat, FotoCrop } from "@/lib/sobre";
import { resolveImageUrl } from "@/lib/gdrive";
import FotoCropEditor from "@/components/admin/FotoCropEditor";

interface Props {
  initialData: SobreConfig;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${
        checked ? "bg-purple-600" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SectionHeader({
  title,
  description,
  visible,
  onToggle,
}: {
  title: string;
  description: string;
  visible: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wider">{title}</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${visible ? "text-purple-600" : "text-[#9CA3AF]"}`}>
          {visible ? "Visível" : "Oculto"}
        </span>
        <Toggle checked={visible} onChange={onToggle} />
      </div>
    </div>
  );
}

const DEFAULT_CROP: FotoCrop = { x: 50, y: 50, scale: 1 };

export default function AdminSobreClient({ initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SobreConfig>(initialData);
  const [showCrop, setShowCrop] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof SobreConfig>(field: K, value: SobreConfig[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  // Paragraphs helpers
  function updateParagrafo(idx: number, value: string) {
    const updated = [...form.paragrafos];
    updated[idx] = value;
    setField("paragrafos", updated);
  }
  function addParagrafo() {
    setField("paragrafos", [...form.paragrafos, ""]);
  }
  function removeParagrafo(idx: number) {
    setField("paragrafos", form.paragrafos.filter((_, i) => i !== idx));
  }

  // Skills helpers
  function updateHabilidade(idx: number, value: string) {
    const updated = [...form.habilidades];
    updated[idx] = value;
    setField("habilidades", updated);
  }
  function addHabilidade() {
    setField("habilidades", [...form.habilidades, ""]);
  }
  function removeHabilidade(idx: number) {
    setField("habilidades", form.habilidades.filter((_, i) => i !== idx));
  }

  // Stats helpers
  function updateStat(idx: number, key: keyof Stat, value: string) {
    const updated = form.stats.map((s, i) => (i === idx ? { ...s, [key]: value } : s));
    setField("stats", updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/sobre", {
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

      {/* Foto & Título */}
      <section className={`bg-white rounded-xl border transition-colors p-6 space-y-4 ${form.mostrarFoto ? "border-[#E5E7EB]" : "border-[#E5E7EB] opacity-60"}`}>
        <SectionHeader
          title="Foto & identificação"
          description="Título e foto de perfil"
          visible={form.mostrarFoto}
          onToggle={(v) => setField("mostrarFoto", v)}
        />

        <div className={form.mostrarFoto ? "" : "pointer-events-none"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">Título / chamada</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setField("titulo", e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">URL da foto</label>
              <input
                type="url"
                value={form.fotoUrl}
                onChange={(e) => {
                  setField("fotoUrl", e.target.value);
                  // Auto-open crop when a new URL is pasted
                  if (e.target.value) setShowCrop(true);
                }}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                placeholder="https://..."
              />

              {form.fotoUrl && (
                <div className="mt-3">
                  {/* Toggle crop editor */}
                  <button
                    type="button"
                    onClick={() => setShowCrop((v) => !v)}
                    className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium mb-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    {showCrop ? "Ocultar editor de corte" : "Redimensionar / cortar foto"}
                  </button>

                  {showCrop && (
                    <FotoCropEditor
                      src={form.fotoUrl}
                      crop={form.fotoCrop ?? DEFAULT_CROP}
                      onChange={(c) => setField("fotoCrop", c)}
                    />
                  )}

                  {!showCrop && (
                    <img
                      src={resolveImageUrl(form.fotoUrl)}
                      alt="Preview"
                      className="w-24 h-32 object-cover rounded-lg border border-[#E5E7EB]"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className={`bg-white rounded-xl border transition-colors p-6 space-y-4 ${!form.mostrarBio && "opacity-60"}`}>
        <SectionHeader
          title="Biografia"
          description="Parágrafos do texto principal"
          visible={form.mostrarBio}
          onToggle={(v) => setField("mostrarBio", v)}
        />

        <div className={form.mostrarBio ? "" : "pointer-events-none"}>
          {form.paragrafos.map((p, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <textarea
                rows={3}
                value={p}
                onChange={(e) => updateParagrafo(idx, e.target.value)}
                placeholder={`Parágrafo ${idx + 1}`}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none"
              />
              <button
                type="button"
                onClick={() => removeParagrafo(idx)}
                className="self-start p-2 text-[#9CA3AF] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                title="Remover parágrafo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addParagrafo}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            + Adicionar parágrafo
          </button>
        </div>
      </section>

      {/* Habilidades */}
      <section className={`bg-white rounded-xl border transition-colors p-6 space-y-4 ${!form.mostrarHabilidades && "opacity-60"}`}>
        <SectionHeader
          title="Habilidades"
          description="Tags exibidas abaixo da bio"
          visible={form.mostrarHabilidades}
          onToggle={(v) => setField("mostrarHabilidades", v)}
        />

        <div className={form.mostrarHabilidades ? "" : "pointer-events-none"}>
          <div className="grid grid-cols-2 gap-2">
            {form.habilidades.map((h, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={h}
                  onChange={(e) => updateHabilidade(idx, e.target.value)}
                  className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                />
                <button
                  type="button"
                  onClick={() => removeHabilidade(idx)}
                  className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  title="Remover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addHabilidade}
            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            + Adicionar habilidade
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className={`bg-white rounded-xl border transition-colors p-6 space-y-4 ${!form.mostrarStats && "opacity-60"}`}>
        <SectionHeader
          title="Estatísticas"
          description="Números exibidos abaixo da foto"
          visible={form.mostrarStats}
          onToggle={(v) => setField("mostrarStats", v)}
        />

        <div className={form.mostrarStats ? "" : "pointer-events-none"}>
          <div className="grid grid-cols-3 gap-4">
            {form.stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">Valor</label>
                  <input
                    type="text"
                    value={stat.valor}
                    onChange={(e) => updateStat(idx, "valor", e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#9CA3AF] mb-1">Rótulo</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, "label", e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                  />
                </div>
              </div>
            ))}
          </div>
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
