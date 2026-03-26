"use client";

import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import { SheetLikeCanvas, sheetCell } from "@/components/spreadsheet/SheetLikeCanvas";
import {
  sheetBtnBase,
  sheetSectionTitle,
} from "@/components/spreadsheet/sheetUi";
import type { OmokDifficulty, OmokSetupConfig, Turn } from "@/types/omok";
import { saveOmokSetup } from "@/utils/omokStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const difficulties: OmokDifficulty[] = ["easy", "normal", "hard"];
const turns: Turn[] = ["black", "white"];

function chipActive(active: boolean) {
  return active
    ? "border-[#1a73e8] bg-[#e8f0fe] text-[#1967d2]"
    : "border-[#dadce0] bg-white text-gray-700 hover:bg-[#f8f9fa]";
}

export function OmokSetupExcelForm() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<OmokDifficulty>("normal");
  const [playerColor, setPlayerColor] = useState<Turn>("black");
  const [firstTurn, setFirstTurn] = useState<Turn>("black");

  const formulaPreview = useMemo(
    () => `="설정: 스킨=excel, 난이도=${difficulty}, 내색=${playerColor}, 선공=${firstTurn}"`,
    [difficulty, firstTurn, playerColor],
  );

  const start = () => {
    const config: OmokSetupConfig = {
      difficulty,
      playerColor,
      firstTurn,
      skin: "excel",
    };
    saveOmokSetup(config);
    router.push("/games/omok/play");
  };

  return (
    <SpreadsheetAppFrame
      className="min-h-0 flex-1"
      contentLayout="fill"
      workAreaGrid
      nameBox="B2"
      formulaPreview={formulaPreview}
      sheetTab="오목_설정"
      statusBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            <span className="font-medium text-gray-800">오목</span>
            <span className="mx-1 text-gray-400">|</span>
            <span className="text-gray-600">스킨: Excel</span>
          </span>
          <Link href="/" className={`${sheetBtnBase} !py-1 !text-xs`}>
            홈
          </Link>
        </div>
      }
    >
      <SheetLikeCanvas>
        <section style={sheetCell(6, 9, 4, 3)} className="px-2 py-1">
          <h2 className={`${sheetSectionTitle} mb-2`}>difficulty</h2>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`border px-2 py-1 text-[10px] uppercase ${chipActive(difficulty === d)}`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>
        <section style={sheetCell(11, 9, 3, 3)} className="px-2 py-1">
          <h2 className={`${sheetSectionTitle} mb-2`}>your stone</h2>
          <div className="flex flex-wrap gap-2">
            {turns.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPlayerColor(t)}
                className={`border px-2 py-1 text-[10px] ${chipActive(playerColor === t)}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
        <section style={sheetCell(6, 13, 4, 3)} className="px-2 py-1">
          <h2 className={`${sheetSectionTitle} mb-2`}>first move</h2>
          <div className="flex flex-wrap gap-2">
            {turns.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFirstTurn(t)}
                className={`border px-2 py-1 text-[10px] ${chipActive(firstTurn === t)}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
        <div style={sheetCell(6, 17, 3, 1)} className="flex items-center px-2">
          <button
            type="button"
            onClick={start}
            className="underline underline-offset-2 hover:text-[#1967d2]"
          >
            game start
          </button>
        </div>
        <div style={sheetCell(10, 17, 2, 1)} className="flex items-center px-2">
          <Link href="/" className="underline underline-offset-2 hover:text-[#1967d2]">
            home
          </Link>
        </div>
      </SheetLikeCanvas>
    </SpreadsheetAppFrame>
  );
}
