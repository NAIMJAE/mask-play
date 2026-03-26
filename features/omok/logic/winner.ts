import type { Board, Turn } from "@/types/omok";

const DIRECTIONS: readonly [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * 가로·세로·대각선에서 5개 이상 연속인 색이 있으면 해당 턴을 반환합니다.
 */
export function checkWinner(board: Board): Turn | null {
  const size = board.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const stone = board[r][c];
      if (stone === null) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const pr = r - dr;
        const pc = c - dc;
        if (
          pr >= 0 &&
          pr < size &&
          pc >= 0 &&
          pc < size &&
          board[pr][pc] === stone
        ) {
          continue;
        }

        let count = 0;
        let nr = r;
        let nc = c;
        while (
          nr >= 0 &&
          nr < size &&
          nc >= 0 &&
          nc < size &&
          board[nr][nc] === stone
        ) {
          count++;
          nr += dr;
          nc += dc;
        }
        if (count >= 5) return stone;
      }
    }
  }
  return null;
}
