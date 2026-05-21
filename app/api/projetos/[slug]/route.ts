export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as projetos from "@/lib/projetos";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const projeto = await projetos.getBySlug(params.slug);
  if (!projeto) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json(projeto);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await projetos.update(params.slug, {
    ...body,
    ano: Number(body.ano),
    formato: Array.isArray(body.formato) ? body.formato : [],
    galeria: Array.isArray(body.galeria) ? body.galeria : [],
  });

  if (!updated) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const ok = await projetos.remove(params.slug);
  if (!ok) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
