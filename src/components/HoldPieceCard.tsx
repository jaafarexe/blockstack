import React from 'react';
import { TetrominoType } from '../types/tetris';
import { TetrominoPreview } from './TetrominoPreview';

interface HoldPieceCardProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  onHoldClick?: () => void;
}

export const HoldPieceCard: React.FC<HoldPieceCardProps> = ({
  holdPiece,
  canHold,
  onHoldClick,
}) => {
  return (
    <div
      onClick={canHold ? onHoldClick : undefined}
      className={`group relative p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 transition-all ${
        canHold ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900' : 'cursor-default'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Hold
        </span>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
          [C]
        </span>
      </div>

      <div className="bg-slate-950/60 rounded-lg border border-slate-800/60 p-2 flex items-center justify-center min-h-[76px] sm:min-h-[88px]">
        <TetrominoPreview type={holdPiece} size="md" locked={!canHold && holdPiece !== null} />
      </div>

      {!canHold && holdPiece && (
        <div className="mt-1.5 text-center text-[10px] text-amber-500/80 font-medium tracking-wide">
          Locked until drop
        </div>
      )}
    </div>
  );
};
