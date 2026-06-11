import { useState, useMemo } from "react";
import {
  Clock,
  AlertTriangle,
  Calculator,
  Wallet,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { clsx } from "clsx";
import type { StorageOrder } from "@/types";
import { useAppStore } from "@/store";

type PayKey = "wechat" | "alipay" | "cash";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分` : `${h} 小时`;
}

function calcOvertimeFee(minutes: number, step: number, unitPrice: number) {
  if (minutes <= 0 || step <= 0 || unitPrice <= 0) return 0;
  return Math.ceil(minutes / step) * unitPrice;
}

const paymentStyles: Record<PayKey, { active: string; icon: string; text: string; label: string; Icon: typeof Wallet }> = {
  wechat: { active: "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200", icon: "text-emerald-600", text: "text-emerald-700", label: "微信支付", Icon: QrCode },
  alipay: { active: "border-sky-300 bg-sky-50 ring-2 ring-sky-200", icon: "text-sky-600", text: "text-sky-700", label: "支付宝", Icon: CreditCard },
  cash: { active: "border-amber-300 bg-amber-50 ring-2 ring-amber-200", icon: "text-amber-600", text: "text-amber-700", label: "现金", Icon: Banknote },
};

export default function PaymentPanel({
  order,
  onConfirm,
}: {
  order: StorageOrder | null;
  onConfirm: () => void;
}) {
  const zones = useAppStore((s) => s.zones);
  const [method, setMethod] = useState<PayKey>("wechat");

  const pricing = useMemo(() => {
    if (!order) return null;
    return zones.find((z) => z.id === order.zoneId)?.pricingRule ?? null;
  }, [order, zones]);

  const duration = useMemo(() => {
    if (!order) return { stored: 0, overtime: 0 };
    const storedMinutes = differenceInMinutes(new Date(), new Date(order.checkedInAt));
    let overtimeMinutes = 0;
    if (order.estimatedPickupAt) {
      const est = new Date(order.estimatedPickupAt).getTime();
      const now = Date.now();
      if (now > est) overtimeMinutes = Math.floor((now - est) / 60000);
    }
    return { stored: storedMinutes, overtime: overtimeMinutes };
  }, [order]);

  const liveOvertimeFee = useMemo(() => {
    if (!order) return 0;
    const step = pricing?.overtimeStepMinutes ?? 30;
    const unit = pricing?.overtimeUnitPrice ?? 5;
    return order.overtimeFee + calcOvertimeFee(duration.overtime, step, unit);
  }, [order, duration.overtime, pricing]);

  const unpaid = order ? Math.max(0, order.baseFee + liveOvertimeFee + order.insuranceFee - order.discount - order.paidAmount) : 0;

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 min-h-[420px] flex flex-col items-center justify-center text-center">
        <Calculator className="w-12 h-12 text-slate-300 mb-3" />
        <div className="text-sm text-slate-500">选择订单后显示费用结算</div>
      </div>
    );
  }

  const rows = [
    { label: "基本寄存费", value: order.baseFee, cls: "" },
    { label: "超时费用（累计）", value: liveOvertimeFee, cls: liveOvertimeFee > 0 ? "text-amber-600" : "" },
    { label: "保价费", value: order.insuranceFee, cls: "" },
    { label: "折扣优惠", value: -order.discount, cls: order.discount > 0 ? "text-emerald-600" : "" },
    { label: "已付金额", value: -order.paidAmount, cls: order.paidAmount > 0 ? "text-slate-400" : "" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="section-title flex items-center gap-2">
          <Calculator className="w-4 h-4 text-violet-500" />
          费用结算
        </h3>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1">
              <Clock className="w-3 h-3" /> 存放时长
            </div>
            <div className="font-display font-bold text-xl text-navy-900 tabular-nums">
              {formatDuration(duration.stored)}
            </div>
          </div>
          <div
            className={clsx(
              "rounded-xl p-3",
              duration.overtime > 0 ? "bg-amber-50" : "bg-slate-50"
            )}
          >
            <div
              className={clsx(
                "flex items-center gap-1.5 text-xs mb-1",
                duration.overtime > 0 ? "text-amber-600" : "text-slate-500"
              )}
            >
              <AlertTriangle className="w-3 h-3" /> 超时时长
            </div>
            <div
              className={clsx(
                "font-display font-bold text-xl tabular-nums",
                duration.overtime > 0 ? "text-amber-700" : "text-slate-400"
              )}
            >
              {duration.overtime > 0 ? formatDuration(duration.overtime) : "无"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{r.label}</span>
              <span className={clsx("font-medium tabular-nums", r.cls)}>
                {r.value >= 0 ? "¥" : "-¥"}
                {Math.abs(r.value).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-slate-100 my-2" />
          <div className="flex items-center justify-between bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg px-3 py-2.5">
            <span className="text-sm font-semibold text-navy-900">待付金额</span>
            <span className="font-display text-2xl font-bold text-navy-900 tabular-nums">
              ¥{unpaid.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">支付方式</div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(paymentStyles) as PayKey[]).map((key) => {
              const ps = paymentStyles[key];
              const Icon = ps.Icon;
              const active = method === key;
              return (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                    active ? ps.active : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-5 h-5",
                      active ? ps.icon : "text-slate-400"
                    )}
                  />
                  <span
                    className={clsx(
                      "text-[11px] font-medium",
                      active ? ps.text : "text-slate-500"
                    )}
                  >
                    {ps.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-50 rounded-lg p-3">
          <div className="flex items-start gap-1.5">
            <Wallet className="w-3 h-3 mt-0.5 shrink-0 text-slate-400" />
            <span>
              订单 {order.orderNo} · 确认取件时间：
              {format(new Date(), "HH:mm:ss")}
            </span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={order.status === "picked"}
          className={clsx(
            "w-full py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2",
            order.status === "picked"
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "btn-success !py-3.5 text-base shadow-lg hover:shadow-xl"
          )}
        >
          <CheckCircle2 className="w-5 h-5" />
          {order.status === "picked" ? "已完成取件" : "确认取件"}
        </button>
      </div>
    </div>
  );
}
