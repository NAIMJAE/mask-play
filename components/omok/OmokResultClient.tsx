"use client";

import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import {
  sheetBtnBase,
  sheetBtnPrimary,
  sheetPanelCentered,
} from "@/components/spreadsheet/sheetUi";
import type { GameResult, Turn } from "@/types/omok";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

function parseOutcome(raw: string | null): GameResult | null {
  if (
    raw === "black-win" ||
    raw === "white-win" ||
    raw === "draw" ||
    raw === "playing"
  ) {
    return raw;
  }
  return null;
}

function headline(
  outcome: GameResult,
  playerColor: Turn | null,
): { title: string; detail: string } {
  if (outcome === "draw") {
    return { title: "DRAW", detail: "보드가 가득 찼습니다. 승자 없음." };
  }
  if (!playerColor) {
    return {
      title: outcome === "black-win" ? "BLACK WIN" : "WHITE WIN",
      detail: "세션 정보가 없습니다. setup에서 다시 시작하세요.",
    };
  }
  const wonBlack = outcome === "black-win";
  const playerWon =
    (playerColor === "black" && wonBlack) ||
    (playerColor === "white" && !wonBlack);
  if (playerWon) {
    return { title: "YOU WIN", detail: `${playerColor} 기준 승리입니다.` };
  }
  return { title: "YOU LOSE", detail: `${playerColor} 기준 패배입니다.` };
}

export function OmokResultClient() {
  const search = useSearchParams();
  const setup = useOmokSetupFromStorage();

  const outcomeParam = search.get("outcome");
  const outcome = useMemo(
    () => parseOutcome(outcomeParam),
    [outcomeParam],
  );

  const invalidFrame = (
    <SpreadsheetAppFrame
      className="min-h-0 flex-1"
      contentLayout="centered"
      nameBox="—"
      formulaPreview='="오류: 유효하지 않은 결과"'
      sheetTab="오목_결과"
      statusBar={
        <span className="text-gray-600">결과를 불러올 수 없습니다.</span>
      }
    >
      <div
        className={`${sheetPanelCentered} flex flex-col items-center space-y-4 text-center`}
      >
        <p className="text-gray-600">유효하지 않은 결과입니다.</p>
        <Link
          href="/games/omok/setup"
          className={`inline-flex min-w-[200px] justify-center ${sheetBtnPrimary}`}
        >
          setup으로 이동
        </Link>
      </div>
    </SpreadsheetAppFrame>
  );

  if (!outcome || outcome === "playing") {
    return invalidFrame;
  }

  const { title, detail } = headline(outcome, setup?.playerColor ?? null);

  const formulaPreview = `="결과: ${outcome}"`;

  return (
    <SpreadsheetAppFrame
      className="min-h-0 flex-1"
      contentLayout="centered"
      nameBox="C3"
      formulaPreview={formulaPreview}
      sheetTab="오목_결과"
      statusBar={
        <span>
          <span className="font-medium text-gray-800">오목</span>
          <span className="mx-1 text-gray-400">|</span>
          <span className="font-mono text-xs text-gray-600">{outcome}</span>
        </span>
      }
    >
      <div
        className={`${sheetPanelCentered} flex flex-col items-center space-y-4 text-center`}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          outcome={outcome}
        </p>
        <h1 className="text-2xl font-semibold text-[#188038]">{title}</h1>
        <p className="text-gray-700">{detail}</p>

        <div className="flex w-full max-w-sm flex-col items-stretch gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link
            href="/games/omok/play"
            className={`${sheetBtnBase} flex justify-center text-center`}
          >
            다시하기
          </Link>
          <Link
            href="/games/omok/setup"
            className={`${sheetBtnPrimary} flex justify-center text-center`}
          >
            설정으로
          </Link>
          <Link href="/" className={`${sheetBtnBase} flex justify-center text-center`}>
            홈
          </Link>
        </div>
      </div>
    </SpreadsheetAppFrame>
  );
}
