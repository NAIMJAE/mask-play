"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";
import type { GameResult } from "@/types/omok";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

function parseOutcome(raw: string | null): GameResult | null {
  if (raw === "black-win" || raw === "white-win" || raw === "draw") return raw;
  return null;
}

export function OmokResultCmdClient() {
  const search = useSearchParams();
  const router = useRouter();
  const setup = useOmokSetupFromStorage();
  const outcome = parseOutcome(search.get("outcome"));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const totalTurns = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const raw = sessionStorage.getItem("maskplay:omok:last-turns");
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  }, []);

  if (!outcome) {
    return (
      <CmdFrame title="MaskPlay / Result" subtitle="INVALID">
        <p>결과 파라미터가 유효하지 않습니다.</p>
      </CmdFrame>
    );
  }

  const mine = setup?.playerColor ?? "black";
  const iWon =
    outcome === "draw"
      ? null
      : (mine === "black" && outcome === "black-win") ||
        (mine === "white" && outcome === "white-win");
  const result = outcome === "draw" ? "DRAW" : iWon ? "WIN" : "LOSE";

  const reportLines = [
    "Match completed.",
    "--------------------------------",
    `Result          : ${result}`,
    `Player stone    : ${mine.toUpperCase()}`,
    `Total turns     : ${totalTurns || "-"}`,
    `CPU difficulty  : ${(setup?.difficulty ?? "normal").toUpperCase()}`,
    "Session status  : CLOSED",
    "",
    "Type 'restart' to play again.",
    "Type 'setup' to reconfigure.",
    "Type 'exit' to return home.",
  ];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput("");
    if (!cmd) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    if (cmd === "restart") {
      router.push("/games/omok/play");
      return;
    }
    if (cmd === "setup") {
      router.push("/games/omok/setup?skin=cmd");
      return;
    }
    if (cmd === "exit") {
      router.push("/");
      return;
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        const next = prev < 0 ? history.length - 1 : Math.max(0, prev - 1);
        setInput(history[next] ?? "");
        return next;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((prev) => {
        if (prev < 0) return -1;
        const next = prev + 1;
        if (next >= history.length) {
          setInput("");
          return -1;
        }
        setInput(history[next] ?? "");
        return next;
      });
    }
  };

  return (
    <CmdFrame
      title="C:\\WINDOWS\\system32\\cmd.exe"
      subtitle="MASKPLAY / RESULT"
      footer={<span>enter command: restart | setup | exit</span>}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-0 flex-1 overflow-auto text-zinc-200">
          {reportLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-zinc-300">C:\\mask_play\\result&gt;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={() => inputRef.current?.focus()}
              className="min-w-0 flex-1 bg-black text-zinc-100 outline-none"
              spellCheck={false}
            />
          </form>
        </div>
      </div>
    </CmdFrame>
  );
}
