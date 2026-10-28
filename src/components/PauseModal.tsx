import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Game Paused</h2>
        <p className="text-xs text-slate-400 mb-6">Take a breather or jump right back into the stack.</p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Game</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium rounded-xl flex items-center justify-center gap-2 border border-slate-700 active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">P</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Esc</kbd> to resume
        </div>
      </div>
    </div>
  );
};
