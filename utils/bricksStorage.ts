import type { BricksSetupConfig, BricksStageId } from "@/types/bricks";
import { STAGE_ORDER } from "@/features/bricks/stages";

const SETUP_KEY = "maskplay:bricks:setup";

let cachedRaw: string | null | undefined;
let cachedConfig: BricksSetupConfig | null = null;

function parseRaw(raw: string | null): BricksSetupConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { skin?: unknown; stage?: unknown } | null;
    if (!parsed) return null;
    if (parsed.skin !== "cmd") {
      return null;
    }
    let stage: BricksStageId | null = null;
    if (typeof parsed.stage === "string") {
      const s = parsed.stage.toLowerCase() as BricksStageId;
      stage = STAGE_ORDER.includes(s) ? s : null;
    }
    // Backward compatibility for old numeric stage values.
    if (parsed.stage === 1) stage = "ls";
    if (parsed.stage === 2) stage = "ps";
    if (parsed.stage === 3) stage = "top";
    if (parsed.stage === 4) stage = "grep";
    if (parsed.stage === 5) stage = "netstat";
    if (!stage || !STAGE_ORDER.includes(stage)) return null;
    return {
      skin: "cmd",
      stage,
    };
  } catch {
    return null;
  }
}

export function getBricksSetupSnapshot(): BricksSetupConfig | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SETUP_KEY);
  if (raw === cachedRaw) return cachedConfig;
  cachedRaw = raw;
  cachedConfig = parseRaw(raw);
  return cachedConfig;
}

export function saveBricksSetup(config: BricksSetupConfig): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(config);
  sessionStorage.setItem(SETUP_KEY, raw);
  cachedRaw = raw;
  cachedConfig = config;
}

