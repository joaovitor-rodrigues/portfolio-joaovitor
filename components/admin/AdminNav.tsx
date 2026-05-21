"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projetos", label: "Projetos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/site", label: "Página Inicial" },
  { href: "/admin/sobre", label: "Sobre" },
  { href: "/admin/contato", label: "Contato" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-[#E5E7EB]">
        <Link href="/" className="font-display text-[16px] text-[#111118] hover:text-purple-600 transition-colors">
          João Vitor Rodrigues
        </Link>
        <p className="text-xs text-[#9CA3AF] mt-1">Painel Admin</p>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-purple-100 text-purple-700"
                  : "text-[#374151] hover:bg-[#F8F8FA] hover:text-[#111118]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="mt-2 border-t border-[#E5E7EB] pt-2">
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#F8F8FA] flex items-center gap-2 transition-colors"
          >
            Ver site
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
