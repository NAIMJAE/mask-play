"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const HELP_LINES = [
  "Available commands:",
  "  help",
  "  games | list",
  "  select omok",
  "  select bricks",
  "  open omok",
  "  open bricks",
  "  play omok",
  "  play bricks",
  "  clear | cls",
  "  exit",
];

const COMPLETIONS = [
  "help",
  "games",
  "list",
  "select omok",
  "select bricks",
  "open omok",
  "open bricks",
  "play omok",
  "play bricks",
  "clear",
  "cls",
  "exit",
];

export function CmdGameSelectClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "Microsoft Windows [Version 10.0.26200.7840]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\dev> cd workspace\\mask_play",
    "C:\\Users\\dev\\workspace\\mask_play> maskplay --skin cmd",
    "",
    "Initializing MaskPlay CMD Launcher...",
    "Loading game registry .......... OK",
    "Attaching cmd skin runtime ..... OK",
    "",
    "MaskPlay CMD Game Selector ready.",
    "Type 'games' to see available games.",
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const push = (...lines: string[]) => {
    setLogs((prev) => [...prev, ...lines]);
  };

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [logs]);

  const startOmok = () => {
    push("Launching Omok setup with CMD skin profile...");
    router.push("/games/omok/setup?skin=cmd");
  };

  const startBricks = () => {
    push("Launching Brick Breaker setup with CMD skin profile...");
    router.push("/games/bricks/setup");
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`C:\\mask_play\\cmd> ${cmd}`);
    const lower = cmd.toLowerCase();

    if (lower === "help") {
      push(...HELP_LINES);
      return;
    }
    if (lower === "games" || lower === "list") {
      push(
        "Installed games:",
        "  [1] omok      status: ready",
        "  [2] bricks    status: ready",
        "",
        "Select with: select omok | select bricks",
      );
      return;
    }
    if (lower === "select omok" || lower === "open omok" || lower === "play omok") {
      startOmok();
      return;
    }
    if (lower === "select bricks" || lower === "open bricks" || lower === "play bricks") {
      startBricks();
      return;
    }
    if (lower === "clear" || lower === "cls") {
      setLogs([]);
      return;
    }
    if (lower === "exit" || lower === "cd ..") {
      router.push("/");
      return;
    }

    push(
      `'${cmd}' is not recognized as an internal MaskPlay command.`,
      "Type 'help' to see available commands.",
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    runCommand(cmd);
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
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const q = input.trim().toLowerCase();
      if (!q) return;
      const hit = COMPLETIONS.find((c) => c.startsWith(q));
      if (hit) setInput(hit);
    }
  };

  return (
    <CmdFrame
      title="C:\\WINDOWS\\system32\\cmd.exe"
      subtitle="MASKPLAY / CMD GAME SELECTOR"
      footer={<span>tip: games -gt; select omok|bricks -gt; Enter</span>}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 text-left">
        <div
          ref={logRef}
          className="min-h-0 flex-1 overflow-auto text-zinc-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {logs.map((line, idx) => (
            <p key={`${idx}-${line}`}>{line}</p>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-zinc-800 pt-1">
          <span className="text-zinc-300">C:\\mask_play\\cmd&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            onBlur={() => inputRef.current?.focus()}
            className="min-w-0 flex-1 bg-black text-zinc-100 outline-none"
            spellCheck={false}
            aria-label="cmd game select input"
          />
        </form>
        <div className="text-xs text-zinc-500">
          또는 <Link href="/games/omok/setup?skin=cmd" className="underline underline-offset-2">omok 바로가기</Link>
          <span className="mx-2">|</span>
          <Link href="/games/bricks/setup" className="underline underline-offset-2">bricks 바로가기</Link>
        </div>
      </div>
    </CmdFrame>
  );
}
