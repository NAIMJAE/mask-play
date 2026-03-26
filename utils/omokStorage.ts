import type { OmokSetupConfig } from "@/types/omok";

const SETUP_KEY = "maskplay:omok:setup";

let cachedRaw: string | null | undefined;
let cachedConfig: OmokSetupConfig | null = null;

function parseRaw(raw: string | null): OmokSetupConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OmokSetupConfig> | null;
    if (!parsed) return null;
    if (
      (parsed.difficulty !== "easy" &&
        parsed.difficulty !== "normal" &&
        parsed.difficulty !== "hard") ||
      (parsed.playerColor !== "black" && parsed.playerColor !== "white") ||
      (parsed.firstTurn !== "black" && parsed.firstTurn !== "white")
    ) {
      return null;
    }
    return {
      difficulty: parsed.difficulty,
      playerColor: parsed.playerColor,
      firstTurn: parsed.firstTurn,
      skin: parsed.skin === "cmd" ? "cmd" : "excel",
    };
  } catch {
    return null;
  }
}

/**
 * sessionStorage와 동기화된 스냅샷. 같은 raw 문자열이면 동일 객체 참조를 유지합니다.
 */
export function getOmokSetupSnapshot(): OmokSetupConfig | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SETUP_KEY);
  if (raw === cachedRaw) return cachedConfig;
  cachedRaw = raw;
  cachedConfig = parseRaw(raw);
  return cachedConfig;
}

export function saveOmokSetup(config: OmokSetupConfig): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(config);
  sessionStorage.setItem(SETUP_KEY, raw);
  cachedRaw = raw;
  cachedConfig = config;
}

export function loadOmokSetup(): OmokSetupConfig | null {
  return getOmokSetupSnapshot();
}
