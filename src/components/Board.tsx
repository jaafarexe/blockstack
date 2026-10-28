import React, { useEffect, useRef } from 'react';
import { ActivePiece, BoardGrid, TetrominoType } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES } from '../utils/tetrominoes';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface BoardProps {
  board: BoardGrid;
  activePiece: ActivePiece | null;
  ghostY: number | null;
  showGhost: boolean;
  clearingRows: number[];
  flashIntensity?: number; // 0 to 1 during clear
  particlesRef: React.MutableRefObject<Particle[]>;
}

export const Board: React.FC<BoardProps> = ({
  board,
  activePiece,
  ghostY,
  showGhost,
  clearingRows,
  flashIntensity = 0,
  particlesRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    const cellSize = width / BOARD_WIDTH;

    // 1. Draw Grid Background
    ctx.fillStyle = '#080c14'; // Deep dark background
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= BOARD_WIDTH; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, height);
      ctx.stroke();
    }
    for (let r = 0; r <= BOARD_HEIGHT; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(width, r * cellSize);
      ctx.stroke();
    }

    // Helper to draw a modern stylized Tetris block
    const drawBlock = (
      x: number,
      y: number,
      type: TetrominoType,
      isGhost: boolean = false,
      isClearing: boolean = false
    ) => {
      const def = TETROMINOES[type];
      const px = x * cellSize;
      const py = y * cellSize;
      const pad = 1.5;
      const bSize = cellSize - pad * 2;
      const radius = 3;

      if (isGhost) {
        // Ghost Piece: semi-transparent glowing outline
        ctx.save();
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = def.glowColor.replace('0.45', '0.12');
        ctx.setLineDash([4, 3]);

        ctx.beginPath();
        ctx.roundRect(px + pad, py + pad, bSize, bSize, radius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (isClearing) {
        // White-hot line clear flash
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + flashIntensity * 0.3})`;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(px + pad, py + pad, bSize, bSize, radius);
        ctx.fill();
        ctx.restore();
        return;
      }

      // Standard Vibrant Block Rendering with Bevel & Glow
      ctx.save();
      // Outer subtle glow
      ctx.shadowColor = def.glowColor;
      ctx.shadowBlur = 4;

      // Base block fill
      const grad = ctx.createLinearGradient(px, py, px, py + bSize);
      grad.addColorStop(0, def.borderColor);
      grad.addColorStop(0.3, def.color);
      grad.addColorStop(1, def.accentColor);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.roundRect(px + pad, py + pad, bSize, bSize, radius);
      ctx.fill();

      // Top-left bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(px + pad, py + pad);
      ctx.lineTo(px + pad + bSize, py + pad);
      ctx.lineTo(px + pad + bSize - 3, py + pad + 3);
      ctx.lineTo(px + pad + 3, py + pad + 3);
      ctx.lineTo(px + pad + 3, py + pad + bSize - 3);
      ctx.lineTo(px + pad, py + pad + bSize);
      ctx.closePath();
      ctx.fill();

      // Bottom-right inner shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(px + pad + bSize, py + pad);
      ctx.lineTo(px + pad + bSize, py + pad + bSize);
      ctx.lineTo(px + pad, py + pad + bSize);
      ctx.lineTo(px + pad + 3, py + pad + bSize - 3);
      ctx.lineTo(px + pad + bSize - 3, py + pad + bSize - 3);
      ctx.lineTo(px + pad + bSize - 3, py + pad + 3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // 2. Draw Locked Board Blocks
    const clearingSet = new Set(clearingRows);
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        const cell = board[r][c];
        if (cell) {
          const isRowClearing = clearingSet.has(r);
          drawBlock(c, r, cell, false, isRowClearing);
        }
      }
    }

    // 3. Draw Ghost Piece
    if (showGhost && activePiece && ghostY !== null && ghostY !== activePiece.position.y) {
      const matrix = TETROMINOES[activePiece.type].matrices[activePiece.rotation];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] !== 0) {
            const gx = activePiece.position.x + c;
            const gy = ghostY + r;
            if (gy >= 0 && gy < BOARD_HEIGHT && gx >= 0 && gx < BOARD_WIDTH) {
              drawBlock(gx, gy, activePiece.type, true);
            }
          }
        }
      }
    }

    // 4. Draw Active Piece
    if (activePiece) {
      const matrix = TETROMINOES[activePiece.type].matrices[activePiece.rotation];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] !== 0) {
            const px = activePiece.position.x + c;
            const py = activePiece.position.y + r;
            if (py >= 0 && py < BOARD_HEIGHT && px >= 0 && px < BOARD_WIDTH) {
              drawBlock(px, py, activePiece.type, false, false);
            }
          }
        }
      }
    }

    // 5. Draw Particles
    if (particlesRef.current.length > 0) {
      ctx.save();
      for (const p of particlesRef.current) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x * cellSize, p.y * cellSize, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [board, activePiece, ghostY, showGhost, clearingRows, flashIntensity, particlesRef]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
      {/* Subtle top indicator border */}
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <canvas
        ref={canvasRef}
        className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] aspect-[1/2] rounded-xl border border-slate-800/80 shadow-inner block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
