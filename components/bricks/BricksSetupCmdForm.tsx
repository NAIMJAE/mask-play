"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import { STAGE_ORDER } from "@/features/bricks/stages";
import type { BricksSetupConfig, BricksStageId } from "@/types/bricks";
import { saveBricksSetup } from "@/utils/bricksStorage";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const HELP_LINES = [
  "Available commands:",
  "  help",
  "  set stage ls|ps|top|grep|netstat",
  "  ls | ps | top | grep | netstat",
  "  run ls|ps|top|grep|netstat",
  "  ls run  (same as run ls)",
  "  status",
  "  run",
  "  clear | cls",
  "  exit",
];

const COMPLETIONS = [
  "help",
  "set stage ls",
  "set stage ps",
  "set stage top",
  "set stage grep",
  "set stage netstat",
  "ls",
  "ps",
  "top",
  "grep",
  "netstat",
  "run ls",
  "run ps",
  "run top",
  "run grep",
  "run netstat",
  "ls run",
  "ps run",
  "top run",
  "grep run",
  "netstat run",
  "status",
  "run",
  "clear",
  "cls",
  "exit",
];

export function BricksSetupCmdForm() {
  const router = useRouter();
  const [stage, setStage] = useState<BricksStageId>("ls");
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "Microsoft Windows [Version 10.0.26200.7840]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "C:\\Users\\dev> cd workspace\\mask_play",
    "C:\\Users\\dev\\workspace\\mask_play> maskplay --skin cmd --game bricks",
    "",
    "Initializing MaskPlay Runtime...",
    "Loading brick breaker module .. OK",
    "Loading cmd skin .............. OK",
    "Mounting game setup ........... OK",
    "",
    "MaskPlay CMD Setup Wizard ready.",
    "Select stage [ls|ps|top|grep|netstat], then type 'run'.",
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    inputRef.current?.focus();
  }, [logs]);

  const push = (...lines: string[]) => {
    setLogs((prev) => [...prev, ...lines]);
  };

  const start = () => {
    const config: BricksSetupConfig = {
      skin: "cmd",
      stage,
    };
    saveBricksSetup(config);
    router.push("/games/bricks/play");
  };

  const isStageId = (value: string): value is BricksStageId => {
    return STAGE_ORDER.includes(value as BricksStageId);
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    push(`C:\\mask_play\\bricks> ${cmd}`);
    const lower = cmd.toLowerCase();
    const parts = lower.split(/\s+/);

    if (lower === "help") {
      push(...HELP_LINES);
      return;
    }
    if (lower === "status") {
      push(`stage: ${stage}`, "type 'run' to start");
      return;
    }
    if (lower === "run") {
      start();
      return;
    }
    if (parts[0] === "run" && parts[1] && isStageId(parts[1])) {
      setStage(parts[1]);
      push(`Stage set to ${parts[1]}.`, `Launching profile '${parts[1]}'...`);
      const config: BricksSetupConfig = {
        skin: "cmd",
        stage: parts[1],
      };
      saveBricksSetup(config);
      router.push("/games/bricks/play");
      return;
    }
    if (lower === "clear" || lower === "cls") {
      setLogs([]);
      return;
    }
    if (lower === "exit" || lower === "cd ..") {
      router.push("/games/cmd");
      return;
    }
    if (parts[0] === "set" && parts[1] === "stage" && parts[2]) {
      const next = parts[2] as BricksStageId;
      if (isStageId(next)) {
        setStage(next);
        push(`Stage set to ${next}.`);
        return;
      }
      push("Invalid stage id. allowed: ls, ps, top, grep, netstat");
      return;
    }
    if (parts[1] === "run" && isStageId(parts[0] ?? "")) {
      const next = parts[0] as BricksStageId;
      setStage(next);
      push(`Stage set to ${next}.`, `Launching profile '${next}'...`);
      const config: BricksSetupConfig = {
        skin: "cmd",
        stage: next,
      };
      saveBricksSetup(config);
      router.push("/games/bricks/play");
      return;
    }
    if (isStageId(lower)) {
      setStage(lower);
      push(`Stage set to ${lower}.`, "Type 'run' to start.");
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
      subtitle="MASKPLAY / BRICKS SETUP"
      footer={<span>current stage: {stage} | command: set stage [id] | run</span>}
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
          <span className="text-zinc-300">C:\\mask_play\\bricks&gt;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            onBlur={() => inputRef.current?.focus()}
            className="min-w-0 flex-1 bg-black text-zinc-100 outline-none"
            spellCheck={false}
            aria-label="bricks setup input"
          />
        </form>
      </div>
    </CmdFrame>
  );
}

