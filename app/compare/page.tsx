import type { Metadata } from "next";
import { Suspense } from "react";
import CompareTool from "@/components/compare/CompareTool";

export const metadata: Metadata = {
  title: "Bandingkan model",
  description: "Bandingkan varian XPENG New X9 dan G6 Pro berdampingan: harga, jarak tempuh, performa, pengisian daya, dan ruang.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100svh" }} />}>
      <CompareTool />
    </Suspense>
  );
}
