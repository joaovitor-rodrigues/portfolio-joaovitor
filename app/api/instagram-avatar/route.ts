export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.replace(/^@/, "").trim();

  if (!username) {
    return NextResponse.json({ error: "username obrigatório" }, { status: 400 });
  }

  try {
    // Requisição server-side à página pública do perfil
    // O User-Agent do crawler do Facebook normalmente é aceito pelo Instagram
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_userinfo.php)",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
      // Cache de 1h para não bater no Instagram a cada renderização
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const html = await res.text();

    // Extrai a URL da imagem do meta og:image
    const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    const imageUrl = match?.[1];

    if (!imageUrl) {
      return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });
    }

    // Faz proxy da imagem para evitar CORS no cliente
    const imgRes = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_userinfo.php)",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!imgRes.ok) {
      return NextResponse.json({ error: "Erro ao baixar imagem" }, { status: 502 });
    }

    const imgBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(imgBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
