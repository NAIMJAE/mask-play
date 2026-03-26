import type { Board, Stone, Turn } from "@/types/omok";

export const BOARD_SIZE = 15;

export function createBoard(size: number = BOARD_SIZE): Board {
  const rows: Board = [];
  for (let r = 0; r < size; r++) {
    const row: Stone[] = [];
    for (let c = 0; c < size; c++) row.push(null);
    rows.push(row);
  }
  return rows;
}

export function isValidCoord(row: number, col: number, size: number = BOARD_SIZE): boolean {
  return row >= 0 && row < size && col >= 0 && col < size;
}

export function placeStone(
  board: Board,
  row: number,
  col: number,
  stone: Turn,
): Board | null {
  if (!isValidCoord(row, col, board.length)) return null;
  if (board[row][col] !== null) return null;
  const next = board.map((r) => [...r]);
  next[row][col] = stone;
  return next;
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

export function oppositeTurn(turn: Turn): Turn {
  return turn === "black" ? "white" : "black";
}
