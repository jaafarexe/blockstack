/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePiece,
  BoardGrid,
  GameStats,
  GameStatus,
  TetrominoType,
} from './types/tetris';
import {
  calculateDropSpeed,
  calculateLinePoints,
  checkCollision,
  createEmptyBoard,
  findFullLines,
  generateBag,
  getGhostPieceY,
  getStoredHighScore,
  mergePiece,
  removeLines,
  saveStoredHighScore,
  spawnPiece,
  tryRotate,
  updateLifetimeStats,
} from './utils/tetrisLogic';
import { sound } from './utils/audio';
import { BOARD_HEIGHT, TETROMINOES } from './utils/tetrominoes';
import { Board } from './components/Board';
import { HoldPieceCard } from './components/HoldPieceCard';
import { NextPieceCard } from './components/NextPieceCard';
import { ScoreBoard } from './components/ScoreBoard';
import { ControlsPad } from './components/ControlsPad';
import { Header } from './components/Header';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function App() {
  const [board, setBoard] = useState<BoardGrid>(createEmptyBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>('READY');
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  // Settings
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => sound.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => sound.musicEnabled);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Line clear animation state
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [flashIntensity, setFlashIntensity] = useState<number>(0);

  // Stats
  const [stats, setStats] = useState<GameStats>(() => ({
    score: 0,
    highScore: getStoredHighScore(),
    lines: 0,
    level: 1,
    piecesPlaced: 0,
    tetrisCount: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    combos: 0,
    maxCombo: 0,
  }));

  // Refs for loop management and uninterrupted game tick
  const bagRef = useRef<TetrominoType[]>([]);
  const boardRef = useRef<BoardGrid>(board);
  boardRef.current = board;
  const activePieceRef = useRef<ActivePiece | null>(activePiece);
  activePieceRef.current = activePiece;
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  gameStatusRef.current = gameStatus;
  const canHoldRef = useRef<boolean>(canHold);
  canHoldRef.current = canHold;
  const holdPieceRef = useRef<TetrominoType | null>(holdPiece);
  holdPieceRef.current = holdPiece;
  const dropTimerRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Ensure queue has enough pieces
  const getNextFromQueue = useCallback((): TetrominoType => {
    let currentBag = bagRef.current;
    if (currentBag.length < 7) {
      currentBag = [...currentBag, ...generateBag()];
      bagRef.current = currentBag;
    }

    const nextType = currentBag[0];
    bagRef.current = currentBag.slice(1);

    // Keep state queue updated for UI preview (showing next 3-4 pieces)
    if (bagRef.current.length < 5) {
      bagRef.current = [...bagRef.current, ...generateBag()];
    }
    setNextQueue(bagRef.current.slice(0, 4));

    return nextType;
  }, []);

  // Spawn visual particles on line clear or hard impact
  const createLineParticles = (rows: number[]) => {
    const newParticles: Particle[] = [];
    rows.forEach((rowY) => {
      for (let x = 0; x < 10; x++) {
        const cell = boardRef.current[rowY]?.[x];
        const color = cell ? TETROMINOES[cell].color : '#38bdf8';
        for (let k = 0; k < 4; k++) {
          newParticles.push({
            x: x + 0.5 + (Math.random() - 0.5) * 0.6,
            y: rowY + 0.5 + (Math.random() - 0.5) * 0.6,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 5 - 1,
            color,
            size: Math.random() * 3 + 1.5,
            alpha: 1,
            life: 0,
            maxLife: 24 + Math.random() * 12,
          });
        }
      }
    });
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Particle animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current
          .map((p) => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 12 * dt; // gravity
            p.life += 1;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);
            return p;
          })
          .filter((p) => p.life < p.maxLife);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Lock the current piece into the board and trigger line checks
  const lockPiece = useCallback((pieceToLock: ActivePiece) => {
    const newBoard = mergePiece(boardRef.current, pieceToLock);
    const fullRows = findFullLines(newBoard);

    sound.playSoftDrop();

    if (fullRows.length > 0) {
      // Line clear sequence with flash animation
      setClearingRows(fullRows);
      setFlashIntensity(1);
      createLineParticles(fullRows);
      sound.playLineClear(fullRows.length);

      // Flash sequence settling
      setTimeout(() => {
        const collapsedBoard = removeLines(newBoard, fullRows);
        setBoard(collapsedBoard);
        setClearingRows([]);
        setFlashIntensity(0);

        // Update score & level progression
        setStats((prev) => {
          const linesCleared = fullRows.length;
          const newLines = prev.lines + linesCleared;
          const newLevel = Math.floor(newLines / 10) + 1;
          const linePoints = calculateLinePoints(linesCleared, prev.level);
          const newScore = prev.score + linePoints;
          const newCombo = prev.combos + 1;
          const newMaxCombo = Math.max(prev.maxCombo, newCombo);

          if (newLevel > prev.level) {
            sound.playLevelUp();
          }

          let newHighScore = prev.highScore;
          if (newScore > newHighScore) {
            newHighScore = newScore;
            saveStoredHighScore(newScore);
            setIsNewHighScore(true);
          }

          return {
            ...prev,
            score: newScore,
            highScore: newHighScore,
            lines: newLines,
            level: newLevel,
            piecesPlaced: prev.piecesPlaced + 1,
            tetrisCount: prev.tetrisCount + (linesCleared === 4 ? 1 : 0),
            singles: prev.singles + (linesCleared === 1 ? 1 : 0),
            doubles: prev.doubles + (linesCleared === 2 ? 1 : 0),
            triples: prev.triples + (linesCleared === 3 ? 1 : 0),
            combos: newCombo,
            maxCombo: newMaxCombo,
          };
        });

        // Spawn next piece after collapse
        spawnNextPiece(collapsedBoard);
      }, 160);
    } else {
      // No lines cleared
      setBoard(newBoard);
      setStats((prev) => ({
        ...prev,
        piecesPlaced: prev.piecesPlaced + 1,
        combos: 0,
      }));
      spawnNextPiece(newBoard);
    }
  }, [getNextFromQueue]);

  // Spawn next piece or trigger game over if blocked
  const spawnNextPiece = useCallback((currentBoard: BoardGrid) => {
    const nextType = getNextFromQueue();
    const newPiece = spawnPiece(nextType);

    // Check game over
    const matrix = TETROMINOES[nextType].matrices[0];
    if (checkCollision(currentBoard, matrix, newPiece.position)) {
      // Game Over!
      setGameStatus('GAME_OVER');
      setActivePiece(null);
      sound.playGameOver();
      updateLifetimeStats(
        statsRef.current.lines,
        statsRef.current.tetrisCount,
        statsRef.current.level
      );
      return;
    }

    setActivePiece(newPiece);
    setCanHold(true);
  }, [getNextFromQueue]);

  // Start / Restart game
  const startGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    bagRef.current = [...generateBag(), ...generateBag()];

    const firstType = bagRef.current[0];
    bagRef.current = bagRef.current.slice(1);
    setNextQueue(bagRef.current.slice(0, 4));

    const firstPiece = spawnPiece(firstType);
    setActivePiece(firstPiece);
    setHoldPiece(null);
    setCanHold(true);
    setClearingRows([]);
    setIsNewHighScore(false);

    setStats({
      score: 0,
      highScore: getStoredHighScore(),
      lines: 0,
      level: 1,
      piecesPlaced: 0,
      tetrisCount: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      combos: 0,
      maxCombo: 0,
    });

    setGameStatus('PLAYING');
  }, []);

  // Movement Handlers
  const handleMoveLeft = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const piece = activePieceRef.current;
    const matrix = TETROMINOES[piece.type].matrices[piece.rotation];
    const newPos = { x: piece.position.x - 1, y: piece.position.y };

    if (!checkCollision(boardRef.current, matrix, newPos)) {
      setActivePiece({ ...piece, position: newPos });
      sound.playMove();
    }
  }, []);

  const handleMoveRight = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const piece = activePieceRef.current;
    const matrix = TETROMINOES[piece.type].matrices[piece.rotation];
    const newPos = { x: piece.position.x + 1, y: piece.position.y };

    if (!checkCollision(boardRef.current, matrix, newPos)) {
      setActivePiece({ ...piece, position: newPos });
      sound.playMove();
    }
  }, []);

  const handleSoftDrop = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const piece = activePieceRef.current;
    const matrix = TETROMINOES[piece.type].matrices[piece.rotation];
    const newPos = { x: piece.position.x, y: piece.position.y + 1 };

    if (!checkCollision(boardRef.current, matrix, newPos)) {
      setActivePiece({ ...piece, position: newPos });
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
      sound.playSoftDrop();
    } else {
      lockPiece(piece);
    }
  }, [lockPiece]);

  const handleHardDrop = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const piece = activePieceRef.current;
    const targetY = getGhostPieceY(boardRef.current, piece);
    const dropDistance = targetY - piece.position.y;

    if (dropDistance > 0) {
      setStats((prev) => ({ ...prev, score: prev.score + dropDistance * 2 }));
    }

    sound.playHardDrop();
    lockPiece({
      ...piece,
      position: { x: piece.position.x, y: targetY },
    });
  }, [lockPiece]);

  const handleRotateCW = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const rotated = tryRotate(boardRef.current, activePieceRef.current, 1);
    if (rotated) {
      setActivePiece(rotated);
      sound.playRotate();
    }
  }, []);

  const handleRotateCCW = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current) return;
    const rotated = tryRotate(boardRef.current, activePieceRef.current, -1);
    if (rotated) {
      setActivePiece(rotated);
      sound.playRotate();
    }
  }, []);

  const handleHold = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING' || !activePieceRef.current || !canHoldRef.current) return;

    sound.playHold();
    const currentPieceType = activePieceRef.current.type;
    const held = holdPieceRef.current;

    if (held === null) {
      // First hold: store current piece and draw next piece
      setHoldPiece(currentPieceType);
      const nextType = getNextFromQueue();
      setActivePiece(spawnPiece(nextType));
    } else {
      // Swap held piece with active piece
      setHoldPiece(currentPieceType);
      setActivePiece(spawnPiece(held));
    }

    setCanHold(false);
  }, [getNextFromQueue]);

  const togglePause = useCallback(() => {
    if (gameStatus === 'PLAYING') {
      setGameStatus('PAUSED');
    } else if (gameStatus === 'PAUSED') {
      setGameStatus('PLAYING');
    }
  }, [gameStatus]);

  // Main game tick / gravity interval
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || !activePiece) {
      if (dropTimerRef.current !== null) {
        clearInterval(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      return;
    }

    const interval = calculateDropSpeed(stats.level);

    dropTimerRef.current = window.setInterval(() => {
      const piece = activePieceRef.current;
      if (!piece) return;

      const matrix = TETROMINOES[piece.type].matrices[piece.rotation];
      const nextPos = { x: piece.position.x, y: piece.position.y + 1 };

      if (!checkCollision(boardRef.current, matrix, nextPos)) {
        setActivePiece((p) => (p ? { ...p, position: nextPos } : null));
      } else {
        lockPiece(piece);
      }
    }, interval);

    return () => {
      if (dropTimerRef.current !== null) {
        clearInterval(dropTimerRef.current);
        dropTimerRef.current = null;
      }
    };
  }, [gameStatus, stats.level, activePiece, lockPiece]);

  // Global Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing input if inside modal or form
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          handleMoveLeft();
          break;

        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          handleMoveRight();
          break;

        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          handleSoftDrop();
          break;

        case 'Space':
          e.preventDefault();
          handleHardDrop();
          break;

        case 'ArrowUp':
        case 'KeyW':
        case 'KeyX':
          e.preventDefault();
          handleRotateCW();
          break;

        case 'KeyZ':
        case 'ControlLeft':
        case 'ControlRight':
          e.preventDefault();
          handleRotateCCW();
          break;

        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          handleHold();
          break;

        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;

        case 'KeyR':
          if (gameStatusRef.current === 'GAME_OVER') {
            e.preventDefault();
            startGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleMoveLeft,
    handleMoveRight,
    handleSoftDrop,
    handleHardDrop,
    handleRotateCW,
    handleRotateCCW,
    handleHold,
    togglePause,
    startGame,
  ]);

  // Auto-start on load
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Sync Audio Settings
  const handleToggleSfx = () => {
    const nextVal = !sfxEnabled;
    setSfxEnabled(nextVal);
    sound.setSfx(nextVal);
  };

  const handleToggleMusic = (val: boolean) => {
    setMusicEnabled(val);
    sound.setMusic(val);
  };

  const ghostY =
    activePiece && showGhost ? getGhostPieceY(board, activePiece) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Top Navigation */}
      <Header
        status={gameStatus}
        sfxEnabled={sfxEnabled}
        onToggleSfx={handleToggleSfx}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTogglePause={togglePause}
        onRestart={startGame}
        onShowHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 py-2 sm:py-4 w-full max-w-5xl mx-auto">
        <div className="relative w-full flex flex-col items-center">
          {/* Game Layout: Desktop 3-column / Mobile layered */}
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6">
            {/* Left Panel: Hold Piece + High Score / Level stats on desktop */}
            <div className="w-full max-w-[320px] lg:w-48 flex flex-row lg:flex-col gap-3 justify-between lg:justify-start order-2 lg:order-1">
              <div className="flex-1 lg:w-full">
                <HoldPieceCard
                  holdPiece={holdPiece}
                  canHold={canHold}
                  onHoldClick={handleHold}
                />
              </div>

              {/* Mobile Quick Stats strip (hidden on lg where ScoreBoard is visible on right) */}
              <div className="flex-1 lg:hidden flex flex-col justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Score</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {stats.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Level</span>
                  <span className="font-mono font-bold text-cyan-400 tabular-nums">
                    {stats.level}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lines</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {stats.lines}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Tetris Game Canvas Board with Overlays */}
            <div className="relative flex flex-col items-center order-1 lg:order-2">
              <Board
                board={board}
                activePiece={activePiece}
                ghostY={ghostY}
                showGhost={showGhost}
                clearingRows={clearingRows}
                flashIntensity={flashIntensity}
                particlesRef={particlesRef}
              />

              {/* Pause Overlay */}
              <PauseModal
                isOpen={gameStatus === 'PAUSED'}
                onResume={togglePause}
                onRestart={startGame}
              />

              {/* Game Over Overlay */}
              <GameOverModal
                isOpen={gameStatus === 'GAME_OVER'}
                stats={stats}
                isNewHighScore={isNewHighScore}
                onRestart={startGame}
              />
            </div>

            {/* Right Panel: Next Queue + Full Scoreboard */}
            <div className="w-full max-w-[320px] lg:w-56 flex flex-col gap-3 order-3">
              <NextPieceCard queue={nextQueue} />

              <div className="hidden lg:block">
                <ScoreBoard stats={stats} />
              </div>
            </div>
          </div>

          {/* Touch Controls Pad (Optimized for mobile & tablet) */}
          <div className="w-full mt-3 sm:mt-4">
            <ControlsPad
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
              onSoftDrop={handleSoftDrop}
              onHardDrop={handleHardDrop}
              onRotateCW={handleRotateCW}
              onRotateCCW={handleRotateCCW}
              onHold={handleHold}
              disabled={gameStatus !== 'PLAYING'}
            />
          </div>
        </div>
      </main>

      {/* Footer / Status bar (Quiet, anti-slop) */}
      <footer className="w-full py-2.5 px-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <div className="flex items-center justify-center gap-2">
          <span>BlockStack Tetris</span>
          <span aria-hidden="true">·</span>
          <span>Classic 10×20 Matrix</span>
          <span aria-hidden="true">·</span>
          <span>SRS Rotation</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sfxEnabled={sfxEnabled}
        setSfxEnabled={(val) => {
          setSfxEnabled(val);
          sound.setSfx(val);
        }}
        musicEnabled={musicEnabled}
        setMusicEnabled={handleToggleMusic}
        showGhost={showGhost}
        setShowGhost={setShowGhost}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
    </div>
  );
}
