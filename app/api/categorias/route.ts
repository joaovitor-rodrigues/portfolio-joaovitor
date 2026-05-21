export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as categorias from "@/lib/categorias";

export async function GET() {
  const data = await categorias.getAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.nome || !body.slug) {
    return NextResponse.json(
      { error: "Nome e slug são obrigatórios" },
      { status: 400 }
    );
  }

  const all = await categorias.getAll();
  if (all.some((c) => c.slug === body.slug)) {
    return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
  }

  const nova = await categorias.create({
    nome: body.nome,
    cor: body.cor || "#7C3AED",
    slug: body.slug,
  });

  return NextResponse.json(nova, { status: 201 });
}
