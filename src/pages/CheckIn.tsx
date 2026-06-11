import { useMemo, useState } from "react";
import { format } from "date-fns";
import { RotateCcw, Save, PackageCheck } from "lucide-react";
import { useAppStore } from "@/store";
import type { LockerSize, LuggageType } from "@/types";
import QuickForm, { CustomerType, CheckInForm } from "@/components/checkin/QuickForm";
import LockerAllocator from "@/components/checkin/LockerAllocator";
import {
  LabelPreview,
  PhotoCapture,
  FeeBreakdown,
} from "@/components/checkin/RightPanels";

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

  const activeZone = useAppStore((s) => s.zones.find((z) => z.id === s.activeZoneId));
  const lockers = useAppStore((s) => s.lockers);
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
  };

  return (
    <div className="space-y-5">
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
          <button className="btn-primary px-6 py-2.5">
            <PackageCheck className="w-4 h-4" />
            确认入库
          </button>
        </div>
      </div>
    </div>
  );
}
