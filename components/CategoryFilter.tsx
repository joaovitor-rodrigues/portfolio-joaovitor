"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Categoria } from "@/lib/categorias";

interface Props {
  categorias: Categoria[];
}

export default function CategoryFilter({ categorias }: Props) {
  const searchParams = useSearchParams();
  const current = searchParams.get("categoria");

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/projetos"
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !current
            ? "bg-purple-600 text-white"
            : "bg-[#F8F8FA] text-[#374151] border border-[#E5E7EB] hover:border-purple-300 hover:text-purple-600"
        }`}
      >
        Todos
      </Link>
      {categorias.map((cat) => (
        <Link
          key={cat.id}
          href={`/projetos?categoria=${cat.slug}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            current === cat.slug
              ? "text-white"
              : "bg-[#F8F8FA] text-[#374151] border border-[#E5E7EB] hover:border-purple-300 hover:text-purple-600"
          }`}
          style={current === cat.slug ? { backgroundColor: cat.cor } : {}}
        >
          {cat.nome}
        </Link>
      ))}
    </div>
  );
}
