import { OmokResultClient } from "@/components/omok/OmokResultClient";
import { Suspense } from "react";

function ResultFallback() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-sm text-gray-600">
      결과 불러오는 중…
    </div>
  );
}

export default function OmokResultPage() {
  return (
    <main className="box-border flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<ResultFallback />}>
        <OmokResultClient />
      </Suspense>
    </main>
  );
}
