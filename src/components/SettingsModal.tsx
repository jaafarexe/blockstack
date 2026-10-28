import React from 'react';
import { Volume2, VolumeX, Music, Eye, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sfxEnabled: boolean;
  setSfxEnabled: (val: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (val: boolean) => void;
  showGhost: boolean;
  setShowGhost: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sfxEnabled,
  setSfxEnabled,
  musicEnabled,
  setMusicEnabled,
  showGhost,
  setShowGhost,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
            <p className="text-xs text-slate-400">Audio preferences and controls</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-6">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-3">
              {sfxEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-sm font-semibold text-slate-200">Sound Effects</div>
                <div className="text-xs text-slate-400">Synthesized audio cues for moves & clears</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSfxEnabled(!sfxEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                sfxEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${musicEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-sm font-semibold text-slate-200">Arcade Chiptune Music</div>
                <div className="text-xs text-slate-400">Retro 8-bit ambient background music</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                musicEnabled ? 'bg-purple-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Ghost Piece Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${showGhost ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-sm font-semibold text-slate-200">Ghost Piece Preview</div>
                <div className="text-xs text-slate-400">Semi-transparent drop shadow target</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGhost(!showGhost)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                showGhost ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Keyboard Controls Guide */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Keyboard Controls
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Move</span>
              <span className="font-mono text-slate-200">← / → or A / D</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Soft Drop</span>
              <span className="font-mono text-slate-200">↓ or S</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Hard Drop</span>
              <span className="font-mono text-cyan-400">Spacebar</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Rotate CW</span>
              <span className="font-mono text-slate-200">↑ or W or X</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Rotate CCW</span>
              <span className="font-mono text-slate-200">Z or Ctrl</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400">Hold</span>
              <span className="font-mono text-purple-400">C or Shift</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
