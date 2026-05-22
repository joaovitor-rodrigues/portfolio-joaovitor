export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as pessoas from "@/lib/pessoas";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const pessoa = await pessoas.getById(params.id);
  if (!pessoa) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(pessoa);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  if (body.nome !== undefined && !body.nome.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const updated = await pessoas.update(params.id, {
    ...(body.nome !== undefined && { nome: body.nome.trim() }),
    ...(body.tipo !== undefined && { tipo: body.tipo }),
    ...(body.funcaoIds !== undefined && { funcaoIds: body.funcaoIds }),
    ...(body.fotoUrl !== undefined && { fotoUrl: body.fotoUrl.trim() || undefined }),
    ...(body.instagramUrl !== undefined && { instagramUrl: body.instagramUrl.trim() || undefined }),
  });

  if (!updated) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const ok = await pessoas.remove(params.id);
  if (!ok) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
