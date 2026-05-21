import { NextRequest, NextResponse } from "next/server";
import * as projetos from "@/lib/projetos";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoriaSlug = searchParams.get("categoria") || undefined;
  const funcao = searchParams.get("funcao") || undefined;
  const destaqueParam = searchParams.get("destaque");
  const destaque = destaqueParam === "true" ? true : destaqueParam === "false" ? false : undefined;

  let all = projetos.getAll();

  if (destaque !== undefined) {
    all = all.filter((p) => p.destaque === destaque);
  }

  if (categoriaSlug) {
    const { getAll: getCats } = await import("@/lib/categorias");
    const cats = getCats();
    const cat = cats.find((c) => c.slug === categoriaSlug);
    all = cat ? all.filter((p) => p.categorias?.includes(cat.id)) : [];
  }

  if (funcao) {
    all = all.filter((p) => p.funcaoRealizada === funcao);
  }

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  // Basic validation
  if (!body.titulo || !body.slug) {
    return NextResponse.json({ error: "Título e slug são obrigatórios" }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = projetos.getBySlug(body.slug);
  if (existing) {
    return NextResponse.json({ error: "Slug já existe" }, { status: 400 });
  }

  const novo = projetos.create({
    slug: body.slug,
    titulo: body.titulo,
    funcaoRealizada: body.funcaoRealizada || "",
    formato: Array.isArray(body.formato) ? body.formato : [],
    ano: Number(body.ano) || new Date().getFullYear(),
    duracao: body.duracao || "",
    genero: body.genero || "",
    categorias: Array.isArray(body.categorias) ? body.categorias : (body.categoriaId ? [body.categoriaId] : []),
    descricaoCurta: body.descricaoCurta || "",
    descricaoLonga: body.descricaoLonga || "",
    thumb: body.thumb || "",
    galeria: body.galeria || [],
    videoUrl: body.videoUrl || "",
    destaque: Boolean(body.destaque),
    publicado: Boolean(body.publicado),
    festivais: Array.isArray(body.festivais) ? body.festivais : [],
    premios: Array.isArray(body.premios) ? body.premios : [],
    mostrarFestivais: body.mostrarFestivais !== false,
    mostrarPremios: body.mostrarPremios !== false,
  });

  return NextResponse.json(novo, { status: 201 });
}
