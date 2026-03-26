"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import { OmokBoardCmd } from "@/components/omok/OmokBoardCmd";
import { useOmokGame } from "@/hooks/useOmokGame";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";
import type { OmokSetupConfig } from "@/types/omok";
import { formatSheetCellRef } from "@/utils/sheetCellRef";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const PLAY_COMMANDS = ["help", "status", "restart", "exit", "clear", "cls", "ver", "dir", "whoami"];

function turnToStoneLabel(turn: "black" | "white"): string {
  return turn === "black" ? "BLACK (X)" : "WHITE (O)";
}

function CmdWorkDisguiseOverlay() {
  return (
    <div className="absolute inset-0 z-30 bg-black/95 font-mono text-[11px] leading-4 text-zinc-200">
      <div className="mb-2 flex items-center justify-between border-b border-zinc-700 pb-1 text-zinc-300">
        <span>C:\Windows\System32\cmd.exe</span>
        <span className="text-zinc-400">Ops Console / Internal</span>
      </div>
      <div className="space-y-1 whitespace-nowrap overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <p>C:\Users\employee&gt; whoami</p>
        <p>corp\kim.minji</p>
        <p>C:\Users\employee&gt; cd work\reports\q1</p>
        <p>C:\Users\employee\work\reports\q1&gt; python reconcile.py --source sales.csv --target summary.csv</p>
        <p>[09:14:02] loading source rows... done (12,840 rows)</p>
        <p>[09:14:04] validating schema... done</p>
        <p>[09:14:08] reconciling duplicate invoices... done</p>
        <p>[09:14:10] writing summary.csv ... done</p>
        <p>C:\Users\employee\work\reports\q1&gt; type summary.txt</p>
        <p>region=KR-SEOUL | target=1,250,000,000 | actual=1,286,430,000 | gap=+36,430,000</p>
        <p>region=KR-BUSAN | target=820,000,000 | actual=801,220,000 | gap=-18,780,000</p>
        <p>region=KR-DAEGU | target=640,000,000 | actual=662,110,000 | gap=+22,110,000</p>
        <p>C:\Users\employee\work\reports\q1&gt; echo Draft sent to finance channel.</p>
        <p>Draft sent to finance channel.</p>
        <p className="pt-1 text-zinc-400">[ESC] return to MaskPlay CMD session</p>
      </div>
    </div>
  );
}

function parseCoordInput(raw: string): { row: number; col: number } | null {
  const s = raw.trim().toUpperCase();
  const m = s.match(/^([A-Z])\s*(\d{1,2})$/);
  if (!m) return null;
  const col = m[1].charCodeAt(0) - 65;
  const row = Number(m[2]) - 1;
  if (col < 0 || col >= 15 || row < 0 || row >= 15) return null;
  return { row, col };
}

function resolveFocusRef(
  game: ReturnType<typeof useOmokGame>,
  playerColor: OmokSetupConfig["playerColor"],
): string {
  const aiStone = playerColor === "black" ? "white" : "black";
  const latestStone =
    game.status === "playing"
      ? game.currentTurn === "black"
        ? "white"
        : "black"
      : game.currentTurn;
  const latest =
    latestStone === playerColor
      ? game.lastMoves.human
      : latestStone === aiStone
        ? game.lastMoves.ai
        : game.lastMoves.human ?? game.lastMoves.ai;
  if (!latest) return "A1";
  return formatSheetCellRef(latest.row, latest.col);
}

