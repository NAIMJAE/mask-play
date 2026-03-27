import { BricksResultCmdClient } from "@/components/bricks/BricksResultCmdClient";
import { Suspense } from "react";

function ResultFallback() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">
      result 불러오는 중...
    </div>
  );
}

export default function BricksResultPage() {
  return (
    <main className="box-border flex min-h-0 flex-1 flex-col overflow-hidden text-gray-900">
      <Suspense fallback={<ResultFallback />}>
        <BricksResultCmdClient />
      </Suspense>
    </main>
  );
}

