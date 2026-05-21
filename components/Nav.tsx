"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/projetos", label: "Projetos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-[20px] font-normal text-[#111118] hover:text-purple-600 transition-colors">
          João Vitor Rodrigues
        </Link>
        <nav className="flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm transition-colors relative pb-0.5 ${
                  isActive
                    ? "text-purple-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-purple-600 after:rounded-full"
                    : "text-[#374151] hover:text-purple-600 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-purple-600 hover:after:rounded-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
