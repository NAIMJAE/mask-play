import type { CSSProperties, ReactNode } from "react";

interface SheetLikeCanvasProps {
  children?: ReactNode;
  rows?: number;
  cols?: number;
  className?: string;
}

const HEADER_W = "2.25rem";
const HEADER_H = "1.75rem";

function colLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export function sheetCell(colStart: number, rowStart: number, colSpan = 1, rowSpan = 1): CSSProperties {
  return {
    gridColumn: `${colStart} / span ${colSpan}`,
    gridRow: `${rowStart} / span ${rowSpan}`,
  };
}

export function SheetLikeCanvas({
  children,
  rows = 30,
  cols = 26,
  className = "",
}: SheetLikeCanvasProps) {
  const bodyCells = Array.from({ length: rows * cols }, (_, i) => i);
  const colHeaders = Array.from({ length: cols }, (_, i) => i);
  const rowHeaders = Array.from({ length: rows }, (_, i) => i);

  return (
    <div className={`relative min-h-0 w-full flex-1 overflow-auto border border-[#dadce0] bg-white ${className}`}>
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `${HEADER_W} repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `${HEADER_H} repeat(${rows}, 1.9rem)`,
        }}
      >
        <div className="border-b border-r border-[#dadce0] bg-[#f3f3f3]" />
        {colHeaders.map((col) => (
          <div
            key={`h-col-${col}`}
            className="flex items-center justify-center border-b border-r border-[#dadce0] bg-[#f3f3f3] text-[10px] text-gray-600"
            style={{ gridColumn: col + 2, gridRow: 1 }}
          >
            {colLabel(col)}
          </div>
        ))}
        {rowHeaders.map((row) => (
          <div
            key={`h-row-${row}`}
            className="flex items-center justify-center border-b border-r border-[#dadce0] bg-[#f3f3f3] text-[10px] text-gray-600"
            style={{ gridColumn: 1, gridRow: row + 2 }}
          >
            {row + 1}
          </div>
        ))}
        {bodyCells.map((cell) => (
          <div
            key={`b-${cell}`}
            className="border-b border-r border-[#e0e0e0]"
            style={{
              gridColumn: (cell % cols) + 2,
              gridRow: Math.floor(cell / cols) + 2,
            }}
          />
        ))}
      </div>

      <div
        className="absolute z-[1] grid p-0.5"
        style={{
          left: HEADER_W,
          top: HEADER_H,
          right: 0,
          bottom: 0,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, 1.9rem)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
