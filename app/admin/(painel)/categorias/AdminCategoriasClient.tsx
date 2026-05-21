"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Categoria } from "@/lib/categorias";

interface CategoriaComContagem extends Categoria {
  count: number;
}

interface Props {
  categorias: CategoriaComContagem[];
}

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

// ─── Formulário de nova categoria ───────────────────────────────────────────
function NovaCategoria({ onCreated }: { onCreated: (cat: CategoriaComContagem) => void }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#7C3AED");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNome(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setNome(v);
    if (!slugManual) setSlug(slugify(v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim() || !slug.trim()) { setError("Nome e slug são obrigatórios"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cor, slug }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
      const nova: Categoria = await res.json();
      onCreated({ ...nova, count: 0 });
      router.refresh();
      setNome(""); setCor("#7C3AED"); setSlug(""); setSlugManual(false);
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
        <input type="text" value={nome} onChange={handleNome}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-40"
          placeholder="Ex: Fotografia" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Slug</label>
        <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-36 font-mono"
          placeholder="fotografia" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Cor</label>
        <div className="flex items-center gap-2">
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)}
            className="w-10 h-9 rounded border border-[#E5E7EB] cursor-pointer" />
          <span className="text-xs text-[#6B7280] font-mono">{cor}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
          {loading ? "Criando..." : "+ Nova Categoria"}
        </button>
      </div>
    </form>
  );
}

// ─── Linha com modo de edição inline ────────────────────────────────────────
function CategoriaRow({
  cat, onUpdated, onDeleted,
}: {
  cat: CategoriaComContagem;
  onUpdated: (updated: Categoria) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(cat.nome);
  const [cor, setCor] = useState(cat.cor);
  const [slug, setSlug] = useState(cat.slug);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!nome.trim() || !slug.trim()) { setError("Nome e slug são obrigatórios"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/categorias/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cor, slug }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      onUpdated(await res.json());
      router.refresh();
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setNome(cat.nome); setCor(cat.cor); setSlug(cat.slug);
    setError(""); setEditing(false);
  }

  async function handleDelete() {
    if (cat.count > 0) {
      alert(`Não é possível deletar "${cat.nome}" pois possui ${cat.count} projeto(s) vinculado(s).`);
      return;
    }
    if (!window.confirm(`Deletar a categoria "${cat.nome}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categorias/${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao deletar");
      onDeleted(cat.id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <tr className="bg-purple-50">
        <td className="px-4 py-3" colSpan={5}>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                className="border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                className="border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-36 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input type="color" value={cor} onChange={(e) => setCor(e.target.value)}
                  className="w-10 h-8 rounded border border-purple-300 cursor-pointer" />
                <span className="text-xs font-mono text-[#6B7280]">{cor}</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              {error && <p className="text-xs text-red-600 self-center">{error}</p>}
              <button type="button" onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={handleCancel}
                className="px-4 py-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-white text-sm rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-[#FAFAFA] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.cor }} />
          <span className="text-sm font-medium text-[#111118]">{cat.nome}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">{cat.slug}</code>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono text-[#6B7280]">{cat.cor}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-[#374151]">{cat.count}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F8F8FA] transition-colors">
            Editar
          </button>
          <button onClick={handleDelete} disabled={deleting || cat.count > 0}
            className="px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={cat.count > 0 ? "Possui projetos vinculados" : "Deletar"}>
            {deleting ? "..." : "Deletar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Componente raiz ─────────────────────────────────────────────────────────
export default function AdminCategoriasClient({ categorias: initialCats }: Props) {
  const [categorias, setCategorias] = useState(initialCats);

  return (
    <div className="space-y-6">
      <NovaCategoria onCreated={(nova) => setCategorias((prev) => [...prev, nova])} />

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {categorias.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            <p>Nenhuma categoria cadastrada. Crie a primeira acima.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F8FA]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Cor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Projetos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {categorias.map((cat) => (
                <CategoriaRow
                  key={cat.id}
                  cat={cat}
                  onUpdated={(updated) =>
                    setCategorias((prev) =>
                      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
                    )
                  }
                  onDeleted={(id) =>
                    setCategorias((prev) => prev.filter((c) => c.id !== id))
                  }
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
