import React from 'react';
import { GameStats } from '../types/tetris';
import { RotateCcw, Trophy } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  isNewHighScore,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        {isNewHighScore ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>New Personal Best!</span>
          </div>
        ) : (
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Blocks Stacked to the Top
          </div>
        )}

        <h2 className="text-3xl font-black tracking-tight text-white mb-4">
          Game Over
        </h2>

        {/* Score Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-5">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Final Score
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums text-cyan-400">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-3 gap-2 py-3 px-2 rounded-xl bg-slate-950/40 border border-slate-800/40 mb-6 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Lines</div>
            <div className="text-base font-bold font-mono tabular-nums text-slate-200">
              {stats.lines}
            </div>
          </div>
          <div className="border-x border-slate-800/60">
            <div className="text-[10px] text-slate-400 uppercase">Level</div>
            <div className="text-base font-bold font-mono tabular-nums text-emerald-400">
              {stats.level}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Tetrises</div>
            <div className="text-base font-bold font-mono tabular-nums text-purple-400">
              {stats.tetrisCount}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};
