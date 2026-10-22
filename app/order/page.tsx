import type { Metadata } from "next";
import { Suspense } from "react";
import OrderFlow from "@/components/order/OrderFlow";

export const metadata: Metadata = {
  title: "Order online",
  description: "Choose your XPENG, compare cash, finance and lease, and reserve online.",
};

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100svh" }} />}>
      <OrderFlow />
    </Suspense>
  );
}
