"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { resolveImageUrl } from "@/lib/gdrive";

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo?: (i: number) => void;
}

export default function Lightbox({ images, index, onClose, onPrev, onNext, onJumpTo }: Props) {
  const [loaded, setLoaded] = useState(false);
  // "right" = next image enters from the right; "left" = prev enters from the left
  const directionRef = useRef<"right" | "left">("right");
  // animKey changes whenever index changes, forcing the wrapper to remount and replay the CSS animation
  const [animKey, setAnimKey] = useState(0);
  const prevIndexRef = useRef(index);

  useEffect(() => {
    if (index !== prevIndexRef.current) {
      directionRef.current = index > prevIndexRef.current ? "right" : "left";
      // Handle wrap-around: going from last → first is "next" (right)
      if (prevIndexRef.current === images.length - 1 && index === 0) directionRef.current = "right";
      if (prevIndexRef.current === 0 && index === images.length - 1) directionRef.current = "left";
      prevIndexRef.current = index;
      setLoaded(false);
      setAnimKey((k) => k + 1);
    }
  }, [index, images.length]);

  // Preload adjacent images
  useEffect(() => {
    const adj = [
      images[(index + 1) % images.length],
      images[(index - 1 + images.length) % images.length],
    ].filter((url, i, arr) => url && arr.indexOf(url) === i);
    adj.forEach((url) => { const img = new Image(); img.src = resolveImageUrl(url); });
  }, [index, images]);

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    directionRef.current = "right";
    onNext();
  }
  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    directionRef.current = "left";
    onPrev();
  }

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") { directionRef.current = "left";  onPrev(); }
      if (e.key === "ArrowRight") { directionRef.current = "right"; onNext(); }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const enterClass = directionRef.current === "right" ? "lb-enter-right" : "lb-enter-left";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Contador */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums select-none tracking-wide">
        {index + 1} / {images.length}
      </div>

      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
        aria-label="Fechar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Anterior */}
      {images.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Imagem com transição */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-7 h-7 text-white/30 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
        {/* key forces remount → CSS animation replays */}
        <div key={animKey} className={enterClass}>
          <img
            src={resolveImageUrl(images[index])}
            alt={`Imagem ${index + 1}`}
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
            draggable={false}
          />
        </div>
      </div>

      {/* Próxima */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          aria-label="Próxima"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                directionRef.current = i > index ? "right" : "left";
                onJumpTo?.(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Imagem ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
