import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
}
