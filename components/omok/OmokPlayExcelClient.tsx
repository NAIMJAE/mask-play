"use client";

import { OmokBoard } from "@/components/omok/OmokBoard";
import { WorkDisguiseOverlay } from "@/components/omok/WorkDisguiseOverlay";
import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import { sheetBtnBase, sheetPanelInner } from "@/components/spreadsheet/sheetUi";
import { useOmokGame } from "@/hooks/useOmokGame";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";
import type { OmokSetupConfig } from "@/types/omok";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function difficultyLabel(d: OmokSetupConfig["difficulty"]) {
  switch (d) {
    case "easy":
      return "easy";
    case "normal":
      return "normal";
    case "hard":
      return "hard";
    default:
      return String(d);
  }
}

function OmokPlayExcelInner({ config }: { config: OmokSetupConfig }) {
  const router = useRouter();
  const game = useOmokGame(config);
  const [nameBox, setNameBox] = useState("A1");
  const [workDisguiseOpen, setWorkDisguiseOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setWorkDisguiseOpen((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (game.status === "playing") return;
    const q = new URLSearchParams({ outcome: game.status });
    router.replace(`/games/omok/result?${q.toString()}`);
  }, [game.status, router]);

  const formulaPreview = useMemo(() => {
    if (workDisguiseOpen) {
      return `=SUMIFS(취합!G:G,취합!A:A,"영업*",취합!K:K,"<>보류")`;
    }
    const diff = difficultyLabel(config.difficulty);
    const cpu =
      game.currentTurn === game.aiStone ? " · CPU 차례(자동 채움)" : "";
    const inner = `난이도:${diff} · 턴:${game.currentTurn} · 나:${config.playerColor}${cpu}`;
    return `="${inner}"`;
  }, [
    config.difficulty,
    config.playerColor,
    game.aiStone,
    game.currentTurn,
    workDisguiseOpen,
  ]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <SpreadsheetAppFrame
        className="min-h-0 flex-1"
        contentLayout="fill"
        workAreaGrid
        nameBox={workDisguiseOpen ? "G14" : nameBox}
        formulaPreview={formulaPreview}
        sheetTab="오목_플레이"
        statusBar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-gray-600">
              스킨: <span className="font-medium text-gray-800">Excel</span>
            </span>
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => game.restart()}
                className={`${sheetBtnBase} !py-1 !text-xs`}
              >
                다시 시작
              </button>
              <Link href="/" className={`${sheetBtnBase} !py-1 !text-xs text-[#1967d2]`}>
                홈
              </Link>
            </span>
          </div>
        }
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <OmokBoard
            board={game.board}
            currentTurn={game.currentTurn}
            humanStone={config.playerColor}
            status={game.status}
            lastMoves={game.lastMoves}
            onCellClick={game.humanMove}
            onActiveCellChange={(ref) => setNameBox(ref || "A1")}
          />
          {workDisguiseOpen ? <WorkDisguiseOverlay /> : null}
        </div>
      </SpreadsheetAppFrame>
    </div>
  );
}

export function OmokPlayExcelClient() {
  const config = useOmokSetupFromStorage();

  if (!config || config.skin !== "excel") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <SpreadsheetAppFrame
          className="min-h-0 flex-1"
          contentLayout="centered"
          nameBox="—"
          formulaPreview='="세션 없음 — setup에서 시작"'
          sheetTab="오목"
          statusBar={<span className="text-gray-600">저장된 게임 설정이 없습니다.</span>}
        >
          <div className={`${sheetPanelInner} flex max-w-md flex-col items-center space-y-4 text-center`}>
            <p className="text-gray-600">세션을 불러올 수 없습니다.</p>
            <Link href="/games/omok/setup" className={`inline-flex min-w-[200px] justify-center ${sheetBtnBase}`}>
              setup으로 이동
            </Link>
          </div>
        </SpreadsheetAppFrame>
      </div>
    );
  }

  return <OmokPlayExcelInner key={JSON.stringify(config)} config={config} />;
}
