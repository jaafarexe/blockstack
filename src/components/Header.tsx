import React from 'react';
import { Volume2, VolumeX, Settings, RotateCcw, Pause, Play, Blocks } from 'lucide-react';
import { GameStatus } from '../types/tetris';

interface HeaderProps {
  status: GameStatus;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onOpenSettings: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onShowHowToPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  sfxEnabled,
  onToggleSfx,
  onOpenSettings,
  onTogglePause,
  onRestart,
  onShowHowToPlay,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Blocks className="w-5 h-5 text-slate-950" />
        </div>
        <span className="text-lg sm:text-xl font-black tracking-tight text-white">
          BlockStack <span className="text-cyan-400">Tetris</span>
        </span>
      </div>

      {/* Zone 2: Clean single-line links/triggers */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={onShowHowToPlay}
          className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
        >
          How to Play
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: Primary Action Zone */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSfx}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={sfxEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          aria-label={sfxEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {sfxEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Settings & Keybinds"
          aria-label="Settings & Keybinds"
        >
          <Settings className="w-4 h-4" />
        </button>

        {status === 'PLAYING' || status === 'PAUSED' ? (
          <button
            type="button"
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={status === 'PAUSED' ? 'Resume Game' : 'Pause Game'}
            aria-label={status === 'PAUSED' ? 'Resume Game' : 'Pause Game'}
          >
            {status === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRestart}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-400/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>
    </header>
  );
};
