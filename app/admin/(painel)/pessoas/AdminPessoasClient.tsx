"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pessoa } from "@/lib/pessoas";
import { FuncaoEquipe } from "@/lib/funcoes";
import { resolveImageUrl } from "@/lib/gdrive";

interface Props {
  pessoas: Pessoa[];
  funcoes: FuncaoEquipe[];
}

const TIPO_LABELS: Record<Pessoa["tipo"], string> = {
  equipe: "Equipe",
  elenco: "Elenco",
  ambos: "Equipe + Elenco",
};

const TIPO_COLORS: Record<Pessoa["tipo"], string> = {
  equipe: "bg-blue-100 text-blue-700",
  elenco: "bg-amber-100 text-amber-700",
  ambos: "bg-purple-100 text-purple-700",
};

// ─── Formulário (nova / editar) ──────────────────────────────────────────────
function PessoaForm({
  inicial,
  funcoes,
  onSaved,
  onCancel,
}: {
  inicial?: Pessoa;
  funcoes: FuncaoEquipe[];
  onSaved: (p: Pessoa) => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const editing = !!inicial;

  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [tipo, setTipo] = useState<Pessoa["tipo"]>(inicial?.tipo ?? "equipe");
  const [funcaoIds, setFuncaoIds] = useState<string[]>(inicial?.funcaoIds ?? []);
  const [fotoUrl, setFotoUrl] = useState(inicial?.fotoUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(inicial?.instagramUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleFuncao(id: string) {
    setFuncaoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nome.trim()) { setError("Nome é obrigatório"); return; }
    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        tipo,
        funcaoIds,
        fotoUrl: fotoUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
      };
      const res = editing
        ? await fetch(`/api/pessoas/${inicial!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/pessoas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar");
      onSaved(await res.json());
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  const showFuncoes = tipo === "equipe" || tipo === "ambos";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-5 bg-[#F8F8FA] rounded-xl border border-[#E5E7EB]"
    >
      <h3 className="text-sm font-semibold text-[#111118]">
        {editing ? "Editar pessoa" : "Nova pessoa"}
      </h3>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Nome */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Nome completo"
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Tipo</label>
        <div className="flex gap-3">
          {(["equipe", "elenco", "ambos"] as Pessoa["tipo"][]).map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="accent-purple-600"
              />
              {TIPO_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      {/* Funções (só para equipe / ambos) */}
      {showFuncoes && funcoes.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1">
            Funções que exerce
            <span className="ml-1 font-normal text-[#9CA3AF]">(usadas para sugerir nos projetos)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {funcoes.map((f) => {
              const sel = funcaoIds.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFuncao(f.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    sel
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  {f.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Foto */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">URL da foto</label>
        <div className="flex gap-2 items-center">
          <input
            type="url"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="https://..."
          />
          {fotoUrl && (
            <img
              src={resolveImageUrl(fotoUrl)}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0"
            />
          )}
        </div>
      </div>

      {/* Instagram */}
      <div>
        <label className="block text-xs font-medium text-[#374151] mb-1">Instagram</label>
        <input
          type="text"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="@username ou URL"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Salvando..." : editing ? "Salvar" : "+ Criar Pessoa"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[#E5E7EB] text-[#374151] hover:bg-white text-sm rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Card de pessoa ──────────────────────────────────────────────────────────
function PessoaCard({
  pessoa,
  funcoes,
  onUpdated,
  onDeleted,
}: {
  pessoa: Pessoa;
  funcoes: FuncaoEquipe[];
  onUpdated: (p: Pessoa) => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Deletar "${pessoa.nome}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pessoas/${pessoa.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erro ao deletar");
      onDeleted(pessoa.id);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <PessoaForm
        inicial={pessoa}
        funcoes={funcoes}
        onSaved={(updated) => { onUpdated(updated); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const nomeFuncoes = pessoa.funcaoIds
    .map((id) => funcoes.find((f) => f.id === id)?.nome)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {pessoa.fotoUrl ? (
          <img
            src={resolveImageUrl(pessoa.fotoUrl)}
            alt={pessoa.nome}
            className="w-11 h-11 rounded-full object-cover border border-[#E5E7EB]"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#F0EDFB] flex items-center justify-center text-purple-600 text-lg font-semibold border border-[#E5E7EB]">
            {pessoa.nome.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[#111118]">{pessoa.nome}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[pessoa.tipo]}`}>
            {TIPO_LABELS[pessoa.tipo]}
          </span>
        </div>
        {nomeFuncoes && (
          <p className="text-xs text-[#6B7280] mt-0.5 truncate">{nomeFuncoes}</p>
        )}
        {pessoa.instagramUrl && (
          <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">{pessoa.instagramUrl}</p>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 text-xs text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F8F8FA] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? "..." : "Deletar"}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

/** Remove acentos e converte para minúsculas para comparação insensível a acentos. */
function norm(str: string) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// ─── Componente raiz ─────────────────────────────────────────────────────────
export default function AdminPessoasClient({
  pessoas: initialPessoas,
  funcoes,
}: Props) {
  const [pessoas, setPessoas] = useState(initialPessoas);
  const [showForm, setShowForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | Pessoa["tipo"]>("todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtradas = pessoas.filter((p) => {
    if (filtroTipo !== "todos" && p.tipo !== filtroTipo) return false;
    if (busca.trim()) {
      const q = norm(busca.trim());
      const matchNome = norm(p.nome).includes(q);
      const matchIg = p.instagramUrl ? norm(p.instagramUrl).includes(q) : false;
      if (!matchNome && !matchIg) return false;
    }
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginadas = filtradas.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE);

  function handleBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function handleFiltroTipo(valor: "todos" | Pessoa["tipo"]) {
    setFiltroTipo(valor);
    setPagina(1);
  }

  return (
    <div className="space-y-6">
      {/* Barra de ações */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            placeholder="Buscar por nome ou @instagram…"
            className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 w-64"
          />
          <select
            value={filtroTipo}
            onChange={(e) => handleFiltroTipo(e.target.value as typeof filtroTipo)}
            className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-[#374151]"
          >
            <option value="todos">Todos os tipos</option>
            <option value="equipe">Equipe</option>
            <option value="elenco">Elenco</option>
            <option value="ambos">Equipe + Elenco</option>
          </select>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nova Pessoa"}
        </button>
      </div>

      {/* Formulário de nova pessoa */}
      {showForm && (
        <PessoaForm
          funcoes={funcoes}
          onSaved={(nova) => {
            setPessoas((prev) => [nova, ...prev].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
            setShowForm(false);
            setPagina(1);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="p-12 text-center text-[#9CA3AF] bg-white rounded-xl border border-[#E5E7EB]">
          {pessoas.length === 0
            ? "Nenhuma pessoa cadastrada. Crie a primeira acima."
            : "Nenhuma pessoa encontrada com esses filtros."}
        </div>
      ) : (
        <div className="space-y-2">
          {paginadas.map((p) => (
            <PessoaCard
              key={p.id}
              pessoa={p}
              funcoes={funcoes}
              onUpdated={(updated) =>
                setPessoas((prev) =>
                  prev
                    .map((x) => (x.id === updated.id ? updated : x))
                    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
                )
              }
              onDeleted={(id) => {
                setPessoas((prev) => prev.filter((x) => x.id !== id));
                setPagina((p) => Math.min(p, Math.max(1, Math.ceil((filtradas.length - 1) / PAGE_SIZE))));
              }}
            />
          ))}
        </div>
      )}

      {/* Rodapé: contagem + paginação */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[#9CA3AF]">
          {filtradas.length === pessoas.length
            ? `${pessoas.length} pessoa${pessoas.length !== 1 ? "s" : ""}`
            : `${filtradas.length} de ${pessoas.length} pessoa${pessoas.length !== 1 ? "s" : ""}`}
        </p>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina(1)}
              disabled={paginaAtual === 1}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Primeira página"
            >
              «
            </button>
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              ‹
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - paginaAtual) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`sep-${i}`} className="px-1 text-xs text-[#9CA3AF]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`min-w-[28px] px-2 py-1 text-xs rounded-lg border transition-colors ${
                      n === paginaAtual
                        ? "bg-purple-600 text-white border-purple-600 font-semibold"
                        : "border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA]"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Próxima página"
            >
              ›
            </button>
            <button
              onClick={() => setPagina(totalPaginas)}
              disabled={paginaAtual === totalPaginas}
              className="px-2 py-1 text-xs rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
