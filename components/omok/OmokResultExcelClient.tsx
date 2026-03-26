"use client";

import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import { SheetLikeCanvas, sheetCell } from "@/components/spreadsheet/SheetLikeCanvas";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";
import type { GameResult, Turn } from "@/types/omok";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

function parseOutcome(raw: string | null): GameResult | null {
  if (raw === "black-win" || raw === "white-win" || raw === "draw" || raw === "playing") return raw;
  return null;
}

function headline(outcome: GameResult, playerColor: Turn | null): { title: string; detail: string } {
  if (outcome === "draw") return { title: "DRAW", detail: "보드가 가득 찼습니다. 승자 없음." };
  if (!playerColor) return { title: outcome === "black-win" ? "BLACK WIN" : "WHITE WIN", detail: "세션 정보가 없습니다." };
  const wonBlack = outcome === "black-win";
  const playerWon = (playerColor === "black" && wonBlack) || (playerColor === "white" && !wonBlack);
  return playerWon
    ? { title: "YOU WIN", detail: `${playerColor} 기준 승리입니다.` }
    : { title: "YOU LOSE", detail: `${playerColor} 기준 패배입니다.` };
}

export function OmokResultExcelClient() {
  const search = useSearchParams();
  const setup = useOmokSetupFromStorage();
  const outcomeParam = search.get("outcome");
  const outcome = useMemo(() => parseOutcome(outcomeParam), [outcomeParam]);

  if (!outcome || outcome === "playing") {
    return (
      <SpreadsheetAppFrame
        className="min-h-0 flex-1"
        contentLayout="fill"
        workAreaGrid
        nameBox="—"
        formulaPreview='="오류: 유효하지 않은 결과"'
        sheetTab="오목_결과"
        statusBar={<span className="text-gray-600">결과를 불러올 수 없습니다.</span>}
      >
        <SheetLikeCanvas>
          <div style={sheetCell(6, 11, 7, 1)} className="flex items-center px-1 text-gray-600">
            유효하지 않은 결과입니다.
          </div>
          <div style={sheetCell(6, 13, 3, 1)} className="flex items-center px-1">
            <Link href="/games/omok/setup" className="underline underline-offset-2 hover:text-[#1967d2]">
              setup으로 이동
            </Link>
          </div>
        </SheetLikeCanvas>
      </SpreadsheetAppFrame>
    );
  }

  const { title, detail } = headline(outcome, setup?.playerColor ?? null);
  return (
    <SpreadsheetAppFrame
      className="min-h-0 flex-1"
      contentLayout="fill"
      workAreaGrid
      nameBox="C3"
      formulaPreview={`="결과: ${outcome}"`}
      sheetTab="오목_결과"
      statusBar={<span className="text-gray-600">스킨: Excel</span>}
    >
      <SheetLikeCanvas>
        <div style={sheetCell(7, 10, 4, 1)} className="flex items-center px-1 text-base font-semibold text-[#188038]">
          {title}
        </div>
        <div style={sheetCell(6, 12, 7, 1)} className="flex items-center px-1 text-gray-700">
          {detail}
        </div>
        <div style={sheetCell(6, 14, 3, 1)} className="flex items-center px-1">
          <Link href="/games/omok/play" className="underline underline-offset-2 hover:text-[#1967d2]">
            replay
          </Link>
        </div>
        <div style={sheetCell(10, 14, 3, 1)} className="flex items-center px-1">
          <Link href="/games/omok/setup" className="underline underline-offset-2 hover:text-[#1967d2]">
            setup
          </Link>
        </div>
      </SheetLikeCanvas>
    </SpreadsheetAppFrame>
  );
}
