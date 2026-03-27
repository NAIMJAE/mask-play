"use client";

import type { BricksSetupConfig } from "@/types/bricks";
import { getBricksSetupSnapshot } from "@/utils/bricksStorage";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useBricksSetupFromStorage(): BricksSetupConfig | null {
  return useSyncExternalStore(
    noopSubscribe,
    getBricksSetupSnapshot,
    (): BricksSetupConfig | null => null,
  );
}

