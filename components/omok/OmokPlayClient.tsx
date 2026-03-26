"use client";

import { OmokPlayCmdClient } from "@/components/omok/OmokPlayCmdClient";
import { OmokPlayExcelClient } from "@/components/omok/OmokPlayExcelClient";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";

export function OmokPlayClient() {
  const config = useOmokSetupFromStorage();
  if (config?.skin === "cmd") return <OmokPlayCmdClient />;
  return <OmokPlayExcelClient />;
}
