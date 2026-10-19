import { Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import ReportsClient from "./ReportsClient";

export default function ReportsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading live analytics...</div>}>
        <ReportsClient />
      </Suspense>
    </AppLayout>
  );
}
