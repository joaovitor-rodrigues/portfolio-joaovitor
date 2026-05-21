import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL ausente" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        // Simula um browser para evitar bloqueios do Google
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Falha ao buscar imagem" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    // Só permite tipos de imagem
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL não é uma imagem" }, { status: 415 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar imagem" }, { status: 500 });
  }
}
