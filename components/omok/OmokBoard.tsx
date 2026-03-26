"use client";

import type { Board, GameResult, LastMovesHighlight, Turn } from "@/types/omok";
import { BOARD_SIZE } from "@/features/omok/logic";
import { formatSheetCellRef } from "@/utils/sheetCellRef";
import { useCallback, useEffect, useState } from "react";

interface OmokBoardProps {
  board: Board;
  currentTurn: Turn;
  humanStone: Turn;
  status: GameResult;
  lastMoves: LastMovesHighlight;
  onCellClick: (row: number, col: number) => void;
  onActiveCellChange?: (ref: string) => void;
}

const DISPLAY_COLS = 26;
const DISPLAY_ROWS = 26;
const DISPLAY_COL_LABELS = Array.from({ length: DISPLAY_COLS }, (_, i) =>
  String.fromCharCode(65 + i),
);
const DISPLAY_ROW_LABELS = Array.from({ length: DISPLAY_ROWS }, (_, i) => i + 1);
const PLAYABLE_COL_START = Math.floor((DISPLAY_COLS - BOARD_SIZE) / 2);
const PLAYABLE_ROW_START = Math.floor((DISPLAY_ROWS - BOARD_SIZE) / 2);

function sameCoord(
  a: { row: number; col: number } | null,
  r: number,
  c: number,
): boolean {
  return a !== null && a.row === r && a.col === c;
}

export function OmokBoard({
  board,
  currentTurn,
  humanStone,
  status,
  lastMoves,
  onCellClick,
  onActiveCellChange,
}: OmokBoardProps) {
  const playable = status === "playing" && currentTurn === humanStone;
  const [active, setActive] = useState<{ row: number; col: number } | null>({
    row: 0,
    col: 0,
  });

  const emitRef = useCallback(
    (row: number | null, col: number | null) => {
      if (row === null || col === null) {
        onActiveCellChange?.("");
        return;
      }
      onActiveCellChange?.(formatSheetCellRef(row, col));
    },
    [onActiveCellChange],
  );

  useEffect(() => {
    emitRef(0, 0);
  }, [emitRef]);

  const setHover = (row: number, col: number) => {
    setActive({ row, col });
    emitRef(row, col);
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col border border-[#dadce0] bg-white">
      <div
        className="grid min-h-0 min-w-0 flex-1 content-start bg-white"
        style={{
          gridTemplateColumns: `2.25rem repeat(${DISPLAY_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `1.75rem repeat(${DISPLAY_ROWS}, 1.9rem)`,
        }}
      >
        {/* 코너 */}
        <div className="border-b border-r border-[#dadce0] bg-[#f3f3f3]" />

        {/* 열 머리글 A–Z */}
        {DISPLAY_COL_LABELS.map((letter, c) => {
          const colActive = active?.col === c;
          return (
            <div
              key={letter}
              className={`flex items-center justify-center border-b border-r border-[#dadce0] py-1 text-center text-[10px] font-medium text-gray-600 ${
                colActive ? "bg-[#d3e3fd]" : "bg-[#f3f3f3]"
              }`}
            >
              {letter}
            </div>
          );
        })}

        {DISPLAY_ROW_LABELS.map((displayRow, r) => (
          <div key={`r-${r}`} className="contents">
            <div
              className={`flex items-center justify-center border-b border-r border-[#dadce0] text-center text-[10px] font-medium text-gray-600 ${
                active?.row === r ? "bg-[#d3e3fd]" : "bg-[#f3f3f3]"
              }`}
            >
              {displayRow}
            </div>
            {Array.from({ length: DISPLAY_COLS }, (_, c) => {
              const boardRow = r - PLAYABLE_ROW_START;
              const boardCol = c - PLAYABLE_COL_START;
              const inPlayableArea =
                boardRow >= 0 &&
                boardRow < BOARD_SIZE &&
                boardCol >= 0 &&
                boardCol < BOARD_SIZE;
              const cell = inPlayableArea ? board[boardRow][boardCol] : null;
              const isSelected = active?.row === r && active?.col === c;
              const canPlace =
                inPlayableArea && status === "playing" && playable && cell === null;

              let fill = "bg-white";
              if (cell === "black") fill = "bg-black";
              if (cell === "white") fill = "bg-gray-300";

              const isLastHuman = cell !== null && sameCoord(lastMoves.human, boardRow, boardCol);
              const isLastAi = cell !== null && sameCoord(lastMoves.ai, boardRow, boardCol);
              const isPlayableEdge =
                inPlayableArea &&
                (boardRow === 0 ||
                  boardRow === BOARD_SIZE - 1 ||
                  boardCol === 0 ||
                  boardCol === BOARD_SIZE - 1);
              const playableOuterBorder = inPlayableArea
                ? `${boardRow === 0 ? "border-t-2 border-t-[#5f6368]" : ""} ${
                    boardRow === BOARD_SIZE - 1 ? "border-b-2 border-b-[#5f6368]" : ""
                  } ${boardCol === 0 ? "border-l-2 border-l-[#5f6368]" : ""} ${
                    boardCol === BOARD_SIZE - 1
                      ? "border-r-2 border-r-[#5f6368]"
                      : ""
                  }`
                : "";

              let aria = `셀 ${formatSheetCellRef(r, c)}`;
              if (isLastHuman) aria += ", 내 마지막 수";
              if (isLastAi) aria += ", 상대 마지막 수";
              if (inPlayableArea) aria += ", 착수 가능 영역";

              return (
                <div
                  key={`${r}-${c}`}
                  role="presentation"
                  aria-label={aria}
                  onMouseEnter={() => setHover(r, c)}
                  onClick={() => {
                    if (canPlace) onCellClick(boardRow, boardCol);
                  }}
                  className={`relative box-border min-h-0 border-b border-r border-[#e0e0e0] ${fill} ${
                    isSelected
                      ? "z-[1] ring-2 ring-[#1a73e8] ring-inset"
                      : ""
                  } ${
                    canPlace
                      ? "cursor-pointer hover:bg-blue-50/90"
                      : "cursor-default"
                  } ${
                    isPlayableEdge ? `z-[1] ${playableOuterBorder}` : ""
                  }`}
                >
                  {isLastHuman && (
                    <span
                      className="pointer-events-none absolute left-0.5 top-0.5 z-[2] h-2 w-2 rounded-sm border border-white/90 bg-emerald-500 shadow-sm ring-1 ring-emerald-700/40 sm:h-2.5 sm:w-2.5"
                      title="내 마지막 수"
                      aria-hidden
                    />
                  )}
                  {isLastAi && (
                    <span
                      className="pointer-events-none absolute bottom-0.5 right-0.5 z-[2] h-2 w-2 rounded-sm border border-white/90 bg-orange-500 shadow-sm ring-1 ring-orange-700/40 sm:h-2.5 sm:w-2.5"
                      title="상대 마지막 수"
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
