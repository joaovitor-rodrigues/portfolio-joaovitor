"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FuncaoEquipe } from "@/lib/funcoes";

interface FuncaoComContagem extends FuncaoEquipe {
  count: number;
}

interface Props {
  funcoes: FuncaoComContagem[];
}

// ─── Formulário de nova função ───────────────────────────────────────────────
function NovaFuncao({ onCreated }: { onCreated: (f: FuncaoComContagem) => void }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/funcoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
      const nova: FuncaoEquipe = await res.json();
      onCreated({ ...nova, count: 0 });
      router.refresh();
      setNome("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end p-4 bg-[#F8F8FA] rounded-lg border border-[#E5E7EB]">
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-[#374151] mb-1">Nome da função</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Ex: Diretor de Fotografia"
        />
      </div>
      <div className="flex flex-col gap-1">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Criando..." : "+ Nova Função"}
        </button>
      </div>
    </form>
  );
}

// ─── Linha com modo de edição inline ────────────────────────────────────────
function FuncaoRow({
  func,
  onUpdated,
  onDeleted,
}: {
  func: FuncaoComContagem;
  onUpdated: (updated: FuncaoEquipe) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(func.nome);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/funcoes/${func.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
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
    setNome(func.nome);
    setError("");
    setEditing(false);
  }

  async function handleDelete() {
    if (func.count > 0) {
      alert(`Não é possível deletar "${func.nome}" pois está sendo usada em ${func.count} projeto(s).`);
      return;
    }
    if (!window.confirm(`Deletar a função "${func.nome}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/funcoes/${func.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao deletar");
      onDeleted(func.id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <tr className="bg-purple-50">
        <td className="px-4 py-3" colSpan={3}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-[#374151] mb-1">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="flex items-end gap-2">
              {error && <p className="text-xs text-red-600 self-center">{error}</p>}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-white text-sm rounded-lg transition-colors"
              >
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
        <span className="text-sm font-medium text-[#111118]">{func.nome}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-[#374151]">{func.count}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 text-xs text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F8F8FA] transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || func.count > 0}
            className="px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={func.count > 0 ? "Em uso em projetos" : "Deletar"}
          >
            {deleting ? "..." : "Deletar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Componente raiz ─────────────────────────────────────────────────────────
export default function AdminFuncoesClient({ funcoes: initialFuncoes }: Props) {
  const [funcoes, setFuncoes] = useState(initialFuncoes);

  return (
    <div className="space-y-6">
      <NovaFuncao onCreated={(nova) => setFuncoes((prev) => [...prev, nova])} />

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {funcoes.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            <p>Nenhuma função cadastrada. Crie a primeira acima.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F8FA]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Nome</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Projetos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {funcoes.map((f) => (
                <FuncaoRow
                  key={f.id}
                  func={f}
                  onUpdated={(updated) =>
                    setFuncoes((prev) =>
                      prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x))
                    )
                  }
                  onDeleted={(id) =>
                    setFuncoes((prev) => prev.filter((x) => x.id !== id))
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
