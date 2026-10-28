import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  RotateCcw,
  RotateCw,
  RefreshCw,
} from 'lucide-react';

interface ControlsPadProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export const ControlsPad: React.FC<ControlsPadProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  disabled = false,
}) => {
  const repeatTimerRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        // silent fallback
      }
    }
  };

  const startRepeating = (action: () => void) => {
    if (disabled) return;
    triggerHaptic();
    action();

    // Clear any active repeat timers
    stopRepeating();

    // Initial DAS delay then auto-repeat
    repeatTimerRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(() => {
        action();
      }, 55);
    }, 170);
  };

  const stopRepeating = () => {
    if (repeatTimerRef.current !== null) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    if (repeatIntervalRef.current !== null) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-2 pb-1 select-none">
      {/* Top Quick Actions Bar (Hold & Hard Drop & Rotation CCW) */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            triggerHaptic();
            onHold();
          }}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 active:scale-95 transition-transform"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-300">HOLD</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            triggerHaptic();
            onRotateCCW();
          }}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4 text-purple-400 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-300">ROT -90°</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            triggerHaptic();
            onRotateCW();
          }}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 active:scale-95 transition-transform"
        >
          <RotateCw className="w-4 h-4 text-purple-400 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wider text-slate-300">ROT +90°</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            triggerHaptic();
            onHardDrop();
          }}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 shadow-lg shadow-cyan-950/40 active:bg-cyan-900 active:scale-95 transition-all"
        >
          <ChevronsDown className="w-4 h-4 text-cyan-300 mb-0.5" />
          <span className="text-[10px] font-extrabold tracking-wider text-cyan-200">DROP</span>
        </button>
      </div>

      {/* Primary D-Pad cluster: Left, Soft Drop, Right */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={disabled}
          onPointerDown={() => startRepeating(onMoveLeft)}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
          onPointerCancel={stopRepeating}
          className="flex flex-col items-center justify-center h-14 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 active:bg-slate-800 active:scale-95 transition-transform shadow-md"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={() => startRepeating(onSoftDrop)}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
          onPointerCancel={stopRepeating}
          className="flex flex-col items-center justify-center h-14 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 active:bg-slate-800 active:scale-95 transition-transform shadow-md"
          aria-label="Soft Drop"
        >
          <ArrowDown className="w-6 h-6 text-amber-400" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onPointerDown={() => startRepeating(onMoveRight)}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
          onPointerCancel={stopRepeating}
          className="flex flex-col items-center justify-center h-14 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 active:bg-slate-800 active:scale-95 transition-transform shadow-md"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