function OmokPlayCmdInner({ config }: { config: OmokSetupConfig }) {
  const game = useOmokGame(config);
  const router = useRouter();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "[INFO] MaskPlay Omok Engine v0.1.2 boot completed; core runtime modules are loaded and the command session is now ready.",
    `[INFO] Session state is ACTIVE in CMD mode; selected AI difficulty profile is ${config.difficulty.toUpperCase()} for the current match instance.`,
    `[INFO] Player stone is ${config.playerColor.toUpperCase()} and CPU stone is ${game.aiStone.toUpperCase()}; board matrix is initialized as ${game.board.length}x${game.board.length}.`,
    "[INFO] Input mode is COMMAND; type coordinates like H8 or enter 'help' to print all available interactive commands.",
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevAiTurnRef = useRef(false);
  const prevAiMoveRef = useRef<string | null>(null);
  const prevHumanMoveRef = useRef<string | null>(null);
  const aiLogTimersRef = useRef<number[]>([]);
  const humanLogTimersRef = useRef<number[]>([]);
  const [focusRef, setFocusRef] = useState("A1");
  const [workDisguiseOpen, setWorkDisguiseOpen] = useState(false);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [logs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [logs]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setWorkDisguiseOpen((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (workDisguiseOpen) return;
    inputRef.current?.focus();
  }, [workDisguiseOpen]);

  useEffect(() => {
    setFocusRef(resolveFocusRef(game, config.playerColor));
  }, [config.playerColor, game]);

  useEffect(() => {
    return () => {
      aiLogTimersRef.current.forEach((id) => window.clearTimeout(id));
      aiLogTimersRef.current = [];
      humanLogTimersRef.current.forEach((id) => window.clearTimeout(id));
      humanLogTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const aiTurn = game.status === "playing" && game.currentTurn === game.aiStone;
    if (aiTurn && !prevAiTurnRef.current) {
      prevAiTurnRef.current = aiTurn;
      const thinkingMs = game.aiThinking.delayMs;
      const estimateSec = (thinkingMs / 1000).toFixed(2);
      setLogs((prev) => [
        ...prev,
        `[AI  ] CPU turn started; randomized think delay selected as approximately ${estimateSec}s before move commit.`,
      ]);

      const t1 = window.setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          "[AI  ] Building tactical candidate set from current frontier cells and evaluating immediate threat-response chains.",
        ]);
      }, Math.max(120, Math.floor(thinkingMs * 0.35)));
      const t2 = window.setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          "[AI  ] Final alpha-beta pruning pass in progress; stabilizing principal variation before emitting selected coordinate.",
        ]);
      }, Math.max(220, Math.floor(thinkingMs * 0.75)));
      aiLogTimersRef.current = [t1, t2];

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        aiLogTimersRef.current = [];
      };
    }
    prevAiTurnRef.current = aiTurn;
  }, [game.aiStone, game.aiThinking.delayMs, game.currentTurn, game.status]);

  useEffect(() => {
    const move = game.lastMoves.ai;
    if (!move) return;
    const ref = formatSheetCellRef(move.row, move.col);
    if (prevAiMoveRef.current === ref) return;
    prevAiMoveRef.current = ref;
    const t = window.setTimeout(() => {
      setLogs((prev) => [...prev, `[MOVE] CPU placed stone at ${ref}`]);
      setFocusRef(ref);
    }, 0);
    return () => clearTimeout(t);
  }, [game.lastMoves.ai]);

  useEffect(() => {
    const move = game.lastMoves.human;
    if (!move) return;
    const ref = formatSheetCellRef(move.row, move.col);
    if (prevHumanMoveRef.current === ref) return;
    prevHumanMoveRef.current = ref;
    const t1 = window.setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[MOVE] Player coordinate command accepted and parsed successfully for target cell ${ref}.`,
      ]);
      setFocusRef(ref);
    }, 120);
    const t2 = window.setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[OK  ] ${config.playerColor.toUpperCase()} stone placement has been committed to ${ref} and game state synchronization is complete.`,
      ]);
    }, 360);
    humanLogTimersRef.current = [t1, t2];
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      humanLogTimersRef.current = [];
    };
  }, [config.playerColor, game.lastMoves.human]);

  useEffect(() => {
    if (game.status === "playing") return;
    const turns = game.board.reduce(
      (acc, row) => acc + row.reduce((n, cell) => n + (cell ? 1 : 0), 0),
      0,
    );
    sessionStorage.setItem("maskplay:omok:last-turns", String(turns));
    const q = new URLSearchParams({ outcome: game.status });
    router.replace(`/games/omok/result?${q.toString()}`);
  }, [game.board, game.status, router]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setInput("");
    if (!cmd) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setLogs((prev) => [...prev, `C:\\mask_play\\omok> ${cmd}`]);

    if (cmd === "help") {
      setLogs((prev) => [
        ...prev,
        "commands: help, status, restart, exit, clear/cls, ver, dir, whoami | coordinate input: A1~O15 (example: H8, K12)",
      ]);
      return;
    }
    if (cmd === "status") {
      setLogs((prev) => [
        ...prev,
        `[INFO] Current focus cell is ${focusRef}; active turn is ${game.currentTurn.toUpperCase()}; game result state is currently '${game.status}'.`,
      ]);
      return;
    }
    if (cmd === "restart") {
      setLogs((prev) => [...prev, "[INFO] Restart command received; resetting board matrix, move history, and active turn sequencing for a fresh session."]);
      game.restart();
      return;
    }
    if (cmd === "exit" || cmd === "home" || cmd === "cd ..") {
      setLogs((prev) => [...prev, "[INFO] Session termination command received from user input; returning to home route and closing current play context."]);
      router.push("/");
      return;
    }
    if (cmd === "clear" || cmd === "cls") {
      setLogs([]);
      return;
    }
    if (cmd === "ver") {
      setLogs((prev) => [...prev, "MaskPlay Omok Runtime Version 0.1.2 (build channel: cmd-skin interactive session; compatibility profile: web worker AI enabled)."]);
      return;
    }
    if (cmd === "whoami") {
      setLogs((prev) => [...prev, "maskplay-user (interactive local session identity; permissions: standard gameplay command set)."]);
      return;
    }
    if (cmd === "dir") {
      setLogs((prev) => [
        ...prev,
        " Directory of C:\\mask_play\\omok (virtual command listing for immersive terminal UX)",
        "omok-core.dll",
        "session.tmp",
        "engine.ai",
      ]);
      return;
    }
    const coord = parseCoordInput(cmd);
    if (coord) {
      if (game.currentTurn !== config.playerColor || game.status !== "playing") {
        setLogs((prev) => [
          ...prev,
          "[ERR ] Move request rejected because the active turn owner does not match the player side at this moment.",
        ]);
      } else {
        game.humanMove(coord.row, coord.col);
        setLogs((prev) => [
          ...prev,
          `[MOVE] Coordinate input '${cmd.toUpperCase()}' has been accepted and forwarded to the Omok engine for validation and commit.`,
        ]);
      }
      return;
    }
    setLogs((prev) => [
      ...prev,
      `'${cmd}' is not recognized as an internal MaskPlay command.`,
      "Type 'help' to display a detailed list of available commands and coordinate input examples.",
    ]);
  };

  const onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
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
      const hit = PLAY_COMMANDS.find((c) => c.startsWith(q));
      if (hit) setInput(hit);
      return;
    }
  };

  return (
    <CmdFrame
      title="C:\\mask_play\\bin\\omok.exe"
      subtitle={`CMD MODE / ${config.difficulty.toUpperCase()}`}
      footer={
        <span>-- ACTIVE -- focus:{focusRef} turn:{turnToStoneLabel(game.currentTurn)} mode:command_input player:{config.playerColor.toUpperCase()} cpu:{game.aiStone.toUpperCase()}</span>
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-col gap-2">
        <div className="text-xs text-zinc-300">
          <p>MaskPlay Omok Engine v0.1.2</p>
          <p>Session: ACTIVE | Mode: CMD | Difficulty: {config.difficulty.toUpperCase()}</p>
          <p>Player: {config.playerColor.toUpperCase()} | CPU: {game.aiStone.toUpperCase()} | Board: {game.board.length}x{game.board.length}</p>
          <p className="text-zinc-400">
            Input Mode: COMMAND | Focus: {focusRef} | Turn: {turnToStoneLabel(game.currentTurn)}
          </p>
        </div>
        <OmokBoardCmd
          board={game.board}
          currentTurn={game.currentTurn}
          humanStone={config.playerColor}
          status={game.status}
          lastMoves={game.lastMoves}
        />
        <div className="flex min-h-14 h-52 flex-1 flex-col overflow-hidden whitespace-nowrap text-[11px] leading-4 text-zinc-300 sm:h-60 lg:h-72">
          <div
            ref={logRef}
            className="min-h-0 h-full overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {logs.map((line, idx) => (
              <p key={`${idx}-${line}`} className="leading-4">
                {line}
              </p>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-1 flex shrink-0 items-center gap-2 border-t border-zinc-800 pt-1 text-xs">
            <span className="text-zinc-300">C:\\mask_play\\omok&gt;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="min-w-0 flex-1 bg-black text-zinc-100 outline-none"
              spellCheck={false}
              aria-label="play command input"
            />
          </form>
        </div>
        {workDisguiseOpen ? <CmdWorkDisguiseOverlay /> : null}
      </div>
    </CmdFrame>
  );
}

export function OmokPlayCmdClient() {
  const config = useOmokSetupFromStorage();

  if (!config || config.skin !== "cmd") {
    return (
      <CmdFrame title="MaskPlay / Omok" subtitle="NO SESSION">
        <div className="space-y-3">
          <p>설정 세션이 없습니다.</p>
          <Link href="/games/omok/setup?skin=cmd" className="underline underline-offset-2">:e setup.cmd</Link>
        </div>
      </CmdFrame>
    );
  }

  return <OmokPlayCmdInner key={JSON.stringify(config)} config={config} />;
}
