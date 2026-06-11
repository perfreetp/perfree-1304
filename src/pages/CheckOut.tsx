import { useState } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/store";
import type { StorageOrder } from "@/types";
import ScanHeader from "@/components/checkout/ScanHeader";
import OrderDetailCard from "@/components/checkout/OrderDetailCard";
import PaymentPanel from "@/components/checkout/PaymentPanel";
import OrderSearchSection from "@/components/checkout/OrderSearchSection";

export default function CheckOut() {
  const orders = useAppStore((s) => s.orders);

  const [scanValue, setScanValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<StorageOrder | null>(orders[0] || null);

  const handleSearch = () => {
    const v = scanValue.trim().toLowerCase();
    if (!v) return;
    const found = orders.find(
      (o) =>
        o.orderNo.toLowerCase().includes(v) ||
        o.customerPhone.includes(v) ||
        o.id.toLowerCase() === v
    );
    if (found) {
      setSelectedOrder(found);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleConfirmPickup = () => {
    if (!selectedOrder) return;
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">
            订单核销与取件
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {format(new Date(), "yyyy年MM月dd日 EEEE")} · 扫码核销订单，完成取件流程
          </p>
        </div>
      </div>

      <ScanHeader
        scanValue={scanValue}
        setScanValue={setScanValue}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <OrderDetailCard order={selectedOrder} />
        </div>
        <div className="lg:col-span-2">
          <PaymentPanel order={selectedOrder} onConfirm={handleConfirmPickup} />
        </div>
      </div>

      <OrderSearchSection
        onSelect={(o) => setSelectedOrder(o)}
        selectedId={selectedOrder?.id || null}
      />
    </div>
  );
}
