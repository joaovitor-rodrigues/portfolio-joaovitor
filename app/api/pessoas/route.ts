export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as pessoas from "@/lib/pessoas";

export async function GET() {
  const all = await pessoas.getAll();
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.nome?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const nova = await pessoas.create({
    nome: body.nome.trim(),
    tipo: body.tipo ?? "equipe",
    funcaoIds: Array.isArray(body.funcaoIds) ? body.funcaoIds : [],
    fotoUrl: body.fotoUrl?.trim() || undefined,
    instagramUrl: body.instagramUrl?.trim() || undefined,
  });

  return NextResponse.json(nova, { status: 201 });
}
