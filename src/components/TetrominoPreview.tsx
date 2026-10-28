import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TETROMINOES } from '../utils/tetrominoes';

interface TetrominoPreviewProps {
  type: TetrominoType | null;
  size?: 'sm' | 'md' | 'lg';
  locked?: boolean;
}

export const TetrominoPreview: React.FC<TetrominoPreviewProps> = ({
  type,
  size = 'md',
  locked = false,
}) => {
  if (!type) {
    return (
      <div className="w-full h-16 sm:h-20 flex items-center justify-center text-slate-600 text-xs italic">
        Empty
      </div>
    );
  }

  const def = TETROMINOES[type];
  const matrix = def.matrices[0];

  const blockSize = size === 'sm' ? 12 : size === 'lg' ? 22 : 16;
  const gap = 2;

  // Filter out completely empty outer rows/cols for visual centering
  const activeCells: { r: number; c: number }[] = [];
  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val !== 0) activeCells.push({ r, c });
    });
  });

  if (activeCells.length === 0) return null;

  const minR = Math.min(...activeCells.map((c) => c.r));
  const maxR = Math.max(...activeCells.map((c) => c.r));
  const minC = Math.min(...activeCells.map((c) => c.c));
  const maxC = Math.max(...activeCells.map((c) => c.c));

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  const gridWidth = cols * blockSize + (cols - 1) * gap;
  const gridHeight = rows * blockSize + (rows - 1) * gap;

  return (
    <div
      className={`relative flex items-center justify-center py-2 transition-opacity ${
        locked ? 'opacity-40 grayscale' : 'opacity-100'
      }`}
      style={{ minHeight: size === 'sm' ? '48px' : '68px' }}
    >
      <div
        className="grid relative"
        style={{
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
          gridTemplateColumns: `repeat(${cols}, ${blockSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${blockSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: rows }).map((_, rIdx) => {
          const actualR = minR + rIdx;
          return Array.from({ length: cols }).map((__, cIdx) => {
            const actualC = minC + cIdx;
            const isFilled = matrix[actualR]?.[actualC] === 1;

            if (!isFilled) {
              return <div key={`${rIdx}-${cIdx}`} className="w-full h-full" />;
            }

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-full h-full rounded-[2.5px] shadow-sm relative overflow-hidden"
                style={{
                  backgroundColor: def.color,
                  boxShadow: locked ? 'none' : `0 0 6px ${def.glowColor}`,
                  border: `1px solid ${def.borderColor}`,
                }}
              >
                {/* Top highlight */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-white/40" />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
