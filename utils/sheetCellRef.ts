/** 0-based 열 → A, B, … (0–25만 지원, 오목 15칸용) */
export function columnLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

/** 0-based (row, col) → 시트 표기 e.g. L6 */
export function formatSheetCellRef(row: number, col: number): string {
  return `${columnLetter(col)}${row + 1}`;
}
