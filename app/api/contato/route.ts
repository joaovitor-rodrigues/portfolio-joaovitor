export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as contato from "@/lib/contato";

export async function GET() {
  const data = await contato.get();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await contato.update(body);
  return NextResponse.json(updated);
}
