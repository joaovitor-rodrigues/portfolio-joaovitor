import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectGrid from "@/components/ProjectGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { getAll as getProjetos } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";

interface Props {
  searchParams: { categoria?: string; funcao?: string };
}

export default function ProjetosPage({ searchParams }: Props) {
  const allProjetos = getProjetos();
  const categorias = getCategorias();

  let projetos = allProjetos.filter((p) => p.publicado);

  if (searchParams.categoria) {
    const cat = categorias.find((c) => c.slug === searchParams.categoria);
    if (cat) projetos = projetos.filter((p) => p.categorias?.includes(cat.id));
  }

  if (searchParams.funcao) {
    projetos = projetos.filter((p) => p.funcaoRealizada === searchParams.funcao);
  }

  const currentCat = searchParams.categoria
    ? categorias.find((c) => c.slug === searchParams.categoria)
    : null;

  const titulo = searchParams.funcao
    ? searchParams.funcao
    : currentCat
    ? currentCat.nome
    : "Projetos";

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-normal text-[#111118]">{titulo}</h1>
          {(searchParams.funcao || searchParams.categoria) && (
            <p className="mt-2 text-[#6B7280]">
              {projetos.length} {projetos.length === 1 ? "projeto" : "projetos"}
            </p>
          )}
        </div>

        {/* Filtro por categoria — só aparece quando não está filtrando por função */}
        {!searchParams.funcao && (
          <div className="mb-8">
            <Suspense fallback={null}>
              <CategoryFilter categorias={categorias} />
            </Suspense>
          </div>
        )}

        {/* Filtro por função ativo */}
        {searchParams.funcao && (
          <div className="mb-8">
            <a
              href="/projetos"
              className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-purple-600 transition-colors border border-[#E5E7EB] px-3 py-1.5 rounded-full"
            >
              ← Todas as funções
            </a>
          </div>
        )}

        {projetos.length > 0 ? (
          <ProjectGrid projetos={projetos} categorias={categorias} />
        ) : (
          <div className="text-center py-24 text-[#9CA3AF]">
            <p className="text-lg">Nenhum projeto encontrado.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
