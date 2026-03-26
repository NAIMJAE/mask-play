import type { Board, GameResult } from "@/types/omok";
import { isBoardFull } from "./board";
import { checkWinner } from "./winner";

export function resolveGameStatus(board: Board): GameResult {
  const winner = checkWinner(board);
  if (winner === "black") return "black-win";
  if (winner === "white") return "white-win";
  if (isBoardFull(board)) return "draw";
  return "playing";
}
