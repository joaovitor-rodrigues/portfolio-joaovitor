import { NextRequest, NextResponse } from "next/server";
import * as categorias from "@/lib/categorias";
import * as projetos from "@/lib/projetos";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = categorias.update(params.id, body);

  if (!updated) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Check if any project uses this category
  const allProjetos = projetos.getAll();
  const inUse = allProjetos.some((p) => p.categoriaId === params.id);
  if (inUse) {
    return NextResponse.json(
      { error: "Categoria possui projetos vinculados. Remova ou transfira os projetos primeiro." },
      { status: 400 }
    );
  }

  const ok = categorias.remove(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
