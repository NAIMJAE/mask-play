"use client";

/**
 * ESC로 표시하는 ‘실제 업무 엑셀’ 위장 UI. 오목 보드 영역만 덮습니다.
 */

const HEADER = [
  "부서",
  "담당",
  "거래처",
  "항목",
  "수량",
  "단가",
  "금액",
  "세액",
  "합계",
  "마감일",
  "상태",
  "비고",
];

const ROWS: string[][] = [
  ["영업1팀", "김민준", "(주)한빛테크", "SW 유지보수", "1", "4,200,000", "4,200,000", "420,000", "4,620,000", "2025-03-28", "승인대기", "계약 갱신"],
  ["영업1팀", "이서연", "네오솔루션", "컨설팅", "120", "85,000", "10,200,000", "1,020,000", "11,220,000", "2025-03-31", "진행", "3월 분"],
  ["영업2팀", "박지훈", "글로벌물류", "하드웨어", "48", "312,500", "15,000,000", "1,500,000", "16,500,000", "2025-04-02", "발주", "납기 협의중"],
  ["영업2팀", "최유진", "(주)다옴", "라이선스", "200", "12,000", "2,400,000", "240,000", "2,640,000", "2025-03-25", "완료", "세금계산서 발행"],
  ["마케팅", "정하은", "내부", "캠페인 집행", "1", "8,900,000", "8,900,000", "890,000", "9,790,000", "2025-03-20", "검토", "Q1 브랜딩"],
  ["마케팅", "강도윤", "외주 A", "디자인", "35", "180,000", "6,300,000", "630,000", "6,930,000", "2025-03-29", "진행", "시안 2차"],
  ["개발팀", "윤채원", "내부", "SI 2차", "1", "22,000,000", "22,000,000", "2,200,000", "24,200,000", "2025-05-15", "착수", "WBS 확정"],
  ["개발팀", "한지우", "(주)링크업", "API 연동", "1", "5,500,000", "5,500,000", "550,000", "6,050,000", "2025-04-10", "개발중", "스테이징"],
  ["인사총무", "서준영", "내부", "복리후생", "1", "1,850,000", "1,850,000", "185,000", "2,035,000", "2025-03-31", "정산", "분기 정기"],
  ["인사총무", "문서현", "렌탈사 B", "사무기기", "12", "45,000", "540,000", "54,000", "594,000", "2025-04-01", "납품", "교체 분"],
  ["재무", "오은재", "내부", "예산 조정", "1", "0", "0", "0", "0", "2025-03-27", "보류", "경영회의 안건"],
  ["재무", "임나래", "은행 C", "이자비용", "1", "—", "2,310,000", "0", "2,310,000", "2025-03-31", "확정", "대출 상환"],
  ["영업1팀", "김민준", "스타유통", "물류비", "88", "3,200", "281,600", "28,160", "309,760", "2025-03-26", "완료", ""],
  ["영업2팀", "박지훈", "케이엠텍", "부품", "1,240", "2,150", "2,666,000", "266,600", "2,932,600", "2025-04-05", "출고", "재고 확인"],
  ["개발팀", "윤채원", "내부", "클라우드", "1", "1,980,000", "1,980,000", "198,000", "2,178,000", "2025-03-30", "청구", "월 사용료"],
];

export function WorkDisguiseOverlay() {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden border border-[#dadce0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
      role="dialog"
      aria-modal="true"
      aria-label="업무용 스프레드시트 보기"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#dadce0] bg-[#f3f3f3] px-2 py-1.5 text-[10px] text-gray-700 sm:text-[11px]">
        <span className="truncate font-medium">
          분기별_매출·비용_취합_2025Q1.xlsx{" "}
          <span className="font-normal text-gray-500">· 마지막 저장: 오늘 14:32</span>
        </span>
        <span className="shrink-0 rounded bg-[#e8f0fe] px-2 py-0.5 font-medium text-[#1967d2]">
          ESC · 게임으로
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <table className="w-max min-w-full border-collapse text-left text-[9px] text-gray-800 sm:text-[10px]">
          <thead className="sticky top-0 z-10 bg-[#f3f3f3] shadow-sm">
            <tr>
              <th className="sticky left-0 z-20 w-8 border border-[#e0e0e0] bg-[#f3f3f3] px-1 py-1 text-center font-semibold text-gray-600" />
              {HEADER.map((h, i) => (
                <th
                  key={h}
                  className="min-w-[4.5rem] border border-[#e0e0e0] px-1.5 py-1 font-semibold text-gray-700 sm:min-w-[5.5rem]"
                  title={`${String.fromCharCode(65 + i)}1`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                <td className="sticky left-0 z-[1] border border-[#e0e0e0] bg-inherit px-1 py-0.5 text-center text-gray-500">
                  {ri + 2}
                </td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="whitespace-nowrap border border-[#e0e0e0] px-1.5 py-0.5 tabular-nums text-gray-800"
                  >
                    {ci >= 4 && ci <= 8 ? (
                      <span className={cell === "—" ? "text-gray-400" : ""}>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-[#dadce0] bg-[#f8f9fa] px-2 py-2 text-[10px] text-gray-500">
          <p>
            ※ 샘플 데이터입니다. 실제 회사·거래처와 무관한 더미 값입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
