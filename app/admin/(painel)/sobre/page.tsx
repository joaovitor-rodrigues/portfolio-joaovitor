export const dynamic = "force-dynamic";

import { get } from "@/lib/sobre";
import AdminSobreClient from "./AdminSobreClient";

export default async function AdminSobrePage() {
  const data = await get();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Página Sobre</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Edite a biografia, habilidades, estatísticas e foto</p>
      </div>
      <AdminSobreClient initialData={data} />
    </div>
  );
}
