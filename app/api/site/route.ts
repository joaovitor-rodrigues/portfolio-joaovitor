import { NextRequest, NextResponse } from "next/server";
import * as site from "@/lib/site";

export async function GET() {
  return NextResponse.json(site.get());
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const updated = site.update(body);
  return NextResponse.json(updated);
}
