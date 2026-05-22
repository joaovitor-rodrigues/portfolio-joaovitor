export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as funcoes from "@/lib/funcoes";

export async function GET() {
  const all = await funcoes.getAll();
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

  const nova = await funcoes.create({ nome: body.nome.trim() });
  return NextResponse.json(nova, { status: 201 });
}
