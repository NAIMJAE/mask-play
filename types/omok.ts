export type Stone = "black" | "white" | null;

export type Board = Stone[][];

export type Turn = "black" | "white";

export type GameResult =
  | "black-win"
  | "white-win"
  | "draw"
  | "playing";

export type OmokDifficulty = "easy" | "normal" | "hard";

export interface OmokSetupConfig {
  difficulty: OmokDifficulty;
  playerColor: Turn;
  firstTurn: Turn;
}

export interface CellCoord {
  row: number;
  col: number;
}

/** 플레이어(CPU)별 가장 최근 착수 (표시용) */
export interface LastMovesHighlight {
  human: CellCoord | null;
  ai: CellCoord | null;
}
