import { get } from "@/lib/contato";
import AdminContatoClient from "./AdminContatoClient";

export default async function AdminContatoPage() {
  const data = await get();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Página de Contato</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Edite os links de contato e o formulário</p>
      </div>
      <AdminContatoClient initialData={data} />
    </div>
  );
}
