export const dynamic = "force-dynamic";

import { getAll as getCategorias } from "@/lib/categorias";
import { getAll as getFuncoes } from "@/lib/funcoes";
import ProjectForm from "@/components/admin/ProjectForm";

export default async function NovoprojetoPage() {
  const [categorias, funcoes] = await Promise.all([
    getCategorias(),
    getFuncoes(),
  ]);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Novo Projeto</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Preencha os campos abaixo para criar um novo projeto</p>
      </div>
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <ProjectForm categorias={categorias} funcoes={funcoes} mode="new" />
      </div>
    </div>
  );
}
