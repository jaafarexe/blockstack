export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Position {
  x: number;
  y: number;
}

export type Matrix = number[][];

export interface TetrominoDefinition {
  type: TetrominoType;
  color: string;
  glowColor: string;
  borderColor: string;
  accentColor: string;
  matrices: Matrix[]; // 4 rotations
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: number; // 0, 1, 2, 3
  position: Position;
}

export type BoardGrid = (TetrominoType | null)[][];

export interface GameStats {
  score: number;
  highScore: number;
  lines: number;
  level: number;
  piecesPlaced: number;
  tetrisCount: number;
  singles: number;
  doubles: number;
  triples: number;
  combos: number;
  maxCombo: number;
}

export interface ClearLineAnimation {
  rows: number[];
  startTime: number;
}
