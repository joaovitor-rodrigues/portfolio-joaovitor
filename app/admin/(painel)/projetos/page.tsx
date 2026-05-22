export const dynamic = "force-dynamic";

import Link from "next/link";
import { getAll as getProjetos } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";
import AdminProjetosClient from "./AdminProjetosClient";

export default async function AdminProjetosPage() {
  const [projetos, categorias] = await Promise.all([
    getProjetos(),
    getCategorias(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#111118]">Projetos</h1>
          <p className="mt-1 text-sm text-[#6B7280]">{projetos.length} projetos no total</p>
        </div>
        <Link
          href="/admin/projetos/novo"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo Projeto
        </Link>
      </div>

      <AdminProjetosClient projetos={projetos} categorias={categorias} />
    </div>
  );
}
