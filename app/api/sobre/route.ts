import { NextRequest, NextResponse } from "next/server";
import * as sobre from "@/lib/sobre";

export async function GET() {
  return NextResponse.json(sobre.get());
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = sobre.update(body);
  return NextResponse.json(updated);
}
