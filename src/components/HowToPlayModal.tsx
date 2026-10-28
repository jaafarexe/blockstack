import React from 'react';
import { X, Sparkles, Zap, Award } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">How to Play BlockStack</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-1">Objective</h3>
            <p className="text-slate-400 leading-relaxed">
              Arrange falling tetromino pieces to complete horizontal lines. Completed lines vanish, granting score and clearing board space. Avoid stacking pieces to the top of the 10x20 matrix!
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-2">
              <Zap className="w-4 h-4" />
              <span>Scoring & Levels</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex justify-between">
                <span>Single Line Clear</span>
                <span className="font-mono text-cyan-400">100 × Level pts</span>
              </li>
              <li className="flex justify-between">
                <span>Double Line Clear</span>
                <span className="font-mono text-cyan-400">300 × Level pts</span>
              </li>
              <li className="flex justify-between">
                <span>Triple Line Clear</span>
                <span className="font-mono text-cyan-400">500 × Level pts</span>
              </li>
              <li className="flex justify-between font-bold text-purple-300">
                <span>Tetris! (4 lines simultaneously)</span>
                <span className="font-mono text-purple-400">800 × Level pts</span>
              </li>
              <li className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Soft Drop / Hard Drop</span>
                <span className="font-mono">+1 pt / +2 pts per cell</span>
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-1.5">
              <Award className="w-4 h-4" />
              <span>Pro Mechanics</span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-200">Hold Piece:</strong> Press <kbd className="px-1 py-0.2 bg-slate-800 text-slate-200 rounded font-mono">C</kbd> to save a piece for later. You can swap once per turn.</li>
              <li><strong className="text-slate-200">Hard Drop:</strong> Press <kbd className="px-1 py-0.2 bg-slate-800 text-slate-200 rounded font-mono">Space</kbd> to instantaneously slam the piece down to the ghost shadow position.</li>
              <li><strong className="text-slate-200">SRS Wall Kicks:</strong> Pieces can rotate even while snug against the left/right walls or obstacles.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
