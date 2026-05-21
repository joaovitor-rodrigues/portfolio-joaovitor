export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import * as site from "@/lib/site";

export async function GET() {
  const data = await site.get();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = await site.update(body);
  return NextResponse.json(updated);
}
