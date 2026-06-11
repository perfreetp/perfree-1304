import { useState, useRef } from "react";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
import { useAppStore } from "@/store";
import { uid } from "@/lib/utils";
import type { FinanceRecord, StorageOrder } from "@/types";
import ScanHeader from "@/components/checkout/ScanHeader";
import OrderDetailCard from "@/components/checkout/OrderDetailCard";
import PaymentPanel from "@/components/checkout/PaymentPanel";
import OrderSearchSection from "@/components/checkout/OrderSearchSection";
import OrderDetailDrawer from "@/components/OrderDetailDrawer";

export default function CheckOut() {
  const orders = useAppStore((s) => s.orders);
  const currentUser = useAppStore((s) => s.currentUser);

  const [scanValue, setScanValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<StorageOrder | null>(orders[0] || null);
  const [isPicking, setIsPicking] = useState(false);
  const [pickupDone, setPickupDone] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
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
    setPickupDone(false);
    setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleConfirmPickup = () => {
    if (!selectedOrder) return;

    if (selectedOrder.status === "picked") {
      setPickupDone(true);
      return;
    }
    if (isPicking) return;

    setIsPicking(true);

    try {
      const order = selectedOrder;
      const now = Date.now();
      const refTime = order.estimatedPickupAt
        ? new Date(order.estimatedPickupAt).getTime()
        : new Date(order.checkedInAt).getTime();
      const overtimeMinutes = Math.max(0, Math.floor((now - refTime) / 60000));
      const additionalOvertimeFee = overtimeMinutes > 0 ? Math.ceil(overtimeMinutes / 30) * 5 : 0;

      const newTotalFee = order.baseFee + order.overtimeFee + additionalOvertimeFee + order.insuranceFee - order.discount;
      const unpaid = Math.max(0, newTotalFee - order.paidAmount);

      const records: FinanceRecord[] = [];
      if (unpaid > 0) {
        records.push({
          id: uid("fin"),
          orderId: order.id,
          orderNo: order.orderNo,
          zoneId: order.zoneId,
          type: "overtime_fee",
          amount: unpaid,
          direction: "income",
          method: "wechat",
          operatorId: currentUser?.id || "",
          happenedAt: new Date().toISOString(),
          remark: `超时${overtimeMinutes}分钟补收`,
        });
      }

      useAppStore.getState().checkOutOrder(order.id, additionalOvertimeFee, records);

      const updated = useAppStore.getState().orders.find((o) => o.id === order.id);
      if (updated) {
        setSelectedOrder(updated);
      }
      setPickupDone(true);
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
          {selectedOrder && (
            <button
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mb-2"
              onClick={() => { setDetailOrderId(selectedOrder.id); setDetailOpen(true); }}
            >查看完整详情</button>
          )}
          <OrderDetailCard order={selectedOrder} />
        </div>
        <div className="lg:col-span-2" ref={paymentPanelRef}>
          {pickupDone && selectedOrder?.status === "picked" ? (
            <div className="bg-white rounded-xl shadow-card p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <div className="text-lg font-bold text-navy-900 mb-1">取件完成</div>
              <div className="text-sm text-slate-500 mb-4">订单 {selectedOrder.orderNo} 已完成，柜位已释放</div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">订单总额</div>
                  <div className="font-bold text-navy-800">¥{selectedOrder.totalFee}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">已收金额</div>
                  <div className="font-bold text-emerald-700">¥{selectedOrder.paidAmount}</div>
                </div>
              </div>
              {selectedOrder.totalFee - selectedOrder.paidAmount > 0 ? (
                <div className="text-xs text-rose-600 bg-rose-50 rounded-lg p-2 mb-3">
                  待付差额 ¥{selectedOrder.totalFee - selectedOrder.paidAmount}
                </div>
              ) : (
                <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2 mb-3">
                  费用已结清
                </div>
              )}
              <button onClick={() => { setSelectedOrder(null); setPickupDone(false); }} className="btn-secondary w-full">
                返回
              </button>
            </div>
          ) : (
            <PaymentPanel order={selectedOrder} onConfirm={handleConfirmPickup} />
          )}
        </div>
      </div>

      <OrderSearchSection
        onSelect={handleSelectOrder}
        selectedId={selectedOrder?.id || null}
      />

      <OrderDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        orderId={detailOrderId}
      />
    </div>
  );
}
