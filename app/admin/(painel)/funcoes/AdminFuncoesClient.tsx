"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FuncaoEquipe } from "@/lib/funcoes";
import { DepartamentoEquipe } from "@/lib/departamentos";

interface FuncaoComContagem extends FuncaoEquipe {
  count: number;
}

interface Props {
  departamentos: DepartamentoEquipe[];
  funcoes: FuncaoComContagem[];
}

// ─── Formulário de novo departamento ────────────────────────────────────────
function NovoDepartamento({
  onCreated,
}: {
  onCreated: (d: DepartamentoEquipe) => void;
}) {
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
      const res = await fetch("/api/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
      const novo: DepartamentoEquipe = await res.json();
      onCreated(novo);
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
        <label className="block text-xs font-medium text-[#374151] mb-1">Nome do departamento</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Ex: Câmera, Direção, Som…"
        />
      </div>
      <div className="flex flex-col gap-1">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Criando..." : "+ Novo Departamento"}
        </button>
      </div>
    </form>
  );
}

// ─── Cabeçalho de departamento (com edição inline e deleção) ─────────────────
function DepartamentoHeader({
  dep,
  funcaoCount,
  onUpdated,
  onDeleted,
}: {
  dep: DepartamentoEquipe;
  funcaoCount: number;
  onUpdated: (updated: DepartamentoEquipe) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(dep.nome);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/departamentos/${dep.id}`, {
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

  async function handleDelete() {
    if (funcaoCount > 0) {
      alert(`Não é possível deletar "${dep.nome}": existem ${funcaoCount} função(ões) neste departamento. Mova ou delete-as primeiro.`);
      return;
    }
    if (!window.confirm(`Deletar o departamento "${dep.nome}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/departamentos/${dep.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao deletar");
      onDeleted(dep.id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-wrap gap-3 items-end px-4 py-3 bg-purple-50 border-b border-purple-100">
        <div className="flex-1 min-w-40">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => { setNome(dep.nome); setError(""); setEditing(false); }}
            className="px-3 py-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-white text-xs rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#F0EDFB] border-b border-purple-100">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-800">{dep.nome}</span>
        <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
          {funcaoCount} função{funcaoCount !== 1 ? "ões" : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="px-2.5 py-1 text-xs text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors bg-white/60"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting || funcaoCount > 0}
          className="px-2.5 py-1 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={funcaoCount > 0 ? "Mova ou delete as funções primeiro" : "Deletar departamento"}
        >
          {deleting ? "..." : "Deletar"}
        </button>
      </div>
    </div>
  );
}

