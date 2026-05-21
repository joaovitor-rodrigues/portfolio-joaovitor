"use client";

import { useState } from "react";
import Link from "next/link";
import { Projeto } from "@/lib/projetos";
import { Categoria } from "@/lib/categorias";
import { resolveImageUrl } from "@/lib/gdrive";
import Lightbox from "@/components/Lightbox";

interface Props {
  projeto: Projeto;
  categoria?: Categoria;  // mantido por compatibilidade
  categorias?: Categoria[];
}

export default function ProjetoClient({ projeto, categorias = [] }: Props) {
  const projCats = (projeto.categorias ?? [])
    .map((id) => categorias.find((c) => c.id === id))
    .filter(Boolean) as Categoria[];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const galeriaFiltrada = (projeto.galeria ?? []).filter(Boolean);

  function openLightbox(idx: number) { setLightboxIdx(idx); }
  function closeLightbox() { setLightboxIdx(null); }
  function prevImage() { setLightboxIdx((i) => (i !== null ? (i - 1 + galeriaFiltrada.length) % galeriaFiltrada.length : 0)); }
  function nextImage() { setLightboxIdx((i) => (i !== null ? (i + 1) % galeriaFiltrada.length : 0)); }

  return (
    <>
      {/* Hero thumb */}
      {projeto.thumb && (
        <div className="w-full aspect-video overflow-hidden rounded-xl mb-10 bg-[#F8F8FA]">
          <img
            src={resolveImageUrl(projeto.thumb)}
            alt={projeto.titulo}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Título */}
      <h1 className="font-display text-4xl sm:text-5xl font-normal text-[#111118]">
        {projeto.titulo}
      </h1>

      {projeto.funcaoRealizada && (
        <p className="mt-3 text-xl font-medium text-purple-600">{projeto.funcaoRealizada}</p>
      )}

      {/* Metadados */}
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm border-t border-b border-[#E5E7EB] py-5">
        {projeto.formato?.length > 0 && (
          <div>
            <dt className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-0.5">Formato</dt>
            <dd className="font-medium text-[#111118]">{projeto.formato.join(", ")}</dd>
          </div>
        )}
        <div>
          <dt className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-0.5">Ano</dt>
          <dd className="font-medium text-[#111118]">{projeto.ano}</dd>
        </div>
        {projeto.duracao && (
          <div>
            <dt className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-0.5">Duração</dt>
            <dd className="font-medium text-[#111118]">{projeto.duracao}</dd>
          </div>
        )}
        {projeto.genero && (
          <div>
            <dt className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-0.5">Gênero</dt>
            <dd className="font-medium text-[#111118]">{projeto.genero}</dd>
          </div>
        )}
        {projCats.length > 0 && (
          <div>
            <dt className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-0.5">
              {projCats.length === 1 ? "Categoria" : "Categorias"}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {projCats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/projetos?categoria=${cat.slug}`}
                  className="inline-block px-2.5 py-0.5 rounded-full text-white text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: cat.cor }}
                >
                  {cat.nome}
                </Link>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* Descrição longa */}
      {projeto.descricaoLonga && (
        <div className="mt-8">
          <p className="text-[#374151] leading-relaxed text-lg whitespace-pre-line">
            {projeto.descricaoLonga}
          </p>
        </div>
      )}

      {/* Vídeo */}
      {projeto.videoUrl && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-4">Vídeo</h2>
          <div className="aspect-video rounded-xl overflow-hidden bg-[#F8F8FA]">
            <iframe
              src={projeto.videoUrl}
              title={`Vídeo: ${projeto.titulo}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Galeria com lightbox */}
      {galeriaFiltrada.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-4">Galeria</h2>
          <div className={galeriaFiltrada.length === 1 ? "" : "columns-1 sm:columns-2 lg:columns-3 gap-4"}>
            {galeriaFiltrada.map((url, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="group relative block w-full overflow-hidden rounded-xl bg-[#F8F8FA] focus:outline-none focus:ring-2 focus:ring-purple-400 break-inside-avoid mb-4"
                aria-label={`Abrir imagem ${i + 1} em tela cheia`}
              >
                <img
                  src={resolveImageUrl(url)}
                  alt={`Galeria ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Festivais */}
      {projeto.mostrarFestivais && projeto.festivais?.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
            Festivais
          </h2>
          <div className="space-y-3">
            {projeto.festivais.map((f) => (
              <div key={f.id} className="flex items-start justify-between p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F8FA]">
                <div>
                  <p className="font-medium text-[#111118]">{f.nome}</p>
                  {f.edicao && <p className="text-sm text-[#6B7280] mt-0.5">{f.edicao}</p>}
                </div>
                {f.resultado && (
                  <span className="ml-4 flex-shrink-0 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    {f.resultado}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prêmios */}
      {projeto.mostrarPremios && projeto.premios?.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
            </svg>
            Prêmios
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projeto.premios.map((p) => {
              const festivalVinculado = p.festivalId
                ? (projeto.festivais ?? []).find((f) => f.id === p.festivalId)
                : null;
              return (
                <div key={p.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-medium text-[#111118]">{p.nome}</p>
                      {p.categoria && <p className="text-sm text-[#6B7280] mt-0.5">{p.categoria}</p>}
                      {festivalVinculado && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                          </svg>
                          <span className="truncate">
                            {festivalVinculado.nome}{festivalVinculado.edicao ? ` — ${festivalVinculado.edicao}` : ""}
                          </span>
                        </p>
                      )}
                      {p.ano && !festivalVinculado && <p className="text-xs text-[#9CA3AF] mt-1">{p.ano}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={galeriaFiltrada}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          onJumpTo={setLightboxIdx}
        />
      )}

      {/* Back */}
      <div className="mt-16 pt-8 border-t border-[#E5E7EB]">
        <Link href="/projetos" className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
          ← Voltar para Projetos
        </Link>
      </div>
    </>
  );
}
