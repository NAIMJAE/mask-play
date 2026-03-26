import { OmokSetupForm } from "@/components/omok/OmokSetupForm";
import { Suspense } from "react";

function SetupFallback() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">
      setup 불러오는 중...
    </div>
  );
}

export default function OmokSetupPage() {
  return (
    <main className="box-border flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<SetupFallback />}>
        <OmokSetupForm />
      </Suspense>
    </main>
  );
}
