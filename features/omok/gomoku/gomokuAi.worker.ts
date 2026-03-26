/// <reference lib="webworker" />

/**
 * 오목 AI는 메인 스레드를 막지 않도록 전용 Worker에서 실행합니다.
 */

import { BOARD_SIZE } from "../logic/board";
import { findBestMove } from "../vendor/gomoku/gomokuEngine";

type StoneCell = "black" | "white" | null;
type BoardMsg = StoneCell[][];
type TurnMsg = "black" | "white";

function chooseFallbackMove(board: BoardMsg): { row: number; col: number } | null {
  const size = board.length;
  const center = Math.floor(size / 2);
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

  const hasNeighbor = (row: number, col: number): boolean => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (board[nr][nc] !== null) return true;
      }
    }
    return false;
  };

  if (!hasAnyStone && board[center]?.[center] === null) {
    return { row: center, col: center };
  }

  for (let radius = 0; radius < size; radius++) {
    for (let r = Math.max(0, center - radius); r <= Math.min(size - 1, center + radius); r++) {
      for (let c = Math.max(0, center - radius); c <= Math.min(size - 1, center + radius); c++) {
        if (board[r][c] !== null) continue;
        if (hasNeighbor(r, c)) return { row: r, col: c };
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
    if (board.length !== 15 || BOARD_SIZE !== 15) {
      const out: GomokuWorkerResponse = {
        type: "result",
        id,
        move: chooseFallbackMove(board),
      };
      self.postMessage(out);
      return;
    }

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
