"use client";

import { CmdFrame } from "@/components/cmd/CmdFrame";
import { STAGE_BLUEPRINTS, STAGE_ORDER } from "@/features/bricks/stages";
import { useBricksSetupFromStorage } from "@/hooks/useBricksSetupFromStorage";
import type { BricksItemType, BricksStageId } from "@/types/bricks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Ball = { x: number; y: number; vx: number; vy: number; r: number };
type Brick = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  hp: number;
  hpMax: number;
  mode: "normal" | "item";
  itemType: BricksItemType | null;
  destroyed: boolean;
};

type RunStatus = "running" | "clearing" | "failed";

const WIDTH = 540;
const HEIGHT = 380;
const BASE_PADDLE_UNITS = 10;
const PADDLE_UNIT_PX = 12;
const PADDLE_H = 12;
const BALL_R = 6;
const GRID_STEP = 6;
const TICK_MS = 64;
const PADDLE_STEP = GRID_STEP * 2;
const BRICK_FONT_PX = 14;
const BRICK_CHAR_PX = 8; // monospace 기준 문자 1칸 폭 추정치

const COMMANDS = [
  "help",
  "status",
  "restart",
  "stage ls",
  "stage ps",
  "stage top",
  "stage grep",
  "stage netstat",
  "clear",
  "cls",
  "exit",
];

function pickWeighted(weights: Record<BricksItemType, number>): BricksItemType {
  const total = weights.WIDEBAR + weights.PLUSBALL + weights.FAST;
  let n = Math.random() * total;
  if (n < weights.WIDEBAR) return "WIDEBAR";
  n -= weights.WIDEBAR;
  if (n < weights.PLUSBALL) return "PLUSBALL";
  return "FAST";
}

function toGrid(value: number): number {
  return Math.round(value / GRID_STEP) * GRID_STEP;
}

function normalizeBallSpeed(ball: Ball, target = 12.8): Ball {
  const m = Math.hypot(ball.vx, ball.vy) || 1;
  const k = target / m;
  let vx = toGrid(ball.vx * k);
  let vy = toGrid(ball.vy * k);
  if (vx === 0) vx = ball.vx >= 0 ? GRID_STEP : -GRID_STEP;
  if (vy === 0) vy = ball.vy >= 0 ? GRID_STEP : -GRID_STEP;
  return { ...ball, vx, vy };
}

function speedTargetFor(fastLevel: number): number {
  return Math.min(24, 12.8 + fastLevel * 3.2);
}

function stageFromCommand(lower: string): BricksStageId | null {
  const m = lower.match(/^stage\s+([a-z0-9_-]+)$/);
  if (!m) return null;
  const id = m[1] as BricksStageId;
  return STAGE_ORDER.includes(id) ? id : null;
}

function phaseHpFor(text: string): number {
  return Math.max(1, text.length);
}

function phaseWidthFor(text: string): number {
  return Math.max(24, text.length * BRICK_CHAR_PX);
}

function applyProgressiveMask(text: string, damageCount: number): string {
  if (damageCount <= 0) return text;
  const chars = text.split("");
  let remaining = damageCount;
  for (let i = 0; i < chars.length; i++) {
    if (remaining <= 0) break;
    // Mask every visible token character (letters, digits, symbols), preserve spaces.
    if (chars[i] !== "_" && chars[i] !== " ") {
      chars[i] = "_";
      remaining -= 1;
    }
  }
  return chars.join("");
}

