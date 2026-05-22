export const dynamic = "force-dynamic";

import { getAll as getPessoas } from "@/lib/pessoas";
import { getAll as getFuncoes } from "@/lib/funcoes";
import AdminPessoasClient from "./AdminPessoasClient";

export default async function PessoasPage() {
  const [pessoas, funcoes] = await Promise.all([getPessoas(), getFuncoes()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Pessoas</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Cadastre atores e profissionais para vincular automaticamente nos projetos
        </p>
      </div>
      <AdminPessoasClient pessoas={pessoas} funcoes={funcoes} />
    </div>
  );
}
