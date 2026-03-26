import type { Board, CellCoord, OmokDifficulty, Turn } from "@/types/omok";
import { getBestMove } from "@/features/omok/gomoku/getBestMove";

export { getBestMove, type GetBestMoveOptions } from "@/features/omok/gomoku/getBestMove";

/**
 * CPU가 둘 좌표 (gomoku 엔진 `getBestMove` 래핑). 둘 곳이 없으면 null.
 */
export function chooseAiMove(
  board: Board,
  aiStone: Turn,
  difficulty: OmokDifficulty,
): CellCoord | null {
  return getBestMove(board, aiStone, { difficulty });
}