function CmdWorkDisguiseOverlay() {
  return (
    <div className="absolute inset-0 z-30 bg-black/95 font-mono text-[11px] leading-4 text-zinc-200">
      <div className="mb-2 flex items-center justify-between border-b border-zinc-700 pb-1 text-zinc-300">
        <span>C:\Windows\System32\cmd.exe</span>
        <span className="text-zinc-400">Ops Console / Internal</span>
      </div>
      <div className="space-y-1 overflow-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <p>C:\Users\employee&gt; cd reports\incident</p>
        <p>C:\Users\employee\reports\incident&gt; type summary.log</p>
        <p>[10:44:08] ingesting telemetry windows... done</p>
        <p>[10:44:11] parsing error burst segment... done</p>
        <p>[10:44:13] generating mitigation timeline... done</p>
        <p>[10:44:14] exporting incident_report_q1.txt ... done</p>
        <p>C:\Users\employee\reports\incident&gt; echo upload queued to team channel</p>
        <p>upload queued to team channel</p>
        <p className="pt-1 text-zinc-400">[ESC] return to MaskPlay CMD session</p>
      </div>
    </div>
  );
}

export function BricksPlayCmdClient() {
  const router = useRouter();
  const config = useBricksSetupFromStorage();
  const initialStage: BricksStageId = config?.stage ?? "ls";
  const [stage, setStage] = useState<BricksStageId>(initialStage);
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const [status, setStatus] = useState<RunStatus>("running");
  const [workDisguiseOpen, setWorkDisguiseOpen] = useState(false);
  const [hud, setHud] = useState({
    stageTitle: STAGE_BLUEPRINTS[initialStage].title,
    bricksLeft: 0,
    balls: 1,
    paddleW: BASE_PADDLE_UNITS * PADDLE_UNIT_PX,
    fastLevel: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const keysRef = useRef({ left: false, right: false });
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const bricksRef = useRef<Brick[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const paddleRef = useRef({
    x: WIDTH / 2 - (BASE_PADDLE_UNITS * PADDLE_UNIT_PX) / 2,
    w: BASE_PADDLE_UNITS * PADDLE_UNIT_PX,
    units: BASE_PADDLE_UNITS,
  });
  const itemStatsRef = useRef({ widebar: 0, plusball: 0, fast: 0 });
  const lockRef = useRef<RunStatus>("running");

  const stageInfo = useMemo(() => STAGE_BLUEPRINTS[stage], [stage]);

  useEffect(() => {
    const lines = [
      "MaskPlay CMD Brick Breaker boot complete.",
      `Loaded profile ${stage}: ${stageInfo.title}`,
      `Prompt: ${stageInfo.command}`,
      "Control: LEFT / RIGHT arrow to move paddle.",
      "Tip: Type 'help' for console commands.",
    ];
    setLogs(lines);
  }, [stage, stageInfo.title]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    if (workDisguiseOpen) return;
    inputRef.current?.focus();
  }, [logs, workDisguiseOpen]);

  const pushLog = (...lines: string[]) => {
    setLogs((prev) => [...prev, ...lines]);
  };

  const buildStage = (targetStage: BricksStageId) => {
    const bp = STAGE_BLUEPRINTS[targetStage];
    const rows = bp.outputRows;
    const rowTop = 54;
    const rowStep = 22;
    const baseX = 16;
    const tokenGap = 8;
    const brickH = 24;
    const maxY = HEIGHT - 74;

    const specialIndices = new Set<number>();
    const allTokenCount = rows.reduce((n, r) => n + r.length, 0);
    while (specialIndices.size < bp.specialCount && specialIndices.size < allTokenCount) {
      specialIndices.add(Math.floor(Math.random() * allTokenCount));
    }

    const out: Brick[] = [];
    let globalIndex = 0;
    let visualRow = 0;
    let stop = false;
    for (let row = 0; row < rows.length; row++) {
      if (stop) break;
      const tokens = rows[row] ?? [];
      let cursorX = baseX;
      for (let col = 0; col < tokens.length; col++) {
        const baseWord = (tokens[col] ?? "").toUpperCase();
        if (!baseWord) continue;
        const isSpecial = specialIndices.has(globalIndex);
        globalIndex += 1;
        const itemType = isSpecial ? pickWeighted(bp.itemWeights) : null;
        const textW = phaseWidthFor(baseWord);
        if (cursorX + textW > WIDTH - 12) {
          visualRow += 1;
          cursorX = baseX;
        }
        const yRaw = rowTop + visualRow * rowStep;
        if (yRaw > maxY) {
          stop = true;
          break;
        }
        const x = toGrid(Math.max(12, Math.min(WIDTH - textW - 12, cursorX)));
        const y = toGrid(yRaw);
        const brick: Brick = {
          id: `${targetStage}-${row}-${col}-${baseWord}`,
          x,
          y,
          w: textW,
          h: brickH,
          text: baseWord,
          hp: phaseHpFor(baseWord),
          hpMax: phaseHpFor(baseWord),
          mode: "normal",
          itemType,
          destroyed: false,
        };
        out.push(brick);
        cursorX += textW + tokenGap;
      }
      visualRow += 1;
    }
    bricksRef.current = out;

    ballsRef.current = [
      normalizeBallSpeed({
        x: WIDTH / 2,
        y: HEIGHT - 90,
        vx: Math.random() < 0.5 ? -GRID_STEP : GRID_STEP,
        vy: -GRID_STEP,
        r: BALL_R,
      }),
    ];

    paddleRef.current = {
      x: toGrid(WIDTH / 2 - (BASE_PADDLE_UNITS + itemStatsRef.current.widebar) * PADDLE_UNIT_PX / 2),
      w: (BASE_PADDLE_UNITS + itemStatsRef.current.widebar) * PADDLE_UNIT_PX,
      units: BASE_PADDLE_UNITS + itemStatsRef.current.widebar,
    };
    lastTickRef.current = performance.now();
    lockRef.current = "running";
    setStatus("running");
    setHud({
      stageTitle: bp.title,
      bricksLeft: out.length,
      balls: 1 + itemStatsRef.current.plusball,
      paddleW: paddleRef.current.w,
      fastLevel: itemStatsRef.current.fast,
    });
  };

  const applyItem = (itemType: BricksItemType) => {
    if (itemType === "WIDEBAR") {
      itemStatsRef.current.widebar += 1;
      paddleRef.current.units = Math.min(18, paddleRef.current.units + 1);
      paddleRef.current.w = paddleRef.current.units * PADDLE_UNIT_PX;
      pushLog(`[ITEM] WIDEBAR applied. Paddle token expanded to '${"=".repeat(paddleRef.current.units)}'.`);
      return;
    }
    if (itemType === "PLUSBALL") {
      const src = ballsRef.current[0];
      const base = src ?? {
        x: WIDTH / 2,
        y: HEIGHT - 120,
        vx: GRID_STEP,
        vy: -GRID_STEP,
        r: BALL_R,
      };
      ballsRef.current.push(
        normalizeBallSpeed({
          x: toGrid(base.x),
          y: toGrid(base.y),
          vx: toGrid(-base.vx + (Math.random() < 0.5 ? -GRID_STEP : GRID_STEP)),
          vy: base.vy,
          r: BALL_R,
        }),
      );
      itemStatsRef.current.plusball += 1;
      pushLog(`[ITEM] PLUSBALL applied. Active balls: ${ballsRef.current.length}.`);
      return;
    }
    itemStatsRef.current.fast += 1;
    const target = speedTargetFor(itemStatsRef.current.fast);
    ballsRef.current = ballsRef.current.map((ball) => normalizeBallSpeed(ball, target));
    pushLog(`[ITEM] FAST applied. Ball speed increased (level ${itemStatsRef.current.fast}).`);
  };

  useEffect(() => {
    buildStage(stage);
    pushLog(`[INFO] Profile ${stage} initialized with ${bricksRef.current.length} command tokens.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setWorkDisguiseOpen((v) => !v);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [workDisguiseOpen]);

  useEffect(() => {
    if (workDisguiseOpen) return;
    inputRef.current?.focus();
  }, [workDisguiseOpen]);

  useEffect(() => {
    if (!workDisguiseOpen) return;
    // Freeze paddle movement state while disguise overlay is open.
    keysRef.current.left = false;
    keysRef.current.right = false;
  }, [workDisguiseOpen]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (workDisguiseOpen) return;
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      const canStep = now - lastTickRef.current >= TICK_MS;
      if (canStep) lastTickRef.current = now;

      if (lockRef.current === "running" && canStep && !workDisguiseOpen) {
        const paddle = paddleRef.current;
        const move = keysRef.current.left ? -PADDLE_STEP : keysRef.current.right ? PADDLE_STEP : 0;
        paddle.x = toGrid(Math.max(10, Math.min(WIDTH - paddle.w - 10, paddle.x + move)));

        const nextBalls: Ball[] = [];
        const bricks = bricksRef.current;

        for (const ball0 of ballsRef.current) {
          let ball = { ...ball0 };
          const prevX = ball.x;
          const prevY = ball.y;
          ball.x = toGrid(ball.x + ball.vx);
          ball.y = toGrid(ball.y + ball.vy);

          if (ball.x - ball.r <= 0) {
            ball.x = ball.r;
            ball.vx *= -1;
          } else if (ball.x + ball.r >= WIDTH) {
            ball.x = WIDTH - ball.r;
            ball.vx *= -1;
          }
          if (ball.y - ball.r <= 0) {
            ball.y = ball.r;
            ball.vy *= -1;
          }

          const py = HEIGHT - 28;
          if (
            ball.y + ball.r >= py &&
            ball.y + ball.r <= py + PADDLE_H + 3 &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.w &&
            ball.vy > 0
          ) {
            const rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            ball.vx = toGrid(rel * (GRID_STEP * 2));
            ball.vy = -Math.abs(ball.vy);
            ball = normalizeBallSpeed(ball, speedTargetFor(itemStatsRef.current.fast));
          }

          let hitBrick = false;
          for (const brick of bricks) {
            if (brick.destroyed) continue;
            brick.w = phaseWidthFor(brick.text);
            const withinX = ball.x + ball.r >= brick.x && ball.x - ball.r <= brick.x + brick.w;
            const withinY = ball.y + ball.r >= brick.y && ball.y - ball.r <= brick.y + brick.h;
            if (!withinX || !withinY) continue;
            hitBrick = true;
            const prevWithinX = prevX + ball.r >= brick.x && prevX - ball.r <= brick.x + brick.w;
            const prevWithinY = prevY + ball.r >= brick.y && prevY - ball.r <= brick.y + brick.h;
            const overlapLeft = ball.x + ball.r - brick.x;
            const overlapRight = brick.x + brick.w - (ball.x - ball.r);
            const overlapTop = ball.y + ball.r - brick.y;
            const overlapBottom = brick.y + brick.h - (ball.y - ball.r);
            const minX = Math.min(overlapLeft, overlapRight);
            const minY = Math.min(overlapTop, overlapBottom);

            // Prefer the axis that entered collision first; fallback to minimum-overlap axis.
            const hitFromSide = !prevWithinX && prevWithinY ? true : !prevWithinY && prevWithinX ? false : minX < minY;
            if (hitFromSide) {
              ball.vx *= -1;
              if (overlapLeft < overlapRight) ball.x = toGrid(brick.x - ball.r - GRID_STEP);
              else ball.x = toGrid(brick.x + brick.w + ball.r + GRID_STEP);
            } else {
              ball.vy *= -1;
              if (overlapTop < overlapBottom) ball.y = toGrid(brick.y - ball.r - GRID_STEP);
              else ball.y = toGrid(brick.y + brick.h + ball.r + GRID_STEP);
            }
            brick.hp -= 1;
            if (brick.hp <= 0) {
              if (brick.mode === "normal" && brick.itemType) {
                // Spawn item block in-place after normal block is destroyed.
                brick.mode = "item";
                brick.text = brick.itemType;
                brick.hp = phaseHpFor(brick.text);
                brick.hpMax = brick.hp;
                brick.w = phaseWidthFor(brick.text);
                pushLog(`[WARN] Item block '${brick.itemType}' spawned.`);
              } else {
                brick.destroyed = true;
                if (brick.itemType && brick.mode === "item") {
                  applyItem(brick.itemType);
                }
              }
            }
            break;
          }

          if (!hitBrick && ball.y - ball.r > HEIGHT + 5) {
            continue;
          }
          if (ball.y - ball.r <= HEIGHT + 5) nextBalls.push(ball);
        }

        ballsRef.current = nextBalls;
        const aliveBricks = bricks.filter((b) => !b.destroyed).length;

        if (aliveBricks <= 0) {
          lockRef.current = "clearing";
          setStatus("clearing");
          pushLog("STAGE CLEAR.", "   *    +    x    .    o", "Opening result report...");
          window.setTimeout(() => {
            const q = new URLSearchParams({
              stage: String(stage),
              result: "clear",
              balls: String(ballsRef.current.length),
            });
            router.replace(`/games/bricks/result?${q.toString()}`);
          }, 400);
        } else if (ballsRef.current.length === 0) {
          lockRef.current = "failed";
          setStatus("failed");
          pushLog("ALL BALLS LOST.", "Type 'restart' to retry stage or 'exit' to leave.");
        }

        setHud({
          stageTitle: STAGE_BLUEPRINTS[stage].title,
          bricksLeft: aliveBricks,
          balls: ballsRef.current.length,
          paddleW: paddleRef.current.w,
          fastLevel: itemStatsRef.current.fast,
        });
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "#27272a";
      ctx.strokeRect(0.5, 0.5, WIDTH - 1, HEIGHT - 1);
      ctx.font = "600 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillStyle = "#a1a1aa";
      ctx.textBaseline = "top";
      ctx.fillText(`[ec2-user@mask-play ~]$ ${stageInfo.command}`, 12, 10);

      const bricks = bricksRef.current;
      ctx.font = `600 ${BRICK_FONT_PX}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textBaseline = "middle";
      for (const brick of bricks) {
        if (brick.destroyed) continue;
        const hpLoss = Math.max(0, brick.hpMax - brick.hp);
        const text = applyProgressiveMask(brick.text, hpLoss);
        const isItemPhase = brick.mode === "item";
        ctx.fillStyle = isItemPhase ? "#FF8C1A" : "#e4e4e7";
        ctx.fillText(text, brick.x, brick.y + brick.h / 2);
      }

      const paddle = paddleRef.current;
      ctx.fillStyle = "#d4d4d8";
      const py = HEIGHT - 28;
      ctx.font = "700 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.textBaseline = "middle";
      ctx.fillText("=".repeat(paddle.units), paddle.x, py + PADDLE_H / 2);

      for (const ball of ballsRef.current) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = "#a1a1aa";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [router, stage, workDisguiseOpen]);

  const restartCurrent = () => {
    itemStatsRef.current = { widebar: 0, plusball: 0, fast: 0 };
    buildStage(stage);
    pushLog("[INFO] Full restart executed.");
  };

  const goStage = (target: BricksStageId) => {
    itemStatsRef.current = { widebar: 0, plusball: 0, fast: 0 };
    setStage(target);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    setInput("");
    if (!cmd) return;
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    const lower = cmd.toLowerCase();
    pushLog(`C:\\mask_play\\bricks> ${cmd}`);

    if (lower === "help") {
      pushLog(
        "commands: help, status, restart, stage ls|ps|top|grep|netstat, clear/cls, exit",
      );
      return;
    }
    if (lower === "status") {
      pushLog(
        `[INFO] stage=${stage} bricksLeft=${hud.bricksLeft} balls=${hud.balls} paddleW=${Math.round(hud.paddleW)} fast=${hud.fastLevel} state=${status}`,
      );
      return;
    }
    if (lower === "restart") {
      restartCurrent();
      return;
    }
    if (status === "failed" && lower !== "restart" && lower !== "exit" && lower !== "cd ..") {
      pushLog("[ERR ] In failed state, use 'restart' or 'exit'.");
      return;
    }
    const stageCmd = stageFromCommand(lower);
    if (stageCmd) {
      goStage(stageCmd);
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
    pushLog(
      `'${cmd}' is not recognized as an internal MaskPlay command.`,
      "Type 'help' to see available commands.",
    );
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
      if (!q) return;
      const hit = COMMANDS.find((c) => c.startsWith(q));
      if (hit) setInput(hit);
    }
  };

  const holdMove = (dir: "left" | "right", pressed: boolean) => {
    if (dir === "left") keysRef.current.left = pressed;
    if (dir === "right") keysRef.current.right = pressed;
  };

  if (!config || config.skin !== "cmd") {
    return (
      <CmdFrame title="MaskPlay / Bricks" subtitle="NO SESSION">
        <div className="space-y-3">
          <p>설정 세션이 없습니다.</p>
          <Link href="/games/bricks/setup" className="underline underline-offset-2">:e setup.bricks</Link>
        </div>
      </CmdFrame>
    );
  }

  return (
    <CmdFrame
      title="C:\\mask_play\\bin\\bricks.exe"
      subtitle={`CMD MODE / STAGE ${stage}`}
      footer={<span>stage:{stage} bricks:{hud.bricksLeft} balls:{hud.balls} paddle:{Math.round(hud.paddleW)} status:{status}</span>}
    >
      <div className="relative flex min-h-0 flex-1 flex-col gap-2">
        <div className="text-xs text-zinc-300">
          <p>MaskPlay Brick Breaker Runtime v0.1.0</p>
          <p>Theme: {hud.stageTitle} | Profile: {stage}</p>
          <p>Command: {stageInfo.command}</p>
          <p>Control: ArrowLeft / ArrowRight | Command prompt for restart/stage/exit</p>
        </div>
        <div className="h-[380px] w-full max-w-[560px] shrink-0 self-start bg-black">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex w-full max-w-[560px] self-start gap-2 md:hidden">
          <button
            type="button"
            onPointerDown={() => holdMove("left", true)}
            onPointerUp={() => holdMove("left", false)}
            onPointerCancel={() => holdMove("left", false)}
            onPointerLeave={() => holdMove("left", false)}
            className="flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 active:bg-zinc-800"
            aria-label="move paddle left"
          >
            ◀ LEFT
          </button>
          <button
            type="button"
            onPointerDown={() => holdMove("right", true)}
            onPointerUp={() => holdMove("right", false)}
            onPointerCancel={() => holdMove("right", false)}
            onPointerLeave={() => holdMove("right", false)}
            className="flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 active:bg-zinc-800"
            aria-label="move paddle right"
          >
            RIGHT ▶
          </button>
        </div>
        {status === "failed" ? (
          <div className="flex w-full max-w-[560px] self-start gap-2 md:hidden">
            <button
              type="button"
              onClick={restartCurrent}
              className="flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 active:bg-zinc-800"
              aria-label="restart stage"
            >
              RESTART
            </button>
            <button
              type="button"
              onClick={() => router.push("/games/cmd")}
              className="flex-1 border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 active:bg-zinc-800"
              aria-label="exit game"
            >
              EXIT
            </button>
          </div>
        ) : null}
        <div className="flex min-h-14 h-48 flex-1 flex-col overflow-hidden whitespace-nowrap text-[11px] leading-4 text-zinc-300 sm:h-56 lg:h-64">
          <div
            ref={logRef}
            className="min-h-0 h-full overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {logs.map((line, idx) => (
              <p key={`${idx}-${line}`}>{line}</p>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-1 flex shrink-0 items-center gap-2 border-t border-zinc-800 pt-1 text-xs">
            <span className="text-zinc-300">C:\\mask_play\\bricks&gt;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="min-w-0 flex-1 bg-black text-zinc-100 outline-none"
              spellCheck={false}
              aria-label="bricks command input"
            />
          </form>
        </div>
        {workDisguiseOpen ? <CmdWorkDisguiseOverlay /> : null}
      </div>
    </CmdFrame>
  );
}

