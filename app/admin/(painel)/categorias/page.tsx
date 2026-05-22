export const dynamic = "force-dynamic";

import { getAll as getCategorias } from "@/lib/categorias";
import { getAll as getProjetos } from "@/lib/projetos";
import AdminCategoriasClient from "./AdminCategoriasClient";

export default async function AdminCategoriasPage() {
  const [categorias, projetos] = await Promise.all([
    getCategorias(),
    getProjetos(),
  ]);

  const categoriasComContagem = categorias.map((cat) => ({
    ...cat,
    count: projetos.filter((p) => p.categoriaId === cat.id).length,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Categorias</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Crie, edite e organize as categorias dos seus projetos
        </p>
      </div>
      <AdminCategoriasClient categorias={categoriasComContagem} />
    </div>
  );
}
