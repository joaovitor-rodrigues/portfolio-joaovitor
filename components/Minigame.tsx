"use client";

import { useEffect, useRef, useCallback } from "react";

const W = 900;
const H = 190;
const GROUND_Y = 152;
const CHAR_X = 90;
const GRAVITY = 0.55;
const JUMP_VY = -12.5;

type ObstacleType = "tripod" | "reflector";

interface Obstacle {
  x: number;
  type: ObstacleType;
}

interface GameState {
  running: boolean;
  over: boolean;
  charY: number;
  charVY: number;
  onGround: boolean;
  frame: number;
  tick: number;
  score: number;
  speed: number;
  obstacles: Obstacle[];
  nextObstacleIn: number;
}

function makeState(): GameState {
  return {
    running: false,
    over: false,
    charY: GROUND_Y,
    charVY: 0,
    onGround: true,
    frame: 0,
    tick: 0,
    score: 0,
    speed: 4,
    obstacles: [],
    nextObstacleIn: 90,
  };
}

// ─── Desenho ──────────────────────────────────────────────────────────────────

function drawGround(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 1);
  ctx.lineTo(W, GROUND_Y + 1);
  ctx.stroke();
  // detalhe de textura no chão
  ctx.strokeStyle = "#F3F4F6";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 2);
    ctx.lineTo(x + 18, GROUND_Y + 2);
    ctx.stroke();
  }
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  onGround: boolean
) {
  const fy = y; // pés

  // ── Pernas ──
  ctx.fillStyle = "#4B5563";
  if (onGround) {
    if (frame === 0) {
      // perna esq atrás, dir na frente
      ctx.fillRect(x - 8, fy - 24, 7, 20);
      ctx.fillRect(x + 3, fy - 20, 7, 20);
    } else {
      ctx.fillRect(x - 8, fy - 20, 7, 20);
      ctx.fillRect(x + 3, fy - 24, 7, 20);
    }
  } else {
    // pernas dobradas no salto
    ctx.fillRect(x - 9, fy - 28, 7, 14);
    ctx.fillRect(x + 3, fy - 24, 7, 14);
  }

  // ── Sapatos ──
  ctx.fillStyle = "#111118";
  if (onGround) {
    if (frame === 0) {
      ctx.fillRect(x - 12, fy - 6, 15, 6);
      ctx.fillRect(x + 1, fy - 3, 13, 5);
    } else {
      ctx.fillRect(x - 12, fy - 3, 13, 5);
      ctx.fillRect(x + 1, fy - 6, 15, 6);
    }
  } else {
    ctx.fillRect(x - 11, fy - 16, 11, 5);
    ctx.fillRect(x + 3, fy - 13, 11, 5);
  }

  // ── Corpo ──
  ctx.fillStyle = "#7C3AED";
  ctx.fillRect(x - 10, fy - 50, 26, 26);

  // detalhe bolso / lapela
  ctx.fillStyle = "#6D28D9";
  ctx.fillRect(x - 8, fy - 48, 8, 10);

  // ── Câmera (segurada na frente) ──
  // Correia
  ctx.strokeStyle = "#5B21B6";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 16, fy - 48);
  ctx.quadraticCurveTo(x + 24, fy - 44, x + 22, fy - 38);
  ctx.stroke();

  // Corpo da câmera
  ctx.fillStyle = "#1F2937";
  ctx.fillRect(x + 14, fy - 46, 22, 16);

  // Grip lateral
  ctx.fillStyle = "#111118";
  ctx.fillRect(x + 12, fy - 44, 4, 12);

  // Lente
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.arc(x + 30, fy - 38, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4B5563";
  ctx.beginPath();
  ctx.arc(x + 30, fy - 38, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6B7280";
  ctx.beginPath();
  ctx.arc(x + 30, fy - 38, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(147,197,253,0.3)";
  ctx.beginPath();
  ctx.arc(x + 29, fy - 39, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Flash no topo
  ctx.fillStyle = "#374151";
  ctx.fillRect(x + 18, fy - 50, 10, 5);

  // ── Cabeça ──
  ctx.fillStyle = "#F5CBA7";
  ctx.beginPath();
  ctx.arc(x + 3, fy - 58, 11, 0, Math.PI * 2);
  ctx.fill();

  // Boné / viseira
  ctx.fillStyle = "#7C3AED";
  ctx.fillRect(x - 8, fy - 66, 24, 9);
  // brim
  ctx.fillRect(x - 12, fy - 60, 8, 4);

  // Olho (olhando para a câmera)
  ctx.fillStyle = "#111118";
  ctx.beginPath();
  ctx.arc(x + 6, fy - 58, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // highlight do olho
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x + 7, fy - 59, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Orelha de fone (monitoramento)
  ctx.fillStyle = "#1F2937";
  ctx.beginPath();
  ctx.arc(x - 7, fy - 58, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.arc(x - 7, fy - 58, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTripod(ctx: CanvasRenderingContext2D, x: number) {
  const base = GROUND_Y;
  const topY = base - 62;

  // Pernas do tripé
  ctx.strokeStyle = "#4B5563";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  ctx.beginPath(); ctx.moveTo(x, topY + 12); ctx.lineTo(x - 20, base); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, topY + 12); ctx.lineTo(x + 20, base); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, topY + 12); ctx.lineTo(x, base); ctx.stroke();

  // Capas dos pés
  ctx.fillStyle = "#6B7280";
  ctx.fillRect(x - 23, base - 5, 8, 5);
  ctx.fillRect(x + 15, base - 5, 8, 5);
  ctx.fillRect(x - 4, base - 5, 8, 5);

  // Haste vertical superior
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, topY + 12); ctx.lineTo(x, topY); ctx.stroke();

  // Câmera no topo
  ctx.fillStyle = "#1F2937";
  ctx.fillRect(x - 12, topY - 12, 24, 14);
  // Lente
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.arc(x + 12, topY - 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4B5563";
  ctx.beginPath();
  ctx.arc(x + 12, topY - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  // Visor
  ctx.fillStyle = "#374151";
  ctx.fillRect(x - 12, topY - 14, 8, 4);

  ctx.lineCap = "butt";
}

function drawReflector(ctx: CanvasRenderingContext2D, x: number) {
  const base = GROUND_Y;
  const poleTop = base - 65;

  // Pernas do suporte
  ctx.strokeStyle = "#6B7280";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x, base - 30); ctx.lineTo(x - 16, base); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, base - 30); ctx.lineTo(x + 16, base); ctx.stroke();

  // Capas dos pés
  ctx.fillStyle = "#9CA3AF";
  ctx.fillRect(x - 19, base - 5, 8, 5);
  ctx.fillRect(x + 11, base - 5, 8, 5);

  // Haste principal
  ctx.strokeStyle = "#9CA3AF";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, base - 30); ctx.lineTo(x, poleTop); ctx.stroke();

  ctx.lineCap = "butt";

  // Cabeça inclinada do refletor
  ctx.save();
  ctx.translate(x, poleTop - 4);
  ctx.rotate(-0.25);

  // Aro externo
  ctx.strokeStyle = "#9CA3AF";
  ctx.fillStyle = "#F3F4F6";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Interior do refletor (grade)
  ctx.strokeStyle = "#D1D5DB";
  ctx.lineWidth = 1;
  for (let i = -14; i <= 14; i += 7) {
    ctx.beginPath(); ctx.moveTo(i, -14); ctx.lineTo(i, 14); ctx.stroke();
  }

  // Reflexo de luz
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(6, 6); ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(4, -2); ctx.stroke();
  ctx.globalAlpha = 1;

  // Braço de conexão
  ctx.strokeStyle = "#6B7280";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(0, 22); ctx.stroke();

  ctx.restore();
}

function drawScore(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = "#D1D5DB";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.textAlign = "right";
  ctx.fillText(String(score).padStart(5, "0"), W - 20, 22);
}

function drawHint(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#D1D5DB";
  ctx.font = "13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("pressione  ESPAÇO  ou  toque  para começar", W / 2, H / 2 + 4);
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  // fundo semitransparente
  ctx.fillStyle = "rgba(249,250,251,0.85)";
  ctx.fillRect(W / 2 - 170, H / 2 - 36, 340, 72);

  ctx.fillStyle = "#374151";
  ctx.font = "bold 17px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", W / 2, H / 2 - 10);

  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 13px system-ui, sans-serif";
  ctx.fillText(`Pontuação: ${score}`, W / 2, H / 2 + 10);

  ctx.fillStyle = "#9CA3AF";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("pressione ESPAÇO ou toque para jogar novamente", W / 2, H / 2 + 28);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Minigame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(makeState());
  const rafRef = useRef<number>(0);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.running || s.over) {
      if (s.over) {
        stateRef.current = makeState();
      }
      stateRef.current.running = true;
      return;
    }
    if (s.onGround) {
      s.charVY = JUMP_VY;
      s.onGround = false;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function tick() {
      const s = stateRef.current;

      // ── Limpar ──
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#FAFAFA";
      ctx!.fillRect(0, 0, W, H);

      drawGround(ctx!);

      // ── Idle ──
      if (!s.running && !s.over) {
        drawCharacter(ctx!, CHAR_X, GROUND_Y, 0, true);
        drawScore(ctx!, 0);
        drawHint(ctx!);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── Game Over (congelado) ──
      if (s.over) {
        drawCharacter(ctx!, CHAR_X, s.charY, 1, false);
        s.obstacles.forEach((ob) => {
          if (ob.type === "tripod") drawTripod(ctx!, ob.x);
          else drawReflector(ctx!, ob.x);
        });
        drawScore(ctx!, s.score);
        drawGameOver(ctx!, s.score);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // ── Update ──
      s.tick++;
      s.score = Math.floor(s.tick / 6);
      s.speed = 4 + Math.floor(s.score / 150) * 0.6;

      // Física
      if (!s.onGround) {
        s.charVY += GRAVITY;
        s.charY += s.charVY;
        if (s.charY >= GROUND_Y) {
          s.charY = GROUND_Y;
          s.charVY = 0;
          s.onGround = true;
        }
      }

      // Animação de corrida
      if (s.tick % 7 === 0) s.frame = 1 - s.frame;

      // Spawn de obstáculos
      s.nextObstacleIn--;
      if (s.nextObstacleIn <= 0) {
        const type: ObstacleType = Math.random() > 0.5 ? "tripod" : "reflector";
        s.obstacles.push({ x: W + 30, type });
        s.nextObstacleIn = 55 + Math.floor(Math.random() * 75);
      }

      // Mover e limpar obstáculos fora da tela
      s.obstacles = s.obstacles
        .map((ob) => ({ ...ob, x: ob.x - s.speed }))
        .filter((ob) => ob.x > -80);

      // ── Colisão (AABB simplificado) ──
      const charL = CHAR_X - 6;
      const charR = CHAR_X + 22; // só o corpo (exclui câmera)
      const charT = s.charY - 50;
      const charB = s.charY - 4;

      for (const ob of s.obstacles) {
        const w = ob.type === "tripod" ? 20 : 20;
        const obL = ob.x - w;
        const obR = ob.x + w;
        const obT = GROUND_Y - (ob.type === "tripod" ? 60 : 62);

        if (charR > obL + 3 && charL < obR - 3 && charB > obT + 4 && charT < GROUND_Y) {
          s.over = true;
          break;
        }
      }

      // ── Desenhar ──
      drawCharacter(ctx!, CHAR_X, s.charY, s.frame, s.onGround);
      s.obstacles.forEach((ob) => {
        if (ob.type === "tripod") drawTripod(ctx!, ob.x);
        else drawReflector(ctx!, ob.x);
      });
      drawScore(ctx!, s.score);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Controles: teclado + toque + clique
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }
    function onPointer() {
      jump();
    }

    window.addEventListener("keydown", onKey);
    const canvas = canvasRef.current;
    canvas?.addEventListener("touchstart", onPointer, { passive: true });
    canvas?.addEventListener("click", onPointer);

    return () => {
      window.removeEventListener("keydown", onKey);
      canvas?.removeEventListener("touchstart", onPointer);
      canvas?.removeEventListener("click", onPointer);
    };
  }, [jump]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: "100%", maxWidth: W, display: "block", cursor: "pointer" }}
      className="rounded-xl border border-[#E5E7EB]"
      aria-label="Minigame: diretor de fotografia — pressione espaço para jogar"
    />
  );
}
