import { SpreadsheetAppFrame } from "@/components/spreadsheet/SpreadsheetAppFrame";
import { SheetLikeCanvas, sheetCell } from "@/components/spreadsheet/SheetLikeCanvas";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="box-border flex min-h-0 flex-1 flex-col">
      <SpreadsheetAppFrame
        className="min-h-0 flex-1"
        contentLayout="fill"
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
        <SheetLikeCanvas>
          <div style={sheetCell(8, 9, 4, 1)} className="flex items-center px-1 text-xs text-gray-900">
            MaskPlay
          </div>
          <div style={sheetCell(6, 10, 9, 1)} className="flex items-center px-1 text-[11px] text-gray-700">
            스킨을 선택해서 같은 오목 게임을 다른 분위기로 플레이할 수 있습니다.
            기본 스킨은 Excel입니다.
          </div>
          <div style={sheetCell(7, 12, 7, 1)} className="flex items-center px-1 text-[10px] text-gray-500">
            실제 Google Sheets·Excel이 아닙니다. 클라이언트 전용 데모입니다.
          </div>
          <div style={sheetCell(6, 14, 2, 1)} className="flex items-center px-1">
            <Link
              href="/games/omok/setup?skin=excel"
              className="underline underline-offset-2 hover:text-[#1967d2]"
            >
              excel skin
            </Link>
          </div>
          <div style={sheetCell(9, 14, 2, 1)} className="flex items-center px-1">
            <Link
              href="/games/omok/setup?skin=cmd"
              className="underline underline-offset-2 hover:text-[#1967d2]"
            >
              cmd skin
            </Link>
          </div>
        </SheetLikeCanvas>
      </SpreadsheetAppFrame>
    </main>
  );
}
