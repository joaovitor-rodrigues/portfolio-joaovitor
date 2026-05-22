export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as funcoes from "@/lib/funcoes";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const updated = await funcoes.update(params.id, { nome: body.nome.trim() });
  if (!updated) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
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

  const ok = await funcoes.remove(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
