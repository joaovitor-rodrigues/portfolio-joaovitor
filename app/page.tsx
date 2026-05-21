import Link from "next/link";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { getAll as getProjetos } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";
import { get as getSite } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = getSite();
  return {
    title: site.metaTitle,
    description: site.metaDescription,
  };
}

export default function Home() {
  const site = getSite();
  const allProjetos = getProjetos();
  const categorias = getCategorias();
  const publicados = allProjetos.filter((p) => p.publicado);
  const destaques = publicados.filter((p) => p.destaque);

  // Projetos por categoria
  const categoriasComCount = categorias
    .map((cat) => ({
      ...cat,
      count: publicados.filter((p) => p.categorias?.includes(cat.id)).length,
    }))
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  // Suporta quebra de linha com \n no título
  const heroLinhas = site.heroTitulo.split("\\n").join("\n").split("\n");

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="pt-[120px] pb-24 px-6 max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl sm:text-6xl font-normal text-[#111118] leading-tight">
              {heroLinhas.map((linha, i) => (
                <span key={i}>
                  {linha}
                  {i < heroLinhas.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-lg">
              {site.heroSubtitulo}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/projetos"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                {site.heroCta1Label}
              </Link>
              <Link
                href="/sobre"
                className="px-6 py-3 border border-[#E5E7EB] text-[#374151] hover:border-purple-300 hover:text-purple-600 font-medium rounded-lg transition-colors"
              >
                {site.heroCta2Label}
              </Link>
            </div>
          </div>
        </section>

        {/* Projetos em Destaque */}
        {destaques.length > 0 && (
          <section className="px-6 pb-24 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-normal text-[#111118]">Projetos em Destaque</h2>
              <Link href="/projetos" className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destaques.slice(0, 3).map((projeto) => (
                <ProjectCard key={projeto.slug} projeto={projeto} categorias={categorias} />
              ))}
            </div>
          </section>
        )}

        {/* Categorias */}
        {categoriasComCount.length > 0 && (
          <section className="px-6 pb-24 max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-normal text-[#111118] mb-8">Áreas de Atuação</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasComCount.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/projetos?categoria=${cat.slug}`}
                  style={{ "--accent": cat.cor } as React.CSSProperties}
                  className="group relative flex flex-col justify-between gap-8 p-7 rounded-2xl border-2 border-[var(--accent)] bg-white hover:bg-[var(--accent)] transition-all duration-300"
                >
                  {/* Dot + contagem */}
                  <div className="flex items-center justify-between">
                    <span
                      className="w-3 h-3 rounded-full transition-colors duration-300 group-hover:bg-white"
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-xs font-medium tabular-nums text-[var(--accent)] group-hover:text-white/80 transition-colors duration-300">
                      {cat.count} {cat.count === 1 ? "projeto" : "projetos"}
                    </span>
                  </div>

                  {/* Nome + seta */}
                  <div className="flex items-end justify-between gap-4">
                    <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#111118] group-hover:text-white transition-colors duration-300 leading-tight">
                      {cat.nome}
                    </h3>
                    <svg
                      className="w-5 h-5 flex-shrink-0 mb-0.5 text-[var(--accent)] group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
