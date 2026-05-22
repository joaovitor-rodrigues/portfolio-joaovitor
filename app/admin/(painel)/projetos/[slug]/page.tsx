export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";
import { getAll as getFuncoes } from "@/lib/funcoes";
import { getAll as getDepartamentos } from "@/lib/departamentos";
import { getAll as getPessoas } from "@/lib/pessoas";
import ProjectForm from "@/components/admin/ProjectForm";

interface Props {
  params: { slug: string };
}

export default async function EditarProjetoPage({ params }: Props) {
  const [projeto, categorias, funcoes, departamentos, pessoas] = await Promise.all([
    getBySlug(params.slug),
    getCategorias(),
    getFuncoes(),
    getDepartamentos(),
    getPessoas(),
  ]);

  if (!projeto) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Editar Projeto</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{projeto.titulo}</p>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <ProjectForm projeto={projeto} categorias={categorias} funcoes={funcoes} departamentos={departamentos} pessoas={pessoas} mode="edit" />
      </div>
    </div>
  );
}
