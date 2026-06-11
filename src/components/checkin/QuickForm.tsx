import {
  UserPlus,
  Phone,
  Ruler,
  Palette,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import type { LockerSize, LuggageType } from "@/types";

export type CustomerType = "individual" | "group";

export interface CheckInForm {
  name: string;
  phone: string;
  luggageType: LuggageType;
  size: LockerSize;
  color: string;
  description: string;
  insurance: number;
  estimatedPickup: string;
  groupCount: number;
}

const luggageTypeOptions: { value: LuggageType; label: string }[] = [
  { value: "suitcase", label: "拉杆箱" },
  { value: "backpack", label: "背包" },
  { value: "handbag", label: "手提包" },
  { value: "box", label: "纸箱" },
  { value: "other", label: "其他" },
];

const sizeOptions: { value: LockerSize; label: string }[] = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
];

const colorOptions = ["黑色", "银色", "蓝色", "红色", "粉色", "棕色", "绿色", "其他"];

function TagPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
            value === opt.value
              ? "bg-navy-800 text-white border-navy-800 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function QuickForm({
  customerType,
  setCustomerType,
  form,
  setForm,
}: {
  customerType: CustomerType;
  setCustomerType: (t: CustomerType) => void;
  form: CheckInForm;
  setForm: React.Dispatch<React.SetStateAction<CheckInForm>>;
}) {
  const activeZone = useAppStore((s) => s.zones.find((z) => z.id === s.activeZoneId));

  return (
    <div className="w-[340px] bg-white rounded-xl shadow-card p-5 shrink-0 space-y-5 h-fit">
      <div className="flex items-center gap-2">
        <h3 className="section-title">快速收件</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setCustomerType("individual")}
          className={clsx(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            customerType === "individual"
              ? "bg-white text-navy-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          散客寄存
        </button>
        <button
          onClick={() => setCustomerType("group")}
          className={clsx(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            customerType === "group"
              ? "bg-white text-navy-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          团体寄存
        </button>
      </div>

      {customerType === "group" && (
        <div>
          <label className="label">行李数量（批量创建）</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, groupCount: Math.max(1, f.groupCount - 1) }))}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={1}
              value={form.groupCount}
              onChange={(e) => setForm((f) => ({ ...f, groupCount: Math.max(1, Number(e.target.value) || 1) }))}
              className="input-base w-24 text-center font-semibold text-lg"
            />
            <button
              onClick={() => setForm((f) => ({ ...f, groupCount: f.groupCount + 1 }))}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400">件行李</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="label flex items-center gap-1">
            <UserPlus className="w-3 h-3" /> 客户姓名
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="请输入客户姓名"
            className="input-base"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <Phone className="w-3 h-3" /> 手机号
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="请输入11位手机号"
            className="input-base"
          />
        </div>

        <div>
          <label className="label">行李类型</label>
          <TagPicker
            options={luggageTypeOptions}
            value={form.luggageType}
            onChange={(v) => setForm({ ...form, luggageType: v })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <Ruler className="w-3 h-3" /> 尺寸
          </label>
          <TagPicker
            options={sizeOptions}
            value={form.size}
            onChange={(v) => setForm({ ...form, size: v })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <Palette className="w-3 h-3" /> 颜色
          </label>
          <div className="flex flex-wrap gap-1.5">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={clsx(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border",
                  form.color === c
                    ? "bg-navy-800 text-white border-navy-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <FileText className="w-3 h-3" /> 特征描述
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="如：品牌标识、划痕、配件等"
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <Shield className="w-3 h-3" /> 保价金额（¥）
          </label>
          <input
            type="number"
            min={0}
            value={form.insurance}
            onChange={(e) => setForm({ ...form, insurance: Number(e.target.value) || 0 })}
            placeholder="0 表示不保价"
            className="input-base"
          />
          {activeZone && form.insurance > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              保价费率 {(activeZone.insuranceRate * 100).toFixed(1)}%，保费 ¥
              {(form.insurance * activeZone.insuranceRate).toFixed(0)}
            </p>
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1">
            <Clock className="w-3 h-3" /> 预计取件时间
          </label>
          <input
            type="datetime-local"
            value={form.estimatedPickup}
            onChange={(e) => setForm({ ...form, estimatedPickup: e.target.value })}
            className="input-base"
          />
        </div>
      </div>

      {activeZone && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-800 mb-1">禁寄物品提示</div>
              <div className="text-[11px] text-amber-700 leading-relaxed">
                {activeZone.bannedItems.join("、")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
