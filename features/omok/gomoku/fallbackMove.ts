import type { Board, CellCoord } from "@/types/omok";

function isInside(board: Board, row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[row].length;
}

function hasNeighbor(board: Board, row: number, col: number): boolean {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!isInside(board, nr, nc)) continue;
      if (board[nr][nc] !== null) return true;
    }
  }
  return false;
}

export function chooseFallbackMove(board: Board): CellCoord | null {
  const size = board.length;
  let hasAnyStone = false;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        hasAnyStone = true;
        break;
      }
    }
    if (hasAnyStone) break;
  }

  const center = Math.floor(size / 2);
  if (!hasAnyStone && board[center]?.[center] === null) {
    return { row: center, col: center };
  }

  for (let radius = 0; radius < size; radius++) {
    for (let r = Math.max(0, center - radius); r <= Math.min(size - 1, center + radius); r++) {
      for (let c = Math.max(0, center - radius); c <= Math.min(size - 1, center + radius); c++) {
        if (board[r][c] !== null) continue;
        if (hasNeighbor(board, r, c)) return { row: r, col: c };
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) return { row: r, col: c };
    }
  }
  return null;
}
