import { getAll as getProjetos } from "@/lib/projetos";
import { getAll as getCategorias } from "@/lib/categorias";

export default function AdminDashboard() {
  const projetos = getProjetos();
  const categorias = getCategorias();
  const publicados = projetos.filter((p) => p.publicado).length;
  const destaques = projetos.filter((p) => p.destaque).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111118]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <p className="text-sm text-[#6B7280]">Total de Projetos</p>
          <p className="mt-2 text-3xl font-semibold text-[#111118]">{projetos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <p className="text-sm text-[#6B7280]">Publicados</p>
          <p className="mt-2 text-3xl font-semibold text-purple-600">{publicados}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <p className="text-sm text-[#6B7280]">Em Destaque</p>
          <p className="mt-2 text-3xl font-semibold text-[#111118]">{destaques}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <p className="text-sm text-[#6B7280]">Categorias</p>
          <p className="mt-2 text-3xl font-semibold text-[#111118]">{categorias.length}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-sm font-semibold text-[#374151] mb-4">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/projetos/novo"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Novo Projeto
          </a>
          <a
            href="/admin/projetos"
            className="px-4 py-2 border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] text-sm font-medium rounded-lg transition-colors"
          >
            Ver Projetos
          </a>
          <a
            href="/admin/categorias"
            className="px-4 py-2 border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] text-sm font-medium rounded-lg transition-colors"
          >
            Gerenciar Categorias
          </a>
        </div>
      </div>

      {/* Conteúdo do site */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-sm font-semibold text-[#374151] mb-4">Conteúdo do site</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/admin/site"
            className="flex flex-col gap-1 p-4 rounded-lg border border-[#E5E7EB] hover:border-purple-200 hover:bg-purple-50 transition-all group"
          >
            <span className="text-sm font-medium text-[#111118] group-hover:text-purple-700">Página Inicial</span>
            <span className="text-xs text-[#9CA3AF]">Hero, subtítulo e SEO</span>
          </a>
          <a
            href="/admin/sobre"
            className="flex flex-col gap-1 p-4 rounded-lg border border-[#E5E7EB] hover:border-purple-200 hover:bg-purple-50 transition-all group"
          >
            <span className="text-sm font-medium text-[#111118] group-hover:text-purple-700">Sobre</span>
            <span className="text-xs text-[#9CA3AF]">Bio, habilidades e foto</span>
          </a>
          <a
            href="/admin/contato"
            className="flex flex-col gap-1 p-4 rounded-lg border border-[#E5E7EB] hover:border-purple-200 hover:bg-purple-50 transition-all group"
          >
            <span className="text-sm font-medium text-[#111118] group-hover:text-purple-700">Contato</span>
            <span className="text-xs text-[#9CA3AF]">Links, redes e formulário</span>
          </a>
        </div>
      </div>
    </div>
  );
}
