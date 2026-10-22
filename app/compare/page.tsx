import type { Metadata } from "next";
import { Suspense } from "react";
import CompareTool from "@/components/compare/CompareTool";

export const metadata: Metadata = {
  title: "Compare models",
  description: "Compare the XPENG New X9 and G6 variants side by side: price, range, performance, charging and space.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100svh" }} />}>
      <CompareTool />
    </Suspense>
  );
}
