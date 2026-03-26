"use client";

import type { Board, CellCoord, OmokDifficulty, Turn } from "@/types/omok";
import { getBestMove } from "./getBestMove";

let worker: Worker | null = null;
let workerFailed = false;
let requestSeq = 0;

function createWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  try {
    return new Worker(new URL("./gomokuAi.worker.ts", import.meta.url));
  } catch {
    return null;
  }
}

function getWorker(): Worker | null {
  if (workerFailed) return null;
  if (!worker) {
    worker = createWorker();
    if (!worker) workerFailed = true;
  }
  return worker;
}

/**
 * CPU 수를 Worker에서 계산합니다. Worker를 쓸 수 없으면 동기 `getBestMove`로 대체합니다.
 */
export function requestAiMoveAsync(
  board: Board,
  aiStone: Turn,
  difficulty: OmokDifficulty,
): Promise<CellCoord | null> {
  const w = getWorker();
  if (!w) {
    return Promise.resolve(getBestMove(board, aiStone, { difficulty }));
  }

  const id = ++requestSeq;

  return new Promise((resolve) => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { type?: string; id?: number; move?: CellCoord | null };
      if (data?.type !== "result" || data.id !== id) return;
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      resolve(data.move ?? null);
    };
    const onError = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      workerFailed = true;
      worker = null;
      resolve(getBestMove(board, aiStone, { difficulty }));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({
      type: "compute",
      id,
      board,
      aiStone,
      difficulty,
    });
  });
}
