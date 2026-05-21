import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getBySlug } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";
import ProjetoClient from "./ProjetoClient";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

export default async function ProjetoPage({ params }: Props) {
  const [projeto, categorias] = await Promise.all([
    getBySlug(params.slug),
    getCategorias(),
  ]);

  if (!projeto || !projeto.publicado) notFound();

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <nav className="mb-8 text-sm text-[#9CA3AF]">
          <Link href="/projetos" className="hover:text-purple-600 transition-colors">Projetos</Link>
          <span className="mx-2">/</span>
          <span className="text-[#111118]">{projeto.titulo}</span>
        </nav>

        <ProjetoClient projeto={projeto} categorias={categorias} />
      </main>
      <Footer />
    </>
  );
}
