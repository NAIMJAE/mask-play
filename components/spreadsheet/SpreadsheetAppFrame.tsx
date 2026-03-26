import type { ReactNode } from "react";

export interface SpreadsheetAppFrameProps {
  nameBox: string;
  formulaPreview: string;
  children: ReactNode;
  statusBar: ReactNode;
  /** 하단 시트 탭 라벨 */
  sheetTab?: string;
  className?: string;
  /**
   * fill: 그리드/보드가 영역 전체 사용 (플레이)
   * centered: 회색 시트 영역 정중앙에 패널·버튼 배치 (홈·설정·결과)
   */
  contentLayout?: "fill" | "centered";
  /** 회색 작업 영역에 셀 격자 배경 (홈·설정 등) */
  workAreaGrid?: boolean;
}

function DecoButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`cursor-default select-none rounded px-1.5 py-0.5 text-left text-[11px] text-gray-700 hover:bg-black/5 ${className}`}
    >
      {children}
    </button>
  );
}

function DecoIconBtn({ label }: { label: string }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      title={label}
      aria-hidden
      className="flex h-7 w-7 cursor-default items-center justify-center rounded text-gray-600 hover:bg-black/5"
    >
      <span className="text-xs text-gray-400">◇</span>
    </button>
  );
}

/**
 * Google Sheets 느낌의 공통 앱 크롬(메뉴·툴바·이름 상자·시트 탭).
 * 장식 메뉴/아이콘은 동작하지 않습니다.
 */
export function SpreadsheetAppFrame({
  nameBox,
  formulaPreview,
  children,
  statusBar,
  sheetTab = "시트1",
  className = "",
  contentLayout = "fill",
  workAreaGrid: _workAreaGrid = false,
}: SpreadsheetAppFrameProps) {
  const isCentered = contentLayout === "centered";
  void _workAreaGrid;

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border border-[#c4c7c5] bg-white text-gray-800 shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-[#dadce0] bg-[#34a853] px-2 py-1">
        <span className="px-1 font-semibold text-white">Sheets</span>
        <div className="flex flex-wrap text-white/95">
          <DecoButton className="text-white hover:bg-white/10">파일</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">수정</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">보기</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">삽입</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">서식</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">데이터</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">도구</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">Gemini</DecoButton>
          <DecoButton className="text-white hover:bg-white/10">
            확장 프로그램
          </DecoButton>
          <DecoButton className="text-white hover:bg-white/10">도움말</DecoButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#dadce0] bg-[#f8f9fa] px-1 py-0.5">
        <DecoIconBtn label="실행 취소" />
        <DecoIconBtn label="다시 실행" />
        <DecoIconBtn label="인쇄" />
        <DecoIconBtn label="서식 복사" />
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <DecoButton className="min-w-[52px] text-center">100% ▾</DecoButton>
        <DecoButton className="min-w-[64px] text-center">기본값…</DecoButton>
        <DecoButton className="min-w-[28px] text-center">10 ▾</DecoButton>
        <DecoIconBtn label="굵게" />
        <DecoIconBtn label="기울임" />
        <DecoIconBtn label="글자색" />
        <DecoIconBtn label="채우기" />
        <DecoIconBtn label="테두리" />
        <DecoIconBtn label="맞춤" />
      </div>

      <div className="flex items-stretch gap-1 border-b border-[#dadce0] bg-[#f8f9fa] px-2 py-1">
        <div
          className="flex w-24 shrink-0 items-center justify-center border border-[#dadce0] bg-white px-1 text-center text-[11px] font-medium text-gray-700"
          aria-live="polite"
        >
          {nameBox}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1 border border-[#dadce0] bg-white px-2 py-0.5">
          <span className="shrink-0 text-[10px] font-semibold italic text-gray-400">
            fx
          </span>
          <span className="truncate text-[11px] text-gray-500">
            {formulaPreview}
          </span>
        </div>
      </div>

      <div className="border-b border-[#dadce0] bg-[#eef3ff] px-2 py-1.5 text-[11px] text-gray-700">
        <div className="flex min-h-4 w-full items-center">{statusBar}</div>
      </div>

      <div
        className={`relative flex min-h-0 min-w-0 flex-1 overflow-auto bg-[#f8f9fa] ${
          isCentered
            ? "items-center justify-center p-4 sm:p-8"
            : "flex-col"
        }`}
      >
        <div
          className={
            isCentered
              ? "relative z-[1] flex w-full max-w-lg flex-col items-center"
              : "relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col"
          }
        >
          {children}
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-[#dadce0] bg-[#f1f3f4] px-2 py-1 text-[11px]">
        <button
          type="button"
          tabIndex={-1}
          className="cursor-default px-1 text-gray-500"
          aria-hidden
        >
          +
        </button>
        <button
          type="button"
          tabIndex={-1}
          className="cursor-default px-1 text-gray-500"
          aria-hidden
        >
          ≡
        </button>
        <div className="rounded-t border border-b-0 border-[#dadce0] bg-white px-3 py-1 text-blue-700">
          {sheetTab}
        </div>
      </div>
    </div>
  );
}
