"use client";

import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import {
  sheetBtnBase,
  sheetBtnPrimary,
  sheetPanelCentered,
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

export function OmokSetupForm() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<OmokDifficulty>("normal");
  const [playerColor, setPlayerColor] = useState<Turn>("black");
  const [firstTurn, setFirstTurn] = useState<Turn>("black");

  const formulaPreview = useMemo(
    () =>
      `="설정: 난이도=${difficulty}, 내색=${playerColor}, 선공=${firstTurn}"`,
    [difficulty, firstTurn, playerColor],
  );

  const start = () => {
    const config: OmokSetupConfig = {
      difficulty,
      playerColor,
      firstTurn,
    };
    saveOmokSetup(config);
    router.push("/games/omok/play");
  };

  return (
    <SpreadsheetAppFrame
      className="min-h-0 flex-1"
      contentLayout="centered"
      workAreaGrid
      nameBox="B2"
      formulaPreview={formulaPreview}
      sheetTab="오목_설정"
      statusBar={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            <span className="font-medium text-gray-800">오목</span>
            <span className="mx-1 text-gray-400">|</span>
            <span className="text-gray-600">난이도·색·선공 (CPU 대전)</span>
          </span>
          <Link href="/" className={`${sheetBtnBase} !py-1 !text-xs`}>
            홈
          </Link>
        </div>
      }
    >
      <div
        className={`${sheetPanelCentered} flex flex-col items-center space-y-6 text-center`}
      >
        <section className="w-full space-y-3">
          <h2 className={sheetSectionTitle}>difficulty</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`border px-3 py-1.5 text-xs uppercase ${chipActive(difficulty === d)}`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section className="w-full space-y-3">
          <h2 className={sheetSectionTitle}>your stone</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {turns.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPlayerColor(t)}
                className={`border px-3 py-1.5 text-xs ${chipActive(playerColor === t)}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="w-full space-y-3">
          <h2 className={sheetSectionTitle}>first move</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {turns.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFirstTurn(t)}
                className={`border px-3 py-1.5 text-xs ${chipActive(firstTurn === t)}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <div className="flex w-full max-w-sm flex-col items-stretch gap-2 pt-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={start}
            className={`${sheetBtnPrimary} justify-center`}
          >
            게임 시작
          </button>
          <Link
            href="/"
            className={`${sheetBtnBase} flex justify-center text-center`}
          >
            홈으로
          </Link>
        </div>
      </div>
    </SpreadsheetAppFrame>
  );
}
