import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import {
  sheetBtnPrimary,
  sheetPanelCentered,
} from "@/components/spreadsheet/sheetUi";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="box-border flex min-h-0 flex-1 flex-col p-1">
      <SpreadsheetAppFrame
        className="min-h-0 flex-1"
        contentLayout="centered"
        workAreaGrid
        nameBox="A1"
        formulaPreview='="MaskPlay — 스프레드시트 스킨 미니게임"'
        sheetTab="홈"
        statusBar={
          <span>
            <span className="font-medium text-gray-800">문서</span>
            <span className="mx-1 text-gray-400">|</span>
            <span className="text-gray-600">시작 화면</span>
          </span>
        }
      >
        <div className={`${sheetPanelCentered} flex flex-col items-center space-y-4 text-center`}>
          <h1 className="text-xl font-semibold text-[#188038]">MaskPlay</h1>
          <p className="leading-relaxed text-gray-700">
            스프레드시트처럼 보이는 UI 안에서 짧게 즐기는 웹 미니게임입니다.
            현재 MVP는 오목 한 종류만 있습니다.
          </p>
          <p className="text-xs text-gray-500">
            실제 Google Sheets·Excel이 아닙니다. 클라이언트 전용 데모입니다.
          </p>
          <Link
            href="/games/omok/setup"
            className={`inline-flex justify-center ${sheetBtnPrimary} min-w-[200px]`}
          >
            오목 게임 시작
          </Link>
        </div>
      </SpreadsheetAppFrame>
    </main>
  );
}
