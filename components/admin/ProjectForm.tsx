"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Projeto, Festival, Premio, MembroElenco } from "@/lib/projetos";
import { resolveImageUrl } from "@/lib/gdrive";
import { Categoria } from "@/lib/categorias";
import { FuncaoEquipe } from "@/lib/funcoes";

interface Props {
  projeto?: Projeto;
  categorias: Categoria[];
  funcoes: FuncaoEquipe[];
  mode: "new" | "edit";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProjectForm({ projeto, categorias, funcoes, mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: projeto?.titulo || "",
    slug: projeto?.slug || "",
    funcaoRealizada: projeto?.funcaoRealizada || "",
    ano: projeto?.ano?.toString() || new Date().getFullYear().toString(),
    duracao: projeto?.duracao || "",
    genero: projeto?.genero || "",
    sinopse: projeto?.sinopse || "",
    descricaoCurta: projeto?.descricaoCurta || "",
    descricaoLonga: projeto?.descricaoLonga || "",
    thumb: projeto?.thumb || "",
    videoUrl: projeto?.videoUrl || "",
    destaque: projeto?.destaque || false,
    publicado: projeto?.publicado !== undefined ? projeto.publicado : true,
  });

  const [categoriasSelected, setCategoriasSelected] = useState<string[]>(
    projeto?.categorias?.length
      ? projeto.categorias
      : projeto?.categoriaId
      ? [projeto.categoriaId]
      : []
  );

