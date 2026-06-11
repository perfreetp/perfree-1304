import { useState, useRef } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/store";
import type { FinanceRecord, StorageOrder } from "@/types";
import ScanHeader from "@/components/checkout/ScanHeader";
import OrderDetailCard from "@/components/checkout/OrderDetailCard";
import PaymentPanel from "@/components/checkout/PaymentPanel";
import OrderSearchSection from "@/components/checkout/OrderSearchSection";

export default function CheckOut() {
  const orders = useAppStore((s) => s.orders);
  const currentUser = useAppStore((s) => s.currentUser);

  const [scanValue, setScanValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<StorageOrder | null>(orders[0] || null);
  const [isPicking, setIsPicking] = useState(false);
  const paymentPanelRef = useRef<HTMLDivElement>(null);

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
      handleSelectOrder(found);
    } else {
      setSelectedOrder(null);
    }
  };

  const handleSelectOrder = (o: StorageOrder) => {
    setSelectedOrder(o);
    setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleConfirmPickup = () => {
    if (!selectedOrder || selectedOrder.status === "picked" || isPicking) return;

    const order = selectedOrder;
    setIsPicking(true);

    try {
      const now = Date.now();
      const refTime = order.estimatedPickupAt
        ? new Date(order.estimatedPickupAt).getTime()
        : new Date(order.checkedInAt).getTime();
      const overtimeMinutes = Math.max(0, Math.floor((now - refTime) / 60000));
      const liveOvertimeFee =
        order.overtimeFee + (overtimeMinutes > 0 ? Math.ceil(overtimeMinutes / 30) * 5 : 0);

      const totalExpected = order.baseFee + liveOvertimeFee + order.insuranceFee - order.discount;
      const unpaid = Math.max(0, totalExpected - order.paidAmount);

      const records: FinanceRecord[] = [];
      if (unpaid > 0) {
        records.push({
          id: `FR-${Date.now()}`,
          orderId: order.id,
          orderNo: order.orderNo,
          zoneId: order.zoneId,
          type: "overtime_fee",
          amount: unpaid,
          direction: "income",
          method: "wechat",
          operatorId: currentUser?.id || "",
          happenedAt: new Date().toISOString(),
        });
      }

      const additionalOvertimeFee = Math.max(0, liveOvertimeFee - order.overtimeFee);
      useAppStore.getState().checkOutOrder(order.id, additionalOvertimeFee, records);

      const updated = useAppStore.getState().orders.find((o) => o.id === order.id);
      if (updated) {
        setSelectedOrder(updated);
      }

      alert("取件成功！柜位已释放");
    } finally {
      setIsPicking(false);
    }
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
        <div className="lg:col-span-2" ref={paymentPanelRef}>
          <PaymentPanel order={selectedOrder} onConfirm={handleConfirmPickup} />
        </div>
      </div>

      <OrderSearchSection
        onSelect={handleSelectOrder}
        selectedId={selectedOrder?.id || null}
      />
    </div>
  );
}
