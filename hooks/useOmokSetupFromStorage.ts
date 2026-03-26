"use client";

import { getOmokSetupSnapshot } from "@/utils/omokStorage";
import type { OmokSetupConfig } from "@/types/omok";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useOmokSetupFromStorage(): OmokSetupConfig | null {
  return useSyncExternalStore(
    noopSubscribe,
    getOmokSetupSnapshot,
    (): OmokSetupConfig | null => null,
  );
}
