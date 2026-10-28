import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TetrominoPreview } from './TetrominoPreview';

interface NextPieceCardProps {
  queue: TetrominoType[];
}

export const NextPieceCard: React.FC<NextPieceCardProps> = ({ queue }) => {
  const primaryNext = queue[0] || null;
  const secondaryNext = queue.slice(1, 3);

  return (
    <div className="relative p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Next Piece
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Queue
        </span>
      </div>

      {/* Primary immediate next piece */}
      <div className="bg-slate-950/60 rounded-lg border border-slate-800/60 p-2 flex items-center justify-center min-h-[76px] sm:min-h-[88px]">
        <TetrominoPreview type={primaryNext} size="md" />
      </div>

      {/* Subsequent upcoming pieces */}
      {secondaryNext.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-1.5">
          {secondaryNext.map((type, idx) => (
            <div
              key={`${type}-${idx}`}
              className="bg-slate-950/40 rounded-md p-1 border border-slate-800/40 flex items-center justify-center min-h-[48px]"
            >
              <TetrominoPreview type={type} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
