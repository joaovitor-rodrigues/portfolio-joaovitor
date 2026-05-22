"use client";

import { useState } from "react";
import Link from "next/link";
import { Projeto } from "@/lib/projetos";
import { Categoria } from "@/lib/categorias";
import { FuncaoEquipe } from "@/lib/funcoes";
import { resolveImageUrl } from "@/lib/gdrive";
import Lightbox from "@/components/Lightbox";

interface Props {
  projeto: Projeto;
  categoria?: Categoria;  // mantido por compatibilidade
  categorias?: Categoria[];
  funcoes?: FuncaoEquipe[];
}

export default function ProjetoClient({ projeto, categorias = [], funcoes = [] }: Props) {
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

      {/* Sinopse */}
      {projeto.sinopse && (
        <div className="mt-8 border-l-4 border-purple-300 pl-5">
          <p className="text-[#374151] leading-relaxed text-base italic whitespace-pre-line">
            {projeto.sinopse}
          </p>
        </div>
      )}

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

      {/* Elenco */}
      {projeto.mostrarElenco && projeto.elenco?.filter((m) => m.ator?.trim()).length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Elenco
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {projeto.elenco
              .filter((m) => m.ator?.trim())
              .map((m) => {
                const igUsername = m.instagramUrl?.replace(/^@/, "") ?? null;
                const igHandle = igUsername ? `@${igUsername}` : null;
                const igHref = igUsername ? `https://instagram.com/${igUsername}` : null;
                // Foto manual tem prioridade; caso contrário, tenta avatar do Instagram
                const avatarSrc = m.fotoUrl
                  ? resolveImageUrl(m.fotoUrl)
                  : igUsername
                  ? `https://unavatar.io/instagram/${igUsername}`
                  : null;
                return (
                  <div key={m.id} className="flex flex-col gap-2 p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F8FA]">
                    {/* Avatar + Nome do ator */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={m.ator}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm font-semibold">
                            {m.ator.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-[#6B7280] leading-tight truncate">{m.ator}</span>
                    </div>
                    {/* Personagem — destaque principal */}
                    {m.personagem && (
                      <p className="text-base font-semibold text-[#111118] leading-tight truncate">
                        {m.personagem}
                      </p>
                    )}
                    {/* Instagram */}
                    {igHref && igHandle && (
                      <a
                        href={igHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-purple-600 transition-colors w-fit"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span className="truncate">{igHandle}</span>
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Equipe */}
      {projeto.mostrarEquipe && projeto.equipe?.filter((m) => m.nome?.trim()).length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-normal text-[#111118] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Equipe
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {projeto.equipe
              .filter((m) => m.nome?.trim())
              .map((m) => {
                const funcao = funcoes.find((f) => f.id === m.funcaoId);
                const igUsername = m.instagramUrl?.replace(/^@/, "") ?? null;
                const igHandle = igUsername ? `@${igUsername}` : null;
                const igHref = igUsername ? `https://instagram.com/${igUsername}` : null;
                const avatarSrc = m.fotoUrl
                  ? resolveImageUrl(m.fotoUrl)
                  : igUsername
                  ? `https://unavatar.io/instagram/${igUsername}`
                  : null;
                return (
                  <div key={m.funcaoId} className="flex flex-col gap-2 p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F8FA]">
                    {/* Função */}
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider leading-none">
                      {funcao?.nome ?? ""}
                    </p>
                    {/* Avatar + Nome */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={m.nome}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm font-semibold">
                            {m.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#111118] leading-tight truncate">
                        {m.nome}
                      </span>
                    </div>
                    {/* Instagram */}
                    {igHref && igHandle && (
                      <a
                        href={igHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-purple-600 transition-colors w-fit"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span className="truncate">{igHandle}</span>
                      </a>
                    )}
                  </div>
                );
              })}
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
