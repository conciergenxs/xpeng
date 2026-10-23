import type { Metadata } from "next";
import { Suspense } from "react";
import OrderFlow from "@/components/order/OrderFlow";

export const metadata: Metadata = {
  title: "Pesan online",
  description: "Pilih XPENG Anda, timbang tunai, kredit, atau sewa, lalu reservasi langsung dari rumah.",
};

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100svh" }} />}>
      <OrderFlow />
    </Suspense>
  );
}
