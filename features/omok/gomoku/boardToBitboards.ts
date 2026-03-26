/**
 * 15×15 보드를 gomoku 엔진용 비트보드(슬롯 8×32비트)로 변환합니다.
 * 원본 아이디어: https://github.com/gkoos/gomoku (MIT) — `src/bitboards.js`
 */

import type { Board } from "@/types/omok";
import { BOARD_SIZE } from "@/features/omok/logic/board";

const BITS_PER_SLOT = 32;
const SLOT_COUNT = 8;

export type GomokuBitboards = {
  blackBitboard: number[];
  whiteBitboard: number[];
};

export function boardToGomokuBitboards(board: Board): GomokuBitboards {
  const blackBitboard = new Array(SLOT_COUNT).fill(0);
  const whiteBitboard = new Array(SLOT_COUNT).fill(0);
  const size = Math.min(board.length, BOARD_SIZE);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const position = row * BOARD_SIZE + col;
      const slot = Math.floor(position / BITS_PER_SLOT);
      const bit = position % BITS_PER_SLOT;
      if (slot >= SLOT_COUNT) continue;

      const cell = board[row][col];
      if (cell === "black") {
        blackBitboard[slot] |= 1 << bit;
      } else if (cell === "white") {
        whiteBitboard[slot] |= 1 << bit;
      }
    }
  }

  return { blackBitboard, whiteBitboard };
}
