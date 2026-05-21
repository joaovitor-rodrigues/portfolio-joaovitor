import Link from "next/link";
import { Projeto } from "@/lib/projetos";
import { Categoria } from "@/lib/categorias";
import { resolveImageUrl } from "@/lib/gdrive";

interface Props {
  projeto: Projeto;
  categoria?: Categoria;   // mantido por compatibilidade; não usado
  categorias?: Categoria[];
}

export default function ProjectCard({ projeto, categorias = [] }: Props) {
  const projCats = (projeto.categorias ?? [])
    .map((id) => categorias.find((c) => c.id === id))
    .filter(Boolean) as Categoria[];

  return (
    <Link href={`/projetos/${projeto.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl bg-white border border-[#E5E7EB] hover:border-purple-200 transition-all duration-300 hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-[#F8F8FA]">
          {projeto.thumb ? (
            <img
              src={resolveImageUrl(projeto.thumb)}
              alt={projeto.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#9CA3AF] text-sm">Sem imagem</span>
            </div>
          )}
          {/* Badges de categoria */}
          {projCats.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {projCats.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: cat.cor }}
                >
                  {cat.nome}
                </span>
              ))}
              {projCats.length > 2 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white bg-black/40">
                  +{projCats.length - 2}
                </span>
              )}
            </div>
          )}
          {/* Ícone de prêmio */}
          {projeto.premios?.length > 0 && (
            <span
              className="absolute top-3 right-3 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow"
              title={`${projeto.premios.length} ${projeto.premios.length === 1 ? "prêmio" : "prêmios"}`}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          {/* Título em destaque */}
          <h3 className="font-display text-lg font-normal text-[#111118] group-hover:text-purple-600 transition-colors leading-snug">
            {projeto.titulo}
          </h3>

          {/* Função realizada em destaque */}
          {projeto.funcaoRealizada && (
            <p className="mt-1 text-sm font-medium text-purple-600">
              {projeto.funcaoRealizada}
            </p>
          )}

          {/* Metadados */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
            {projeto.formato?.length > 0 && (
              <span>{projeto.formato.join(", ")}</span>
            )}
            {projeto.formato?.length > 0 && projeto.ano && (
              <span className="text-[#D1D5DB]">·</span>
            )}
            {projeto.ano && <span>{projeto.ano}</span>}
            {projeto.duracao && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <span>{projeto.duracao}</span>
              </>
            )}
            {projeto.genero && (
              <>
                <span className="text-[#D1D5DB]">·</span>
                <span>{projeto.genero}</span>
              </>
            )}
          </div>

          {projeto.descricaoCurta && (
            <p className="mt-3 text-sm text-[#6B7280] line-clamp-2 leading-relaxed">
              {projeto.descricaoCurta}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
