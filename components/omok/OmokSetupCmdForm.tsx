"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import type { OmokDifficulty, OmokSetupConfig, Turn } from "@/types/omok";
import { saveOmokSetup } from "@/utils/omokStorage";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const difficulties: OmokDifficulty[] = ["easy", "normal", "hard"];
const turns: Turn[] = ["black", "white"];
const CMD_HELP = [
  "Available commands:",
  "  help",
  "  set difficulty easy|normal|hard",
  "  set stone black|white",
  "  set first black|white",
  "  status",
  "  run",
  "  clear | cls",
  "  ver | dir | whoami",
  "  exit",
];
const COMPLETIONS = [
  "help",
  "set difficulty easy",
  "set difficulty normal",
  "set difficulty hard",
  "set stone black",
  "set stone white",
  "set first black",
  "set first white",
  "status",
  "run",
  "clear",
  "cls",
  "ver",
  "dir",
  "whoami",
  "exit",
];

export function OmokSetupCmdForm() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<OmokDifficulty>("normal");
  const [playerColor, setPlayerColor] = useState<Turn>("black");
  const [firstTurn, setFirstTurn] = useState<Turn>("black");
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"intro" | "difficulty" | "stone" | "first" | "confirm">("intro");
  const [logs, setLogs] = useState<string[]>([
    "Microsoft Windows [Version 10.0.26200.7840]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\dev> cd workspace\\mask_play",
    "C:\\Users\\dev\\workspace\\mask_play> maskplay --skin cmd --game omok",
    "",
    "Initializing MaskPlay Runtime...",
    "Loading omok module .......... OK",
    "Loading cmd skin ............. OK",
    "Mounting game setup .......... OK",
    "",
    "MaskPlay CMD Setup Wizard ready.",
    "Type 'help' to begin.",
    "",
    "Continue? [Y/n]",
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState<number>(-1);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const start = () => {
    const config: OmokSetupConfig = {
      difficulty,
      playerColor,
      firstTurn,
      skin: "cmd",
    };
    saveOmokSetup(config);
    router.push("/games/omok/play");
  };

  const statusLines = useMemo(() => {
    const diff = difficulties
      .map((d) => `[${difficulty === d ? "x" : " "}] ${d}`)
      .join("  ");
    const stone = turns
      .map((t) => `[${playerColor === t ? "x" : " "}] ${t}`)
      .join("  ");
    const first = turns
      .map((t) => `[${firstTurn === t ? "x" : " "}] ${t}`)
      .join("  ");
    return [
      `difficulty  ${diff}`,
      `your stone  ${stone}`,
      `first move  ${first}`,
    ];
  }, [difficulty, firstTurn, playerColor]);

  const push = (...lines: string[]) => {
    setLogs((prev) => [...prev, ...lines]);
  };

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [logs]);

  const nextQuestion = (next: "difficulty" | "stone" | "first" | "confirm") => {
    setStep(next);
    if (next === "difficulty") {
      push("Select difficulty:", "  [1] easy", "  [2] normal", "  [3] hard");
      return;
    }
    if (next === "stone") {
      push("Select your stone:", "  [1] black (X)", "  [2] white (O)");
      return;
    }
    if (next === "first") {
      push("Select first move:", "  [1] black first", "  [2] white first");
      return;
    }
    push("Install configuration now? [Y/n]");
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`C:\\mask_play\\cmd> ${cmd}`);

    const lower = cmd.toLowerCase();
    const parts = lower.split(/\s+/);
    if (lower === "help") {
      push(...CMD_HELP);
      return;
    }
    if (lower === "status") {
      push(...statusLines);
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
    if (lower === "run") {
      start();
      return;
    }
    if (lower === "ver") {
      push("MaskPlay CMD Runtime Version 0.1.2");
      return;
    }
    if (lower === "whoami") {
      push("maskplay-user");
      return;
    }
    if (lower === "dir") {
      push("", " Directory of C:\\mask_play\\cmd", "", "omok.exe", "skin.cmd", "config.sys", "runtime.dll");
      return;
    }
    if (parts[0] === "set" && parts.length >= 3) {
      const key = parts[1];
      const value = parts[2];
      if (key === "difficulty" && (value === "easy" || value === "normal" || value === "hard")) {
        setDifficulty(value);
        push(`Difficulty set to ${value.toUpperCase()}.`);
        return;
      }
      if (key === "stone" && (value === "black" || value === "white")) {
        setPlayerColor(value);
        push(`Player stone set to ${value.toUpperCase()}.`);
        return;
      }
      if (key === "first" && (value === "black" || value === "white")) {
        setFirstTurn(value);
        push(`First move set to ${value.toUpperCase()}.`);
        return;
      }
      if (key === "difficult") {
        push(
          "'difficult' is not recognized as a valid configuration key.",
          "Type 'help' to see available commands.",
        );
        return;
      }
      if (key === "stone") {
        push("Invalid value for 'stone'.", "Allowed values: black, white");
        return;
      }
    }

    const v = lower;
    if (step === "intro") {
      if (v === "y" || v === "yes" || v === "enter") {
        nextQuestion("difficulty");
        return;
      }
      if (v === "n" || v === "no") {
        router.push("/");
        return;
      }
    }
    if (step === "difficulty") {
      if (v === "1" || v === "easy") {
        setDifficulty("easy");
        nextQuestion("stone");
        return;
      }
      if (v === "2" || v === "normal") {
        setDifficulty("normal");
        nextQuestion("stone");
        return;
      }
      if (v === "3" || v === "hard") {
        setDifficulty("hard");
        nextQuestion("stone");
        return;
      }
    }
    if (step === "stone") {
      if (v === "1" || v === "black" || v === "x") {
        setPlayerColor("black");
        nextQuestion("first");
        return;
      }
      if (v === "2" || v === "white" || v === "o") {
        setPlayerColor("white");
        nextQuestion("first");
        return;
      }
    }
    if (step === "first") {
      if (v === "1" || v === "black") {
        setFirstTurn("black");
        nextQuestion("confirm");
        return;
      }
      if (v === "2" || v === "white") {
        setFirstTurn("white");
        nextQuestion("confirm");
        return;
      }
    }
    if (step === "confirm") {
      if (v === "y" || v === "yes" || v === "enter") {
        start();
        return;
      }
      if (v === "n" || v === "no") {
        nextQuestion("difficulty");
        return;
      }
    }
    push(
      `'${cmd}' is not recognized as an internal MaskPlay command.`,
      "Type 'help' to see available commands.",
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input || "enter";
    setInput("");
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
        const next = Math.min(history.length - 1, prev + 1);
        if (next === history.length - 1 && prev === next) {
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
      subtitle="MASKPLAY / OMOK SETUP"
      footer={
        <span>tip: Y + Enter 로 다음 단계 진행</span>
      }
    >
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 text-left">
        <div
          ref={logRef}
          className="min-h-0 flex-1 overflow-auto text-zinc-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {logs.map((line, idx) => (
            <p key={`${idx}-${line}`}>{line}</p>
          ))}
          <form onSubmit={onSubmit} className="mt-1 flex items-center gap-2">
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
              aria-label="cmd command input"
            />
          </form>
        </div>
      </div>
    </CmdFrame>
  );
}
