import React from 'react';
import { GameStats } from '../types/tetris';

interface ScoreBoardProps {
  stats: GameStats;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats }) => {
  const linesToNextLevel = 10 - (stats.lines % 10);
  const progressPercent = ((10 - linesToNextLevel) / 10) * 100;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Primary Score Box */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
          Score
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-white">
          {stats.score.toLocaleString()}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">High Score</span>
          <span className="font-mono tabular-nums font-bold text-amber-400">
            {stats.highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Level & Lines Box */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-0.5">
              Level
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-cyan-400">
              {stats.level}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-0.5">
              Lines
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {stats.lines}
            </div>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="mt-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
            <span>Next Level</span>
            <span className="font-mono">{linesToNextLevel} lines left</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Arcade Accolades / Stats */}
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-purple-400 font-semibold font-mono tabular-nums">
            {stats.tetrisCount}
          </span>
          <span className="text-slate-400">Tetrises</span>
        </div>

        <span className="text-slate-700" aria-hidden="true">·</span>

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-cyan-400 font-semibold font-mono tabular-nums">
            {stats.maxCombo > 1 ? `${stats.maxCombo}x` : '0x'}
          </span>
          <span className="text-slate-400">Max Combo</span>
        </div>
      </div>
    </div>
  );
};
