"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Projeto } from "@/lib/projetos";
import { Categoria } from "@/lib/categorias";
import { resolveImageUrl } from "@/lib/gdrive";

interface Props {
  projetos: Projeto[];
  categorias: Categoria[];
}

export default function AdminProjetosClient({ projetos: initialProjetos, categorias }: Props) {
  const router = useRouter();
  const [projetos, setProjetos] = useState(initialProjetos);
  const [ordemAlterada, setOrdemAlterada] = useState(false);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const [dragOverActive, setDragOverActive] = useState<number | null>(null);

  function onDragStart(idx: number) {
    dragIdx.current = idx;
  }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    dragOverIdx.current = idx;
    setDragOverActive(idx);
  }

  function onDragLeave() {
    setDragOverActive(null);
  }

  function onDrop() {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from !== null && to !== null && from !== to) {
      setProjetos((prev) => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
      setOrdemAlterada(true);
    }
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDragOverActive(null);
  }

  function onDragEnd() {
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDragOverActive(null);
  }

  // ── Salvar ordem ───────────────────────────────────────────────────────────
  async function handleSalvarOrdem() {
    setSalvandoOrdem(true);
    try {
      const res = await fetch("/api/projetos/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: projetos.map((p) => p.slug) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao salvar ordem");
        return;
      }
      setOrdemAlterada(false);
      router.refresh();
    } catch {
      alert("Erro ao salvar ordem");
    } finally {
      setSalvandoOrdem(false);
    }
  }

  function handleDescartarOrdem() {
    setProjetos(initialProjetos);
    setOrdemAlterada(false);
  }

  // ── Publicar/despublicar ───────────────────────────────────────────────────
  async function handleTogglePublicado(projeto: Projeto) {
    const res = await fetch(`/api/projetos/${projeto.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...projeto, publicado: !projeto.publicado }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjetos((prev) => prev.map((p) => (p.slug === projeto.slug ? updated : p)));
      router.refresh();
    }
  }

  // ── Deletar ────────────────────────────────────────────────────────────────
  async function handleDelete(slug: string, titulo: string) {
    if (!window.confirm(`Tem certeza que deseja deletar "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/projetos/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setProjetos((prev) => prev.filter((p) => p.slug !== slug));
      router.refresh();
    } else {
      alert("Erro ao deletar projeto");
    }
  }

  return (
    <div className="space-y-3">

      {/* Banner de ordem alterada */}
      {ordemAlterada && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Ordem alterada. Salve para aplicar nos projetos públicos.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDescartarOrdem}
              className="px-3 py-1.5 text-xs text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Descartar
            </button>
            <button
              onClick={handleSalvarOrdem}
              disabled={salvandoOrdem}
              className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
            >
              {salvandoOrdem ? "Salvando…" : "Salvar Ordem"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {projetos.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            <p>Nenhum projeto cadastrado.</p>
            <Link href="/admin/projetos/novo" className="mt-4 inline-block text-purple-600 hover:text-purple-700 text-sm">
              Criar primeiro projeto →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F8FA]">
                <th className="w-8 px-3 py-3" title="Arraste para reordenar">
                  <svg className="w-4 h-4 text-[#D1D5DB] mx-auto" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
                    <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
                  </svg>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Projeto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">Função</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">Ano</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Publicado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {projetos.map((projeto, idx) => {
                const projCats = (projeto.categorias ?? [])
                  .map((id) => categorias.find((c) => c.id === id))
                  .filter(Boolean);
                const isDragOver = dragOverActive === idx;

                return (
                  <tr
                    key={projeto.slug}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onDragEnd={onDragEnd}
                    className={`transition-colors ${
                      isDragOver
                        ? "bg-purple-50 border-t-2 border-t-purple-400"
                        : "hover:bg-[#FAFAFA]"
                    }`}
                  >
                    {/* Handle de drag */}
                    <td className="w-8 px-3 py-3 text-center">
                      <div className="cursor-grab active:cursor-grabbing text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors flex justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
                          <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
                        </svg>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {projeto.thumb ? (
                          <img
                            src={resolveImageUrl(projeto.thumb)}
                            alt=""
                            className="w-10 h-8 object-cover rounded-md border border-[#E5E7EB] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-8 bg-[#F3F4F6] rounded-md border border-[#E5E7EB] flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#111118]">{projeto.titulo}</p>
                          <p className="text-xs text-[#9CA3AF] font-mono">{projeto.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-sm text-[#374151]">{projeto.funcaoRealizada || "—"}</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {projCats.map((cat) => cat && (
                          <span
                            key={cat.id}
                            className="inline-block px-2 py-0.5 rounded-full text-xs text-white font-medium"
                            style={{ backgroundColor: cat.cor }}
                          >
                            {cat.nome}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-[#6B7280] hidden md:table-cell">{projeto.ano}</td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublicado(projeto)}
                        title={projeto.publicado ? "Despublicar" : "Publicar"}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          projeto.publicado ? "bg-purple-600" : "bg-[#D1D5DB]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            projeto.publicado ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projetos/${projeto.slug}`}
                          className="px-3 py-1.5 text-xs text-[#374151] border border-[#E5E7EB] rounded-lg hover:bg-[#F8F8FA] transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(projeto.slug, projeto.titulo)}
                          className="px-3 py-1.5 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Dica de uso */}
      {projetos.length > 1 && (
        <p className="text-xs text-[#9CA3AF] text-center">
          Arraste as linhas pelo ícone <span className="inline-block align-middle">⠿</span> para reordenar. A ordem será aplicada em todo o site ao salvar.
        </p>
      )}
    </div>
  );
}
