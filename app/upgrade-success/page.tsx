// app/upgrade-success/page.tsx
import { Suspense } from "react";
import UpgradeSuccessContent from "./UpgradeSuccessContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
