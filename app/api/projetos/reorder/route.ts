export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getBySlug, update } from "@/lib/projetos";

/**
 * PATCH /api/projetos/reorder
 * Body: { slugs: string[] }  — lista ordenada de slugs
 * Atribui `ordem: índice` a cada projeto em paralelo.
 */
export async function PATCH(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : [];

  if (slugs.length === 0) {
    return NextResponse.json({ error: "slugs é obrigatório" }, { status: 400 });
  }

  // Verifica que todos os slugs existem antes de salvar
  const projetos = await Promise.all(slugs.map((s) => getBySlug(s)));
  const notFound = slugs.filter((s, i) => !projetos[i]);
  if (notFound.length > 0) {
    return NextResponse.json(
      { error: `Projetos não encontrados: ${notFound.join(", ")}` },
      { status: 404 }
    );
  }

  // Atualiza a ordem em paralelo
  await Promise.all(slugs.map((slug, idx) => update(slug, { ordem: idx })));

  return NextResponse.json({ ok: true, count: slugs.length });
}
