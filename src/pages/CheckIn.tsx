import { useMemo, useState } from "react";
import { format } from "date-fns";
import { RotateCcw, Save, PackageCheck } from "lucide-react";
import { useAppStore } from "@/store";
import type {
  LockerSize,
  LuggageType,
  StorageOrder,
  FinanceRecord,
  LuggageItem,
  PaymentMethod,
} from "@/types";
import QuickForm, { CustomerType, CheckInForm } from "@/components/checkin/QuickForm";
import LockerAllocator from "@/components/checkin/LockerAllocator";
import {
  LabelPreview,
  PhotoCapture,
  FeeBreakdown,
} from "@/components/checkin/RightPanels";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export default function CheckIn() {
  const [customerType, setCustomerType] = useState<CustomerType>("individual");
  const [form, setForm] = useState<CheckInForm>({
    name: "",
    phone: "",
    luggageType: "suitcase" as LuggageType,
    size: "M" as LockerSize,
    color: "黑色",
    description: "",
    insurance: 0,
    estimatedPickup: "",
    groupCount: 1,
  });
  const [selectedLockerIds, setSelectedLockerIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeZone = useAppStore((s) => s.zones.find((z) => z.id === s.activeZoneId));
  const lockers = useAppStore((s) => s.lockers);
  const currentUser = useAppStore((s) => s.currentUser);
  const selectedLockers = lockers.filter((l) => selectedLockerIds.includes(l.id));

  const orderNo = useMemo(() => {
    const d = new Date();
    return (
      "LC" +
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") +
      String(Math.floor(Math.random() * 9000) + 1000)
    );
  }, []);

  const pricing = activeZone?.pricingRule;
  const baseFee = useMemo(() => {
    if (!pricing) return 0;
    const sizeExtraMap = {
      S: pricing.smallLockerExtra,
      M: pricing.mediumLockerExtra,
      L: pricing.largeLockerExtra,
    };
    const perLocker = pricing.firstHourPrice + (sizeExtraMap[form.size] || 0);
    const count = customerType === "group" ? form.groupCount : 1;
    let total = perLocker * count;
    if (customerType === "group" && count >= 4) total *= 0.8;
    return Math.round(total);
  }, [pricing, form.size, customerType, form.groupCount]);

  const insuranceFee = useMemo(() => {
    if (!activeZone) return 0;
    return Math.round(form.insurance * activeZone.insuranceRate);
  }, [activeZone, form.insurance]);

  const discount =
    customerType === "group" && form.groupCount >= 4 ? Math.round(baseFee * 0.2) : 0;

  const reset = () => {
    setForm({
      name: "",
      phone: "",
      luggageType: "suitcase",
      size: "M",
      color: "黑色",
      description: "",
      insurance: 0,
      estimatedPickup: "",
      groupCount: 1,
    });
    setSelectedLockerIds([]);
    setPhotos([]);
    setErrorMessage(null);
  };

  const luggageCount = customerType === "group" ? form.groupCount : 1;

  const handleConfirmCheckIn = () => {
    setErrorMessage(null);

    if (!form.name.trim()) {
      setErrorMessage("请填写客户姓名");
      return;
    }
    if (!/^\d{11}$/.test(form.phone)) {
      setErrorMessage("请填写11位手机号");
      return;
    }
    if (selectedLockerIds.length === 0) {
      setErrorMessage("请至少选择1个柜位");
      return;
    }
    if (selectedLockerIds.length < luggageCount) {
      setErrorMessage(`柜位数(${selectedLockerIds.length})不能少于行李数(${luggageCount})`);
      return;
    }
    const notFree = selectedLockers.filter((l) => l.status !== "free");
    if (notFree.length > 0) {
      setErrorMessage(`柜位 ${notFree.map((l) => l.code).join("、")} 不是空闲状态`);
      return;
    }
    if (!activeZone) {
      setErrorMessage("未选择寄存区域");
      return;
    }
    if (!currentUser) {
      setErrorMessage("未获取到当前登录用户");
      return;
    }

    const overtimeFee = 0;
    const totalFee = baseFee + overtimeFee + insuranceFee - discount;
    const paidAmount = totalFee;

    const luggageTypes: LuggageItem[] = selectedLockerIds.slice(0, luggageCount).map((lockerId) => ({
      id: uid("lug"),
      type: form.luggageType,
      size: form.size,
      color: form.color,
      description: form.description,
      lockerId,
    }));

    const order: StorageOrder = {
      id: uid("order"),
      orderNo,
      zoneId: activeZone.id,
      lockerIds: selectedLockerIds,
      customerName: form.name,
      customerPhone: form.phone,
      luggageCount,
      luggageTypes,
      insuranceAmount: form.insurance,
      estimatedPickupAt: form.estimatedPickup || undefined,
      checkedInAt: new Date().toISOString(),
      checkedInBy: currentUser.id,
      photos,
      status: "stored",
      baseFee,
      overtimeFee,
      insuranceFee,
      discount,
      totalFee,
      paidAmount,
      isGroup: customerType === "group",
    };

    const method: PaymentMethod = "wechat";
    const nowIso = new Date().toISOString();

    const financeRecords: FinanceRecord[] = [];

    financeRecords.push({
      id: uid("fin"),
      orderId: order.id,
      orderNo: order.orderNo,
      zoneId: activeZone.id,
      type: "storage_fee",
      amount: baseFee,
      direction: "income",
      method,
      operatorId: currentUser.id,
      happenedAt: nowIso,
    });

    if (insuranceFee > 0) {
      financeRecords.push({
        id: uid("fin"),
        orderId: order.id,
        orderNo: order.orderNo,
        zoneId: activeZone.id,
        type: "insurance_fee",
        amount: insuranceFee,
        direction: "income",
        method,
        operatorId: currentUser.id,
        happenedAt: nowIso,
      });
    }

    if (discount > 0) {
      financeRecords.push({
        id: uid("fin"),
        orderId: order.id,
        orderNo: order.orderNo,
        zoneId: activeZone.id,
        type: "discount",
        amount: discount,
        direction: "expense",
        method: "offset",
        operatorId: currentUser.id,
        happenedAt: nowIso,
        remark: customerType === "group" ? "团体寄存折扣" : undefined,
      });
    }

    useAppStore.getState().createOrder(order, financeRecords);

    setToast(`入库成功！订单号 ${orderNo}`);
    setTimeout(() => {
      setToast(null);
      reset();
    }, 1500);
  };

  return (
    <div className="space-y-5 relative">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">
            现场收件工作台
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {format(new Date(), "yyyy年MM月dd日 EEEE")} · 快速录入客户信息与柜位分配
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex">
        <QuickForm
          customerType={customerType}
          setCustomerType={setCustomerType}
          form={form}
          setForm={setForm}
        />
        <LockerAllocator
          selectedIds={selectedLockerIds}
          setSelectedIds={setSelectedLockerIds}
          targetSize={form.size}
          targetCount={customerType === "group" ? form.groupCount : 1}
        />
        <div className="w-[320px] space-y-5 ml-5 shrink-0">
          <LabelPreview
            orderNo={orderNo}
            customerName={form.name}
            lockerCodes={selectedLockers.map((l) => l.code)}
            onPrint={() => {}}
          />
          <PhotoCapture photos={photos} setPhotos={setPhotos} />
          <FeeBreakdown
            baseFee={baseFee}
            overtimeEst={0}
            insuranceFee={insuranceFee}
            discount={discount}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white rounded-xl shadow-card p-4 flex items-center justify-between">
        <button onClick={reset} className="btn-secondary">
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Save className="w-4 h-4" />
            暂存草稿
          </button>
          <button onClick={handleConfirmCheckIn} className="btn-primary px-6 py-2.5">
            <PackageCheck className="w-4 h-4" />
            确认入库
          </button>
        </div>
      </div>
    </div>
  );
}
