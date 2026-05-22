export const dynamic = "force-dynamic";

import { getAll as getFuncoes } from "@/lib/funcoes";
import { getAll as getProjetos } from "@/lib/projetos";
import AdminFuncoesClient from "./AdminFuncoesClient";

export default async function AdminFuncoesPage() {
  const [funcoes, projetos] = await Promise.all([
    getFuncoes(),
    getProjetos(),
  ]);

  // Conta quantos projetos usam cada função na equipe
  const funcoesComContagem = funcoes.map((f) => ({
    ...f,
    count: projetos.filter((p) =>
      (p.equipe ?? []).some((m) => m.funcaoId === f.id)
    ).length,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Funções da Equipe</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Gerencie as funções disponíveis para os membros de equipe nos projetos
        </p>
      </div>
      <AdminFuncoesClient funcoes={funcoesComContagem} />
    </div>
  );
}
