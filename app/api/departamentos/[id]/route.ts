export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as departamentos from "@/lib/departamentos";
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

  const updated = await departamentos.update(params.id, { nome: body.nome.trim() });
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

  // Verifica se há funções vinculadas a este departamento
  const todasFuncoes = await funcoes.getAll();
  const emUso = todasFuncoes.filter((f) => f.departamentoId === params.id);
  if (emUso.length > 0) {
    return NextResponse.json(
      { error: `Não é possível deletar: ${emUso.length} função(ões) vinculada(s) a este departamento.` },
      { status: 409 }
    );
  }

  const ok = await departamentos.remove(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
