"use client";

import { OmokResultCmdClient } from "@/components/omok/OmokResultCmdClient";
import { OmokResultExcelClient } from "@/components/omok/OmokResultExcelClient";
import { useOmokSetupFromStorage } from "@/hooks/useOmokSetupFromStorage";

export function OmokResultClient() {
  const setup = useOmokSetupFromStorage();
  if (setup?.skin === "cmd") return <OmokResultCmdClient />;
  return <OmokResultExcelClient />;
}