// ─── Linha de função ─────────────────────────────────────────────────────────
function FuncaoRow({
  func,
  departamentos,
  onUpdated,
  onDeleted,
}: {
  func: FuncaoComContagem;
  departamentos: DepartamentoEquipe[];
  onUpdated: (updated: FuncaoEquipe) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(func.nome);
  const [departamentoId, setDepartamentoId] = useState(func.departamentoId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    if (!departamentoId) { setError("Selecione um departamento"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/funcoes/${func.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, departamentoId }),
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
    setDepartamentoId(func.departamentoId);
    setError("");
    setEditing(false);
  }

  async function handleDelete() {
    if (func.count > 0) {
      alert(`Não é possível deletar "${func.nome}": está em uso em ${func.count} projeto(s).`);
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
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-[#374151] mb-1">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
                className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="min-w-40">
              <label className="block text-xs font-medium text-[#374151] mb-1">Departamento</label>
              <select
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="w-full border border-purple-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-[#374151]"
              >
                <option value="">Selecionar…</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
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
      <td className="px-4 py-3 pl-8">
        <span className="text-sm text-[#111118]">{func.nome}</span>
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

// ─── Formulário de nova função (dentro de um departamento) ───────────────────
function NovaFuncao({
  departamentos,
  defaultDepartamentoId,
  onCreated,
}: {
  departamentos: DepartamentoEquipe[];
  defaultDepartamentoId?: string;
  onCreated: (f: FuncaoComContagem) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [departamentoId, setDepartamentoId] = useState(defaultDepartamentoId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    if (!departamentoId) { setError("Selecione um departamento"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/funcoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, departamentoId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar");
      const nova: FuncaoEquipe = await res.json();
      onCreated({ ...nova, count: 0 });
      router.refresh();
      setNome("");
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-1.5 border-t border-[#E5E7EB]"
      >
        <span className="text-base leading-none">+</span> Nova função
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-3 border-t border-[#E5E7EB] bg-[#FAFAFA] flex flex-wrap gap-3 items-end"
    >
      <div className="flex-1 min-w-40">
        <label className="block text-xs font-medium text-[#374151] mb-1">Nome da função</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoFocus
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Ex: 1º Assistente de Câmera"
        />
      </div>
      <div className="min-w-40">
        <label className="block text-xs font-medium text-[#374151] mb-1">Departamento</label>
        <select
          value={departamentoId}
          onChange={(e) => setDepartamentoId(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-[#374151]"
        >
          <option value="">Selecionar…</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-2">
        {error && <p className="text-xs text-red-600 self-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Criando..." : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setNome(""); setError(""); }}
          className="px-4 py-1.5 border border-[#E5E7EB] text-[#374151] hover:bg-white text-sm rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Componente raiz ─────────────────────────────────────────────────────────
export default function AdminFuncoesClient({
  departamentos: initialDeps,
  funcoes: initialFuncoes,
}: Props) {
  const [departamentos, setDepartamentos] = useState(initialDeps);
  const [funcoes, setFuncoes] = useState(initialFuncoes);

  // Funções sem departamento válido (retrocompatibilidade)
  const semDep = funcoes.filter(
    (f) => !departamentos.find((d) => d.id === f.departamentoId)
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho de ações globais */}
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex-1">
          <NovoDepartamento
            onCreated={(novo) =>
              setDepartamentos((prev) =>
                [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
              )
            }
          />
        </div>
      </div>

      {/* Aviso de funções sem departamento */}
      {semDep.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <strong>{semDep.length} função(ões)</strong> sem departamento válido. Edite-as para associar um departamento.
        </div>
      )}

      {/* Sem departamentos cadastrados */}
      {departamentos.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center text-[#9CA3AF]">
          <p className="mb-1">Nenhum departamento cadastrado.</p>
          <p className="text-xs">Crie um departamento acima para depois adicionar funções.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB]">
          {departamentos.map((dep) => {
            const depFuncoes = funcoes
              .filter((f) => f.departamentoId === dep.id)
              .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

            return (
              <div key={dep.id}>
                {/* Cabeçalho do departamento */}
                <DepartamentoHeader
                  dep={dep}
                  funcaoCount={depFuncoes.length}
                  onUpdated={(updated) =>
                    setDepartamentos((prev) =>
                      prev
                        .map((d) => (d.id === updated.id ? updated : d))
                        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                    )
                  }
                  onDeleted={(id) =>
                    setDepartamentos((prev) => prev.filter((d) => d.id !== id))
                  }
                />

                {/* Funções do departamento */}
                {depFuncoes.length > 0 && (
                  <table className="w-full">
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {depFuncoes.map((f) => (
                        <FuncaoRow
                          key={f.id}
                          func={f}
                          departamentos={departamentos}
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

                {/* Botão / form de nova função dentro deste departamento */}
                <NovaFuncao
                  departamentos={departamentos}
                  defaultDepartamentoId={dep.id}
                  onCreated={(nova) =>
                    setFuncoes((prev) => [...prev, nova])
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Funções órfãs (sem departamento válido) */}
      {semDep.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
            <span className="text-sm font-semibold text-amber-700">Sem departamento</span>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-[#F3F4F6]">
              {semDep.map((f) => (
                <FuncaoRow
                  key={f.id}
                  func={f}
                  departamentos={departamentos}
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
        </div>
      )}

      {/* Botão global de nova função (quando há departamentos mas nenhuma função ainda) */}
      {departamentos.length > 0 && funcoes.length === 0 && (
        <div className="text-center text-xs text-[#9CA3AF] pt-2">
          Clique em "+ Nova função" dentro de um departamento para começar.
        </div>
      )}
    </div>
  );
}
