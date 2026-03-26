"use client";

import { OmokSetupCmdForm } from "@/components/omok/OmokSetupCmdForm";
import { OmokSetupExcelForm } from "@/components/omok/OmokSetupExcelForm";
import { useSearchParams } from "next/navigation";

export function OmokSetupForm() {
  const search = useSearchParams();
  const skin = search.get("skin");
  if (skin === "cmd") return <OmokSetupCmdForm />;
  return <OmokSetupExcelForm />;
}
