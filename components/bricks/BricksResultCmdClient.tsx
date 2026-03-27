"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import { STAGE_ORDER } from "@/features/bricks/stages";
import { useBricksSetupFromStorage } from "@/hooks/useBricksSetupFromStorage";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { BricksStageId } from "@/types/bricks";

function parseStage(raw: string | null): BricksStageId | null {
  if (!raw) return null;
  const s = raw.toLowerCase() as BricksStageId;
  return STAGE_ORDER.includes(s) ? s : null;
}

export function BricksResultCmdClient() {
  const search = useSearchParams();
  const router = useRouter();
  const setup = useBricksSetupFromStorage();
  const stage = parseStage(search.get("stage")) ?? setup?.stage ?? "ls";
  const result = search.get("result") === "clear" ? "CLEAR" : "UNKNOWN";
  const ballsLeft = Number(search.get("balls") ?? "0");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fireFrame, setFireFrame] = useState(0);
  const [showFireworks, setShowFireworks] = useState(result === "CLEAR");

  const fireworksFrames = useMemo(
    () => [
      ["      .      *      .      ", "   .      +      x       .  ", "      o       .      *      "],
      ["  *    .   +   .   x   .    ", "    .   o    *    .    +    ", "  .    x    .    o    .      "],
      [" .  *  .  +  .  o  .  x  .  ", "   x   .   *   .   o   .    ", " .  +  .  x  .  *  .  o  .   "],
      ["      .      +      .      ", "   .      *      o       .  ", "      x       .      +      "],
    ],
    [],
  );

  useEffect(() => {
    if (result !== "CLEAR") return;
    setShowFireworks(true);
    setFireFrame(0);
    let idx = 0;
    const id = window.setInterval(() => {
      idx += 1;
      if (idx >= fireworksFrames.length) {
        window.clearInterval(id);
        setShowFireworks(false);
        return;
      }
      setFireFrame(idx);
    }, 190);
    return () => window.clearInterval(id);
  }, [fireworksFrames, result]);

  const reportLines = useMemo(
    () => [
      "Session report generated.",
      "--------------------------------",
      `Game            : BRICK BREAKER`,
      `Stage           : ${stage}`,
      `Result          : ${result}`,
      `Balls survived  : ${Number.isFinite(ballsLeft) ? ballsLeft : 0}`,
      "Session status  : CLOSED",
      "",
      "Type 'restart' to replay current stage.",
      "Type 'setup' to pick another stage.",
      "Type 'exit' to return game selector.",
    ],
    [ballsLeft, result, stage],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput("");
    if (!cmd) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    if (cmd === "restart") {
      router.push("/games/bricks/play");
      return;
    }
    if (cmd === "setup") {
      router.push("/games/bricks/setup");
      return;
    }
    if (cmd === "exit") {
      router.push("/games/cmd");
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
      subtitle="MASKPLAY / BRICKS RESULT"
      footer={<span>enter command: restart | setup | exit</span>}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-0 flex-1 overflow-auto text-zinc-200">
          {showFireworks ? (
            <div className="mb-2 border border-zinc-700 px-2 py-1 text-center text-[11px] leading-4 text-zinc-300">
              {fireworksFrames[fireFrame]?.map((line, idx) => (
                <p key={`fw-${fireFrame}-${idx}`}>{line}</p>
              ))}
              <p className="mt-1 text-zinc-100">*** STAGE CLEAR ***</p>
            </div>
          ) : null}
          {reportLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2 text-xs">
            <span className="text-zinc-300">C:\\mask_play\\bricks\\result&gt;</span>
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

