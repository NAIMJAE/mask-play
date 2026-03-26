/**
 * gkoos/gomoku AI 엔진 연동 (MIT). 엔진 본문: `../vendor/gomoku/gomokuEngine.ts`
 */

import { oppositeTurn } from "@/features/omok/logic/board";
import type { Board, CellCoord, OmokDifficulty, Turn } from "@/types/omok";
import { boardToGomokuBitboards } from "./boardToBitboards";
import { findBestMove } from "../vendor/gomoku/gomokuEngine";

export type GomokuEngineDifficulty = "easy" | "medium" | "hard";

function mapMaskPlayDifficulty(d: OmokDifficulty): GomokuEngineDifficulty {
  if (d === "normal") return "medium";
  return d;
}

export interface GetBestMoveOptions {
  /** 기본값: normal → 엔진 medium */
  difficulty?: OmokDifficulty;
}

/**
 * `currentTurn`인 쪽(CPU)이 둘 최선의 한 수를 반환합니다.
 * 둘 곳이 없으면 `null`.
 */
export function getBestMove(
  board: Board,
  currentTurn: Turn,
  options?: GetBestMoveOptions,
): CellCoord | null {
  const difficulty = mapMaskPlayDifficulty(
    options?.difficulty ?? "normal",
  );
  const { blackBitboard, whiteBitboard } = boardToGomokuBitboards(board);
  const computerPlayer = currentTurn;
  const humanPlayer = oppositeTurn(currentTurn);

  const raw = findBestMove(
    blackBitboard,
    whiteBitboard,
    computerPlayer,
    humanPlayer,
    difficulty,
  ) as { row: number; col: number } | null | undefined;

  if (
    raw == null ||
    typeof raw.row !== "number" ||
    typeof raw.col !== "number"
  ) {
    return null;
  }
  return { row: raw.row, col: raw.col };
}
