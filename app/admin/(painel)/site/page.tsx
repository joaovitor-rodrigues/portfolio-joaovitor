import { get } from "@/lib/site";
import AdminSiteClient from "./AdminSiteClient";

export default async function AdminSitePage() {
  const data = await get();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Página Inicial</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Edite o conteúdo do hero e os metadados do site</p>
      </div>
      <AdminSiteClient initialData={data} />
    </div>
  );
}
