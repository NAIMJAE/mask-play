"use client";

import { BOARD_SIZE } from "@/features/omok/logic";
import type { Board, GameResult, LastMovesHighlight, Turn } from "@/types/omok";
import { useMemo } from "react";

interface OmokBoardCmdProps {
  board: Board;
  currentTurn: Turn;
  humanStone: Turn;
  status: GameResult;
  lastMoves: LastMovesHighlight;
}

function oppositeTurn(turn: Turn): Turn {
  return turn === "black" ? "white" : "black";
}

function resolveLatestMove(
  currentTurn: Turn,
  humanStone: Turn,
  status: GameResult,
  lastMoves: LastMovesHighlight,
): { row: number; col: number } | null {
  const aiStone = oppositeTurn(humanStone);
  const latestStone: Turn =
    status === "playing" ? oppositeTurn(currentTurn) : currentTurn;

  if (latestStone === humanStone && lastMoves.human) return lastMoves.human;
  if (latestStone === aiStone && lastMoves.ai) return lastMoves.ai;
  return lastMoves.human ?? lastMoves.ai ?? null;
}

function sameCoord(
  a: { row: number; col: number } | null,
  r: number,
  c: number,
): boolean {
  return a !== null && a.row === r && a.col === c;
}

function stoneColorClass(cell: Turn | null): string {
  if (cell === "black") return "text-[#20FF1F]";
  if (cell === "white") return "text-[#FF8C1A]";
  return "text-zinc-500";
}

export function OmokBoardCmd({
  board,
  currentTurn,
  humanStone,
  status,
  lastMoves,
}: OmokBoardCmdProps) {
  const rows = board.length;
  const cols = board[0]?.length ?? BOARD_SIZE;
  const focus = useMemo(
    () => resolveLatestMove(currentTurn, humanStone, status, lastMoves),
    [currentTurn, humanStone, lastMoves, status],
  );
  const focusCell = focus ? board[focus.row]?.[focus.col] ?? null : null;
  const focusHeaderClass = focus ? stoneColorClass(focusCell) : "";

  return (
    <div className="flex h-[420px] w-full shrink-0 flex-col bg-black p-2 outline-none" aria-label="cmd omok board view">
      <div className="mb-2 border-b border-zinc-800 pb-1 text-xs text-zinc-300">
        -- BOARD VIEW -- place by command input (e.g. H8)
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="w-max font-mono text-xs leading-5 text-zinc-200">
          <div className="flex">
            <span className="inline-block w-10" />
            {Array.from({ length: cols }, (_, c) => {
              const headerClass =
                focus && focus.col === c
                  ? `inline-block w-6 text-center ${focusHeaderClass}`
                  : "inline-block w-6 text-center";
              return (
                <span key={`h-${c}`} className={headerClass}>
                  {String.fromCharCode(65 + c)}
                </span>
              );
            })}
          </div>
          {Array.from({ length: rows }, (_, r) => (
            <div key={`r-${r}`} className="flex">
              <span
                className={`inline-block w-10 pr-1 text-right ${
                  focus && focus.row === r ? focusHeaderClass : ""
                }`}
              >
                {r + 1}
              </span>
              {Array.from({ length: cols }, (_, c) => {
                const cell = board[r][c];
                const stone = cell === "black" ? "X" : cell === "white" ? "O" : "·";
                const colorClass = stoneColorClass(cell);
                const isFocus = focus?.row === r && focus?.col === c;
                const isLastHuman = cell !== null && sameCoord(lastMoves.human, r, c);
                const isLastAi = cell !== null && sameCoord(lastMoves.ai, r, c);
                const text = isLastHuman || isLastAi ? stone.toLowerCase() : stone;
                return (
                  <span key={`c-${r}-${c}`} className="inline-block w-6 text-center">
                    {isFocus ? (
                      <>
                        <span>[</span>
                        <span className={colorClass}>{text}</span>
                        <span>]</span>
                      </>
                    ) : (
                      <>
                        <span> </span>
                        <span className={colorClass}>{text}</span>
                        <span> </span>
                      </>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 border-t border-zinc-800 pt-2 text-xs text-zinc-400">
        focus={focus ? `${String.fromCharCode(65 + focus.col)}${focus.row + 1}` : "N/A"} turn={currentTurn} board={BOARD_SIZE}x{BOARD_SIZE}
      </div>
    </div>
  );
}
