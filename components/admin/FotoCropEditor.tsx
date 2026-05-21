"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { resolveImageUrl } from "@/lib/gdrive";
import type { FotoCrop } from "@/lib/sobre";
import { applyCropStyles } from "@/lib/fotoCrop";

interface Props {
  src: string;
  crop: FotoCrop;
  onChange: (crop: FotoCrop) => void;
}

export { applyCropStyles } from "@/lib/fotoCrop";

export default function FotoCropEditor({ src, crop, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number } | null>(null);
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = resolveImageUrl(src);

  // Reset error when src changes
  useEffect(() => { setImgError(false); }, [src]);

  // Mouse/touch drag to reposition focal point
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCropX: crop.x,
      startCropY: crop.y,
    };
  }, [crop.x, crop.y]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sensitivity = 100 / Math.max(rect.width, 1);
    const dx = (dragRef.current.startX - e.clientX) * sensitivity;
    const dy = (dragRef.current.startY - e.clientY) * sensitivity;
    onChange({
      ...crop,
      x: Math.max(0, Math.min(100, dragRef.current.startCropX + dx)),
      y: Math.max(0, Math.min(100, dragRef.current.startCropY + dy)),
    });
  }, [crop, onChange]);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const { imgStyle } = applyCropStyles(crop);

  return (
    <div className="space-y-4">
      {/* Preview area */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] cursor-grab active:cursor-grabbing select-none"
        title="Arraste para reposicionar"
      >
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-sm">
            Imagem não disponível
          </div>
        ) : (
          <img
            src={resolvedSrc}
            alt="Preview"
            draggable={false}
            onError={() => setImgError(true)}
            style={imgStyle}
            className="pointer-events-none"
          />
        )}

        {/* Drag hint overlay (shown briefly) */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <span className="text-[10px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Arraste para reposicionar
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 p-4 bg-[#F8F8FA] rounded-xl border border-[#E5E7EB]">
        {/* Zoom */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-[#6B7280]">Zoom</label>
            <span className="text-xs text-[#9CA3AF] tabular-nums">{crop.scale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={crop.scale}
            onChange={(e) => onChange({ ...crop, scale: parseFloat(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 rounded-full"
          />
        </div>

        {/* Horizontal position */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-[#6B7280]">Posição horizontal</label>
            <span className="text-xs text-[#9CA3AF] tabular-nums">{Math.round(crop.x)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={crop.x}
            onChange={(e) => onChange({ ...crop, x: parseInt(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 rounded-full"
          />
        </div>

        {/* Vertical position */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-[#6B7280]">Posição vertical</label>
            <span className="text-xs text-[#9CA3AF] tabular-nums">{Math.round(crop.y)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={crop.y}
            onChange={(e) => onChange({ ...crop, y: parseInt(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 rounded-full"
          />
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={() => onChange({ x: 50, y: 50, scale: 1 })}
          className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
        >
          ↺ Redefinir
        </button>
      </div>
    </div>
  );
}