  function toggleCategoria(id: string) {
    setCategoriasSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  // Lista dinâmica de formatos
  const [formatos, setFormatos] = useState<string[]>(
    projeto?.formato?.length ? projeto.formato : [""]
  );

  // Galeria
  const [galeria, setGaleria] = useState<string[]>(
    projeto?.galeria?.length ? projeto.galeria : [""]
  );

  // Festivais
  const [festivais, setFestivais] = useState<Festival[]>(projeto?.festivais ?? []);
  const [mostrarFestivais, setMostrarFestivais] = useState(projeto?.mostrarFestivais ?? true);

  // Prêmios
  const [premios, setPremios] = useState<Premio[]>(projeto?.premios ?? []);
  const [mostrarPremios, setMostrarPremios] = useState(projeto?.mostrarPremios ?? true);

  // Elenco
  const [elenco, setElenco] = useState<MembroElenco[]>(projeto?.elenco ?? []);
  const [mostrarElenco, setMostrarElenco] = useState(projeto?.mostrarElenco ?? true);

  const dragElencoIdx = useRef<number | null>(null);
  const dragOverElencoIdx = useRef<number | null>(null);

  function onElencoDragStart(index: number) { dragElencoIdx.current = index; }
  function onElencoDragOver(e: React.DragEvent, index: number) { e.preventDefault(); dragOverElencoIdx.current = index; }
  function onElencoDrop() {
    const from = dragElencoIdx.current;
    const to = dragOverElencoIdx.current;
    if (from !== null && to !== null && from !== to) {
      setElenco((prev) => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    }
    dragElencoIdx.current = null;
    dragOverElencoIdx.current = null;
  }
  function moveElencoItem(from: number, to: number) {
    if (to < 0 || to >= elenco.length) return;
    setElenco((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  // Equipe — rows adicionados manualmente pelo usuário
  type EquipeRow = {
    funcaoId: string;
    funcaoNome: string;
    nome: string;
    instagramUrl: string;
    fotoUrl: string;
  };

  function buildEquipeRows(): EquipeRow[] {
    const rows: EquipeRow[] = [];
    // Só inclui as funções já salvas no projeto
    for (const m of projeto?.equipe ?? []) {
      const funcao = funcoes.find((f) => f.id === m.funcaoId);
      if (funcao) {
        rows.push({
          funcaoId: m.funcaoId,
          funcaoNome: funcao.nome,
          nome: m.nome,
          instagramUrl: m.instagramUrl ?? "",
          fotoUrl: m.fotoUrl ?? "",
        });
      }
    }
    return rows;
  }

  const [equipeRows, setEquipeRows] = useState<EquipeRow[]>(buildEquipeRows);
  const [selectedFuncaoId, setSelectedFuncaoId] = useState("");

  function addEquipeRow() {
    if (!selectedFuncaoId) return;
    const funcao = funcoes.find((f) => f.id === selectedFuncaoId);
    if (!funcao) return;
    setEquipeRows((prev) => [
      ...prev,
      { funcaoId: selectedFuncaoId, funcaoNome: funcao.nome, nome: "", instagramUrl: "", fotoUrl: "" },
    ]);
    setSelectedFuncaoId("");
  }

  function removeEquipeRow(idx: number) {
    setEquipeRows((prev) => prev.filter((_, i) => i !== idx));
  }
  const [mostrarEquipe, setMostrarEquipe] = useState(projeto?.mostrarEquipe ?? true);

  // Drag-to-reorder equipe
  const dragEquipeIdx = useRef<number | null>(null);
  const dragOverEquipeIdx = useRef<number | null>(null);

  function onEquipeDragStart(index: number) { dragEquipeIdx.current = index; }
  function onEquipeDragOver(e: React.DragEvent, index: number) { e.preventDefault(); dragOverEquipeIdx.current = index; }
  function onEquipeDrop() {
    const from = dragEquipeIdx.current;
    const to = dragOverEquipeIdx.current;
    if (from !== null && to !== null && from !== to) {
      setEquipeRows((prev) => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    }
    dragEquipeIdx.current = null;
    dragOverEquipeIdx.current = null;
  }
  function moveEquipeRow(from: number, to: number) {
    if (to < 0 || to >= equipeRows.length) return;
    setEquipeRows((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  const [slugManual, setSlugManual] = useState(mode === "edit");

  useEffect(() => {
    if (!slugManual && form.titulo) {
      setForm((prev) => ({ ...prev, slug: slugify(form.titulo) }));
    }
  }, [form.titulo, slugManual]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === "slug") setSlugManual(true);
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  // --- Formatos ---
  function handleFormatoChange(index: number, value: string) {
    const updated = [...formatos];
    updated[index] = value;
    setFormatos(updated);
  }
  function addFormato() {
    setFormatos((prev) => [...prev, ""]);
  }
  function removeFormato(index: number) {
    setFormatos((prev) => prev.filter((_, i) => i !== index));
  }

  // --- Galeria ---
  const dragGaleriaIdx = useRef<number | null>(null);
  const dragOverGaleriaIdx = useRef<number | null>(null);

  function handleGaleriaChange(index: number, value: string) {
    const updated = [...galeria];
    updated[index] = value;
    setGaleria(updated);
  }
  function addGaleriaItem() {
    setGaleria((prev) => [...prev, ""]);
  }
  function removeGaleriaItem(index: number) {
    setGaleria((prev) => prev.filter((_, i) => i !== index));
  }
  function moveGaleriaItem(from: number, to: number) {
    if (from === to) return;
    setGaleria((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }
  function onGaleriaDragStart(index: number) {
    dragGaleriaIdx.current = index;
  }
  function onGaleriaDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    dragOverGaleriaIdx.current = index;
  }
  function onGaleriaDrop() {
    if (dragGaleriaIdx.current !== null && dragOverGaleriaIdx.current !== null) {
      moveGaleriaItem(dragGaleriaIdx.current, dragOverGaleriaIdx.current);
    }
    dragGaleriaIdx.current = null;
    dragOverGaleriaIdx.current = null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.titulo.trim()) {
      setError("Título é obrigatório");
      setLoading(false);
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug é obrigatório");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      ano: Number(form.ano),
      formato: formatos.filter((f) => f.trim() !== ""),
      galeria: galeria.filter((url) => url.trim() !== ""),
      categorias: categoriasSelected,
      festivais,
      mostrarFestivais,
      premios,
      mostrarPremios,
      elenco,
      mostrarElenco,
      equipe: equipeRows
        .filter((r) => r.nome.trim() !== "")
        .map(({ funcaoId, nome, instagramUrl, fotoUrl }) => ({
          id: funcaoId,
          funcaoId,
          nome: nome.trim(),
          instagramUrl: instagramUrl.trim() || undefined,
          fotoUrl: fotoUrl.trim() || undefined,
        })),
      mostrarEquipe,
    };

    try {
      let res: Response;
      if (mode === "new") {
        res = await fetch("/api/projetos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/projetos/${projeto!.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/admin/projetos");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          placeholder="Nome do projeto"
        />
      </div>

      {/* Função realizada */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">
          Função realizada <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="funcaoRealizada"
          value={form.funcaoRealizada}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          placeholder="Ex: Direção de Fotografia"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 font-mono"
          placeholder="url-do-projeto"
        />
        <p className="mt-1 text-xs text-[#9CA3AF]">Gerado automaticamente do título. Edite se necessário.</p>
      </div>

      {/* Formatos — lista dinâmica */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Formato
          <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(curta, longa, série, videoclipe…)</span>
        </label>
        <div className="space-y-2">
          {formatos.map((f, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={f}
                onChange={(e) => handleFormatoChange(index, e.target.value)}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                placeholder="Ex: Curta-metragem"
              />
              {formatos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFormato(index)}
                  className="px-3 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFormato}
          className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Adicionar formato
        </button>
      </div>

      {/* Ano e Duração */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Ano</label>
          <input
            type="number"
            name="ano"
            value={form.ano}
            onChange={handleChange}
            min="1900"
            max="2099"
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-1">Duração</label>
          <input
            type="text"
            name="duracao"
            value={form.duracao}
            onChange={handleChange}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            placeholder="Ex: 18 min"
          />
        </div>
      </div>

      {/* Gênero */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">Gênero</label>
        <input
          type="text"
          name="genero"
          value={form.genero}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          placeholder="Ex: Drama, Documentário"
        />
      </div>

      {/* Sinopse */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">
          Sinopse
          <span className="ml-1 text-xs font-normal text-[#9CA3AF]">(resumo narrativo do projeto)</span>
        </label>
        <textarea
          name="sinopse"
          value={form.sinopse}
          onChange={handleChange}
          rows={4}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-y"
          placeholder="Uma breve sinopse do projeto…"
        />
      </div>

      {/* Categorias — multi-select com checkboxes */}
      {categorias.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Categorias</label>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat) => {
              const selected = categoriasSelected.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategoria(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                    selected
                      ? "text-white border-transparent"
                      : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                  style={selected ? { backgroundColor: cat.cor, borderColor: cat.cor } : {}}
                >
                  {cat.nome}
                </button>
              );
            })}
          </div>
          {categoriasSelected.length === 0 && (
            <p className="mt-1 text-xs text-[#9CA3AF]">Nenhuma categoria selecionada</p>
          )}
        </div>
      )}

      {/* Descrição curta */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">Descrição curta</label>
        <textarea
          name="descricaoCurta"
          value={form.descricaoCurta}
          onChange={handleChange}
          rows={2}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
          placeholder="Uma linha para o card"
        />
      </div>

      {/* Descrição longa */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">Descrição longa</label>
        <textarea
          name="descricaoLonga"
          value={form.descricaoLonga}
          onChange={handleChange}
          rows={6}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-y"
          placeholder="Texto completo da página do projeto"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">URL da Thumbnail</label>
        <input
          type="url"
          name="thumb"
          value={form.thumb}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          placeholder="https://..."
        />
        {form.thumb && (
          <img
            src={resolveImageUrl(form.thumb)}
            alt="Preview"
            className="mt-2 h-24 rounded-lg object-cover border border-[#E5E7EB]"
          />
        )}
      </div>

      {/* Galeria */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Galeria de imagens
          {galeria.filter(Boolean).length > 1 && (
            <span className="ml-2 text-xs font-normal text-[#9CA3AF]">Arraste para reordenar</span>
          )}
        </label>
        <div className="space-y-2">
          {galeria.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => onGaleriaDragStart(index)}
              onDragOver={(e) => onGaleriaDragOver(e, index)}
              onDrop={onGaleriaDrop}
              className="flex gap-2 items-center group rounded-lg transition-colors"
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing p-1.5 text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <circle cx="5" cy="4" r="1.2" />
                  <circle cx="5" cy="8" r="1.2" />
                  <circle cx="5" cy="12" r="1.2" />
                  <circle cx="11" cy="4" r="1.2" />
                  <circle cx="11" cy="8" r="1.2" />
                  <circle cx="11" cy="12" r="1.2" />
                </svg>
              </div>

              {/* Thumbnail preview */}
              {url ? (
                <img
                  src={resolveImageUrl(url)}
                  alt=""
                  draggable={false}
                  className="w-12 h-8 object-cover rounded border border-[#E5E7EB] flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-8 rounded border border-dashed border-[#D1D5DB] flex-shrink-0 bg-[#F8F8FA]" />
              )}

              {/* URL input */}
              <input
                type="url"
                value={url}
                onChange={(e) => handleGaleriaChange(index, e.target.value)}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                placeholder="https://..."
              />

              {/* Up / Down */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveGaleriaItem(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Mover para cima"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveGaleriaItem(index, index + 1)}
                  disabled={index === galeria.length - 1}
                  className="p-1 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Mover para baixo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeGaleriaItem(index)}
                className="px-2.5 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB] flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addGaleriaItem}
          className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Adicionar imagem
        </button>
      </div>

      {/* Vídeo URL */}
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1">URL do Vídeo (embed)</label>
        <input
          type="url"
          name="videoUrl"
          value={form.videoUrl}
          onChange={handleChange}
          className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
          placeholder="https://www.youtube.com/embed/..."
        />
      </div>

      {/* Festivais */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#374151]">Festivais</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Participações em festivais e mostras</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#6B7280]">{mostrarFestivais ? "Visível" : "Oculto"}</span>
            <input
              type="checkbox"
              checked={mostrarFestivais}
              onChange={(e) => setMostrarFestivais(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </label>
        </div>
        <div className="space-y-3">
          {festivais.map((f, idx) => (
            <div key={f.id} className="grid grid-cols-3 gap-2 items-start bg-[#F8F8FA] p-3 rounded-lg">
              <input
                type="text"
                value={f.nome}
                onChange={(e) => setFestivais((prev) => prev.map((x, i) => i === idx ? { ...x, nome: e.target.value } : x))}
                placeholder="Nome do festival"
                className="col-span-3 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
              <input
                type="text"
                value={f.edicao}
                onChange={(e) => setFestivais((prev) => prev.map((x, i) => i === idx ? { ...x, edicao: e.target.value } : x))}
                placeholder="Edição / Ano"
                className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
              <input
                type="text"
                value={f.resultado}
                onChange={(e) => setFestivais((prev) => prev.map((x, i) => i === idx ? { ...x, resultado: e.target.value } : x))}
                placeholder="Resultado (ex: Seleção Oficial)"
                className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
              <button
                type="button"
                onClick={() => setFestivais((prev) => prev.filter((_, i) => i !== idx))}
                className="px-3 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB] bg-white"
              >✕</button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFestivais((prev) => [...prev, { id: `f-${Date.now()}`, nome: "", edicao: "", resultado: "" }])}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Adicionar festival
        </button>
      </div>

      {/* Prêmios */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#374151]">Prêmios</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Prêmios e reconhecimentos recebidos</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#6B7280]">{mostrarPremios ? "Visível" : "Oculto"}</span>
            <input
              type="checkbox"
              checked={mostrarPremios}
              onChange={(e) => setMostrarPremios(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </label>
        </div>
        <div className="space-y-3">
          {premios.map((p, idx) => {
            const festivaisDisponiveis = festivais.filter((f) => f.nome.trim() !== "");
            return (
              <div key={p.id} className="space-y-2 bg-[#F8F8FA] p-3 rounded-lg border border-[#E5E7EB]">
                {/* Nome do prêmio + botão remover */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={p.nome}
                    onChange={(e) => setPremios((prev) => prev.map((x, i) => i === idx ? { ...x, nome: e.target.value } : x))}
                    placeholder="Nome do prêmio"
                    className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setPremios((prev) => prev.filter((_, i) => i !== idx))}
                    className="px-3 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB] bg-white"
                  >✕</button>
                </div>

                {/* Categoria + Ano */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={p.categoria}
                    onChange={(e) => setPremios((prev) => prev.map((x, i) => i === idx ? { ...x, categoria: e.target.value } : x))}
                    placeholder="Categoria (ex: Melhor Fotografia)"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                  <input
                    type="text"
                    value={p.ano}
                    onChange={(e) => setPremios((prev) => prev.map((x, i) => i === idx ? { ...x, ano: e.target.value } : x))}
                    placeholder="Ano"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                </div>

                {/* Vínculo com festival */}
                {festivaisDisponiveis.length > 0 && (
                  <div>
                    <label className="block text-xs text-[#9CA3AF] mb-1">Festival relacionado (opcional)</label>
                    <select
                      value={p.festivalId ?? ""}
                      onChange={(e) => setPremios((prev) =>
                        prev.map((x, i) => i === idx ? { ...x, festivalId: e.target.value || undefined } : x)
                      )}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-[#374151]"
                    >
                      <option value="">— Sem festival vinculado</option>
                      {festivaisDisponiveis.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome}{f.edicao ? ` — ${f.edicao}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setPremios((prev) => [...prev, { id: `p-${Date.now()}`, nome: "", categoria: "", ano: "", festivalId: undefined }])}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Adicionar prêmio
        </button>
      </div>

      {/* Elenco */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#374151]">Elenco</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Atores e personagens. Arraste para reordenar.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#6B7280]">{mostrarElenco ? "Visível" : "Oculto"}</span>
            <input
              type="checkbox"
              checked={mostrarElenco}
              onChange={(e) => setMostrarElenco(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </label>
        </div>

        <div className="space-y-2">
          {elenco.map((m, idx) => (
            <div
              key={m.id}
              draggable
              onDragStart={() => onElencoDragStart(idx)}
              onDragOver={(e) => onElencoDragOver(e, idx)}
              onDrop={onElencoDrop}
              className="flex gap-2 items-start bg-[#F8F8FA] p-3 rounded-lg border border-[#E5E7EB]"
            >
              {/* Drag handle + setas */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-1">
                <div className="cursor-grab active:cursor-grabbing p-1 text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
                    <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
                  </svg>
                </div>
                <button type="button" onClick={() => moveElencoItem(idx, idx - 1)} disabled={idx === 0}
                  className="p-0.5 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => moveElencoItem(idx, idx + 1)} disabled={idx === elenco.length - 1}
                  className="p-0.5 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Campos */}
              <div className="flex-1 grid gap-2">
                {/* Ator + Personagem */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={m.ator}
                    onChange={(e) => setElenco((prev) => prev.map((x, i) => i === idx ? { ...x, ator: e.target.value } : x))}
                    placeholder="Nome do ator"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                  <input
                    type="text"
                    value={m.personagem}
                    onChange={(e) => setElenco((prev) => prev.map((x, i) => i === idx ? { ...x, personagem: e.target.value } : x))}
                    placeholder="Nome do personagem"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                </div>
                {/* Instagram + Foto */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={m.instagramUrl ?? ""}
                    onChange={(e) => setElenco((prev) => prev.map((x, i) => i === idx ? { ...x, instagramUrl: e.target.value || undefined } : x))}
                    placeholder="@instagram (opcional)"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                  <input
                    type="url"
                    value={m.fotoUrl ?? ""}
                    onChange={(e) => setElenco((prev) => prev.map((x, i) => i === idx ? { ...x, fotoUrl: e.target.value || undefined } : x))}
                    placeholder="URL da foto (opcional)"
                    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                  />
                </div>
              </div>

              {/* Remover */}
              <button
                type="button"
                onClick={() => setElenco((prev) => prev.filter((_, i) => i !== idx))}
                className="px-2.5 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB] bg-white flex-shrink-0 mt-0.5"
              >✕</button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setElenco((prev) => [...prev, { id: `e-${Date.now()}`, ator: "", personagem: "" }])}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> Adicionar membro do elenco
        </button>
      </div>

      {/* Equipe */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#374151]">Equipe</h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Preencha os profissionais de cada função. Arraste para reordenar.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#6B7280]">{mostrarEquipe ? "Visível" : "Oculto"}</span>
            <input
              type="checkbox"
              checked={mostrarEquipe}
              onChange={(e) => setMostrarEquipe(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-600"
            />
          </label>
        </div>

        {funcoes.length === 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Nenhuma função cadastrada. Cadastre funções em{" "}
            <a href="/admin/funcoes" className="underline font-medium">Admin → Funções</a>.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Rows adicionados */}
            {equipeRows.length > 0 && (
              <div className="space-y-2">
                {equipeRows.map((row, idx) => (
                  <div
                    key={row.funcaoId}
                    draggable
                    onDragStart={() => onEquipeDragStart(idx)}
                    onDragOver={(e) => onEquipeDragOver(e, idx)}
                    onDrop={onEquipeDrop}
                    className="flex gap-2 items-start bg-[#F8F8FA] p-3 rounded-lg border border-[#E5E7EB] group"
                  >
                    {/* Drag handle + up/down */}
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-1">
                      <div className="cursor-grab active:cursor-grabbing p-1 text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                          <circle cx="5" cy="4" r="1.2" /><circle cx="5" cy="8" r="1.2" /><circle cx="5" cy="12" r="1.2" />
                          <circle cx="11" cy="4" r="1.2" /><circle cx="11" cy="8" r="1.2" /><circle cx="11" cy="12" r="1.2" />
                        </svg>
                      </div>
                      <button type="button" onClick={() => moveEquipeRow(idx, idx - 1)} disabled={idx === 0}
                        className="p-0.5 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => moveEquipeRow(idx, idx + 1)} disabled={idx === equipeRows.length - 1}
                        className="p-0.5 text-[#9CA3AF] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 grid gap-2">
                      {/* Rótulo da função */}
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        {row.funcaoNome}
                      </p>
                      {/* Nome do profissional */}
                      <input
                        type="text"
                        value={row.nome}
                        onChange={(e) => setEquipeRows((prev) => prev.map((x, i) => i === idx ? { ...x, nome: e.target.value } : x))}
                        placeholder="Nome do profissional"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                      />
                      {/* Instagram + Foto */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={row.instagramUrl}
                          onChange={(e) => setEquipeRows((prev) => prev.map((x, i) => i === idx ? { ...x, instagramUrl: e.target.value } : x))}
                          placeholder="@instagram (opcional)"
                          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                        />
                        <input
                          type="url"
                          value={row.fotoUrl}
                          onChange={(e) => setEquipeRows((prev) => prev.map((x, i) => i === idx ? { ...x, fotoUrl: e.target.value } : x))}
                          placeholder="URL da foto (opcional)"
                          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                        />
                      </div>
                    </div>

                    {/* Remover */}
                    <button
                      type="button"
                      onClick={() => removeEquipeRow(idx)}
                      className="px-2.5 py-2 text-[#EF4444] hover:bg-red-50 rounded-lg text-sm transition-colors border border-[#E5E7EB] bg-white flex-shrink-0 mt-0.5"
                      title="Remover função"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Seletor para adicionar nova função */}
            {funcoes.filter((f) => !equipeRows.some((r) => r.funcaoId === f.id)).length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedFuncaoId}
                  onChange={(e) => setSelectedFuncaoId(e.target.value)}
                  className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 text-[#374151]"
                >
                  <option value="">Selecionar função para adicionar…</option>
                  {funcoes
                    .filter((f) => !equipeRows.some((r) => r.funcaoId === f.id))
                    .map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addEquipeRow}
                  disabled={!selectedFuncaoId}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  + Adicionar
                </button>
              </div>
            ) : equipeRows.length > 0 ? (
              <p className="text-xs text-[#9CA3AF]">Todas as funções cadastradas já foram adicionadas.</p>
            ) : null}

            {equipeRows.length === 0 && funcoes.length > 0 && !selectedFuncaoId && (
              <p className="text-xs text-[#9CA3AF]">Nenhuma função adicionada. Selecione acima para incluir membros da equipe.</p>
            )}
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="destaque"
            checked={form.destaque}
            onChange={handleChange}
            className="w-4 h-4 rounded border-[#E5E7EB] accent-purple-600"
          />
          <span className="text-sm text-[#374151]">Projeto em destaque</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="publicado"
            checked={form.publicado}
            onChange={handleChange}
            className="w-4 h-4 rounded border-[#E5E7EB] accent-purple-600"
          />
          <span className="text-sm text-[#374151]">Publicado</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Salvando..." : mode === "new" ? "Criar Projeto" : "Salvar Alterações"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projetos")}
          className="px-6 py-2.5 border border-[#E5E7EB] text-[#374151] hover:bg-[#F8F8FA] text-sm font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
