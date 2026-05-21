"use client";

import { useState } from "react";
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

  return (
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Projeto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden sm:table-cell">Função</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">Ano</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Publicado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {projetos.map((projeto) => {
              const projCats = (projeto.categorias ?? []).map((id) => categorias.find((c) => c.id === id)).filter(Boolean);
              return (
                <tr key={projeto.slug} className="hover:bg-[#FAFAFA] transition-colors">
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
  );
}
