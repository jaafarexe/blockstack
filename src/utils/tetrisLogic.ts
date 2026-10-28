import { ActivePiece, BoardGrid, Matrix, TetrominoType } from '../types/tetris';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  TETROMINOES,
  TETROMINO_KEYS,
  WALL_KICKS_I,
  WALL_KICKS_JLSTZ,
} from './tetrominoes';

export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

// 7-Bag Randomizer
export function generateBag(): TetrominoType[] {
  const bag = [...TETROMINO_KEYS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function checkCollision(
  board: BoardGrid,
  matrix: Matrix,
  position: { x: number; y: number }
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] !== 0) {
        const boardX = position.x + c;
        const boardY = position.y + r;

        // Wall collisions
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }
        // Floor collision
        if (boardY >= BOARD_HEIGHT) {
          return true;
        }
        // Colliding with already locked pieces (only if within grid vertically)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Find ghost piece Y position
export function getGhostPieceY(board: BoardGrid, piece: ActivePiece): number {
  const matrix = TETROMINOES[piece.type].matrices[piece.rotation];
  let ghostY = piece.position.y;

  while (!checkCollision(board, matrix, { x: piece.position.x, y: ghostY + 1 })) {
    ghostY++;
  }

  return ghostY;
}

// Rotate with SRS Wall Kicks
export function tryRotate(
  board: BoardGrid,
  piece: ActivePiece,
  direction: 1 | -1 // 1 = clockwise, -1 = counterclockwise
): ActivePiece | null {
  const newRotation = (piece.rotation + direction + 4) % 4;
  const newMatrix = TETROMINOES[piece.type].matrices[newRotation];

  // 'O' piece doesn't need kicks
  if (piece.type === 'O') {
    return {
      ...piece,
      rotation: newRotation,
    };
  }

  const kickKey = `${piece.rotation}->${newRotation}`;
  const kickTable = piece.type === 'I' ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
  const kickOffsets = kickTable[kickKey] || [[0, 0]];

  for (const [kx, ky] of kickOffsets) {
    const testPos = {
      x: piece.position.x + kx,
      y: piece.position.y + ky,
    };

    if (!checkCollision(board, newMatrix, testPos)) {
      return {
        ...piece,
        rotation: newRotation,
        position: testPos,
      };
    }
  }

  // Rotation failed / blocked by surroundings
  return null;
}

// Spawn a piece at top-center
export function spawnPiece(type: TetrominoType): ActivePiece {
  const matrix = TETROMINOES[type].matrices[0];
  const pieceWidth = matrix[0].length;
  const startX = Math.floor((BOARD_WIDTH - pieceWidth) / 2);
  const startY = type === 'I' ? -1 : 0;

  return {
    type,
    rotation: 0,
    position: { x: startX, y: startY },
  };
}

// Merge locked piece into board
export function mergePiece(board: BoardGrid, piece: ActivePiece): BoardGrid {
  const newBoard = board.map((row) => [...row]);
  const matrix = TETROMINOES[piece.type].matrices[piece.rotation];

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] !== 0) {
        const by = piece.position.y + r;
        const bx = piece.position.x + c;
        if (by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
          newBoard[by][bx] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

// Clear full lines and return cleared line indices
export function findFullLines(board: BoardGrid): number[] {
  const fullRows: number[] = [];
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    if (board[r].every((cell) => cell !== null)) {
      fullRows.push(r);
    }
  }
  return fullRows;
}

export function removeLines(board: BoardGrid, rowsToRemove: number[]): BoardGrid {
  if (rowsToRemove.length === 0) return board;

  const rowsSet = new Set(rowsToRemove);
  const remainingRows = board.filter((_, idx) => !rowsSet.has(idx));
  const newEmptyRows = Array.from({ length: rowsToRemove.length }, () =>
    Array(BOARD_WIDTH).fill(null)
  );

  return [...newEmptyRows, ...remainingRows];
}

export function calculateDropSpeed(level: number): number {
  // Speed curve in milliseconds per step
  if (level <= 1) return 800;
  if (level <= 2) return 720;
  if (level <= 3) return 630;
  if (level <= 4) return 550;
  if (level <= 5) return 460;
  if (level <= 6) return 380;
  if (level <= 7) return 300;
  if (level <= 8) return 220;
  if (level <= 9) return 150;
  if (level <= 12) return 100;
  if (level <= 15) return 80;
  return Math.max(50, 75 - (level - 15) * 5);
}

export function calculateLinePoints(lines: number, level: number): number {
  switch (lines) {
    case 1:
      return 100 * level;
    case 2:
      return 300 * level;
    case 3:
      return 500 * level;
    case 4:
      return 800 * level; // Tetris!
    default:
      return 0;
  }
}

// Local Storage helpers
const HIGH_SCORE_KEY = 'blockstack_tetris_highscore';
const STATS_KEY = 'blockstack_tetris_stats';

export function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(HIGH_SCORE_KEY);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function saveStoredHighScore(score: number): void {
  if (typeof window === 'undefined') return;
  const current = getStoredHighScore();
  if (score > current) {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  }
}

export interface LifetimeStats {
  gamesPlayed: number;
  totalLines: number;
  totalTetrises: number;
  highestLevel: number;
}

export function getLifetimeStats(): LifetimeStats {
  if (typeof window === 'undefined') {
    return { gamesPlayed: 0, totalLines: 0, totalTetrises: 0, highestLevel: 1 };
  }
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { gamesPlayed: 0, totalLines: 0, totalTetrises: 0, highestLevel: 1 };
}

export function updateLifetimeStats(deltaLines: number, deltaTetrises: number, level: number) {
  if (typeof window === 'undefined') return;
  const current = getLifetimeStats();
  const updated: LifetimeStats = {
    gamesPlayed: current.gamesPlayed + 1,
    totalLines: current.totalLines + deltaLines,
    totalTetrises: current.totalTetrises + deltaTetrises,
    highestLevel: Math.max(current.highestLevel, level),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(updated));
}
