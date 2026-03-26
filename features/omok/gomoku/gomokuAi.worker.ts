/// <reference lib="webworker" />

/**
 * 오목 AI는 메인 스레드를 막지 않도록 전용 Worker에서 실행합니다.
 */

import { BOARD_SIZE } from "../logic/board";
import { findBestMove } from "../vendor/gomoku/gomokuEngine";

type StoneCell = "black" | "white" | null;
type BoardMsg = StoneCell[][];
type TurnMsg = "black" | "white";

function boardToBitboards(board: BoardMsg): {
  blackBitboard: number[];
  whiteBitboard: number[];
} {
  const BITS_PER_SLOT = 32;
  const SLOT_COUNT = 8;
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
      if (cell === "black") blackBitboard[slot] |= 1 << bit;
      else if (cell === "white") whiteBitboard[slot] |= 1 << bit;
    }
  }
  return { blackBitboard, whiteBitboard };
}

function mapDifficulty(d: string): "easy" | "medium" | "hard" {
  if (d === "normal") return "medium";
  if (d === "hard") return "hard";
  return "easy";
}

export type GomokuWorkerRequest = {
  type: "compute";
  id: number;
  board: BoardMsg;
  aiStone: TurnMsg;
  difficulty: string;
};

export type GomokuWorkerResponse = {
  type: "result";
  id: number;
  move: { row: number; col: number } | null;
};

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent<GomokuWorkerRequest>) => {
  const msg = e.data;
  if (msg.type !== "compute") return;

  const { id, board, aiStone, difficulty } = msg;
  try {
    const { blackBitboard, whiteBitboard } = boardToBitboards(board);
    const humanPlayer: TurnMsg = aiStone === "black" ? "white" : "black";
    const raw = findBestMove(
      blackBitboard,
      whiteBitboard,
      aiStone,
      humanPlayer,
      mapDifficulty(difficulty),
    ) as { row: number; col: number } | null | undefined;

    const move =
      raw != null &&
      typeof raw.row === "number" &&
      typeof raw.col === "number"
        ? { row: raw.row, col: raw.col }
        : null;

    const out: GomokuWorkerResponse = { type: "result", id, move };
    self.postMessage(out);
  } catch {
    const out: GomokuWorkerResponse = { type: "result", id, move: null };
    self.postMessage(out);
  }
};
