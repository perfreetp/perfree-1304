import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  X,
  MapPin,
  Clock,
  DollarSign,
  Wrench,
  Eye,
  Edit3,
  ShieldAlert,
  Info,
  CreditCard,
  LayoutGrid,
  Ban,
  Lightbulb,
  Save,
} from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import { StorageZone, ZoneStatus, PricingRule, Locker, LockerSize } from "@/types";
import { uid } from "@/lib/utils";

const statusTabs: { key: ZoneStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "open", label: "营业中" },
  { key: "closed", label: "打烊" },
  { key: "maintenance", label: "维护" },
];

const statusMap: Record<ZoneStatus, { text: string; cls: string }> = {
  open: { text: "营业中", cls: "tag-success" },
  closed: { text: "打烊", cls: "tag-slate" },
  maintenance: { text: "维护中", cls: "tag-warning" },
};

const pricingTypeMap: Record<PricingRule["type"], string> = {
  hourly: "按时计费",
  perUse: "按次计费",
  tiered: "阶梯计费",
};

type DrawerTab = "basic" | "pricing" | "capacity" | "tips";

function ZoneCard({
  zone,
  onView,
  onEdit,
}: {
  zone: StorageZone;
  onView: (z: StorageZone) => void;
  onEdit: (z: StorageZone) => void;
}) {
  const rate = zone.totalLockers ? Math.round((zone.usedLockers / zone.totalLockers) * 100) : 0;
  const st = statusMap[zone.status];

  const barColor =
    rate >= zone.capacityWarning
      ? "bg-gradient-to-r from-amber-500 to-orange-400"
      : rate >= 60
      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
      : "bg-gradient-to-r from-sky-500 to-cyan-400";

  return (
    <div className="bg-white rounded-xl shadow-card p-5 transition-all hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={st.cls}>{st.text}</span>
          </div>
          <h4 className="font-semibold text-navy-900 leading-snug line-clamp-1">{zone.name}</h4>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{zone.location}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">柜位使用率</span>
          <span className="text-xs font-semibold text-navy-800 tabular-nums">{rate}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${rate}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-slate-500 font-medium">
          <span className="tabular-nums text-navy-800 font-semibold">{zone.usedLockers}</span>
          <span> / {zone.totalLockers} 柜位</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>营业时间 {zone.openTime} - {zone.closeTime}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {pricingTypeMap[zone.pricingRule.type]} · 首小时 ¥{zone.pricingRule.firstHourPrice}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onView(zone)}
          className="btn-secondary flex-1 text-xs py-1.5 px-3"
        >
          <Eye className="w-3.5 h-3.5" />
          查看配置
        </button>
        <button
          onClick={() => onEdit(zone)}
          className="btn-ghost text-xs py-1.5 px-2.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          编辑
        </button>
        <button className="btn-ghost text-xs py-1.5 px-2.5">
          <Wrench className="w-3.5 h-3.5" />
          维护
        </button>
      </div>
    </div>
  );
}

function DrawerBasic({ zone }: { zone: StorageZone }) {
  return (
    <div className="space-y-5 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">寄存区名称</label>
          <div className="input-base bg-slate-50 text-slate-700">{zone.name}</div>
        </div>
        <div>
          <label className="label">所在位置</label>
          <div className="input-base bg-slate-50 text-slate-700">{zone.location}</div>
        </div>
        <div>
          <label className="label">运营状态</label>
          <div className="input-base bg-slate-50">
            <span className={statusMap[zone.status].cls}>{statusMap[zone.status].text}</span>
          </div>
        </div>
        <div>
          <label className="label">创建时间</label>
          <div className="input-base bg-slate-50 text-slate-700 text-sm">
            {new Date(zone.createdAt).toLocaleDateString("zh-CN")}
          </div>
        </div>
        <div>
          <label className="label">营业时间 - 开</label>
          <div className="input-base bg-slate-50 text-slate-700 font-mono">{zone.openTime}</div>
        </div>
        <div>
          <label className="label">营业时间 - 关</label>
          <div className="input-base bg-slate-50 text-slate-700 font-mono">{zone.closeTime}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">容量概览</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-navy-800 font-display tabular-nums">{zone.totalLockers}</div>
            <div className="text-xs text-slate-500 mt-1">总柜位</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600 font-display tabular-nums">{zone.usedLockers}</div>
            <div className="text-xs text-slate-500 mt-1">已使用</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-sky-600 font-display tabular-nums">
              {zone.totalLockers - zone.usedLockers}
            </div>
            <div className="text-xs text-slate-500 mt-1">空闲</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>使用率</span>
            <span className="font-semibold">
              {zone.totalLockers ? Math.round((zone.usedLockers / zone.totalLockers) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
              style={{ width: `${zone.totalLockers ? (zone.usedLockers / zone.totalLockers) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerPricing({ zone }: { zone: StorageZone }) {
  const p = zone.pricingRule;
  return (
    <div className="space-y-5 p-6">
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">计费模式</span>
        </div>
        <div className="text-3xl font-bold font-display text-navy-800">
          {pricingTypeMap[p.type]}
        </div>
        <div className="text-xs text-slate-500 mt-1">保险费率 {(p.type === "tiered" ? 1.5 : zone.insuranceRate * 100).toFixed(1)}%</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">首小时价格</label>
          <div className="input-base bg-slate-50 font-semibold text-navy-800">¥{p.firstHourPrice}</div>
        </div>
        <div>
          <label className="label">超时单价（每{p.overtimeStepMinutes}分钟）</label>
          <div className="input-base bg-slate-50 font-semibold text-navy-800">¥{p.overtimeUnitPrice}</div>
        </div>
        <div>
          <label className="label">每日封顶价</label>
          <div className="input-base bg-slate-50 font-semibold text-navy-800">¥{p.dailyMaxPrice}</div>
        </div>
        <div>
          <label className="label">容量预警阈值</label>
          <div className="input-base bg-slate-50 font-semibold text-amber-700">{zone.capacityWarning}%</div>
        </div>
      </div>

      <div>
        <label className="label mb-2">柜位尺寸加价</label>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-center">
            <div className="text-xs text-slate-500 mb-1">小号 (S)</div>
            <div className="text-lg font-bold font-display text-sky-700">¥{p.smallLockerExtra}</div>
            <div className="text-[10px] text-slate-400">基础价</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
            <div className="text-xs text-slate-500 mb-1">中号 (M)</div>
            <div className="text-lg font-bold font-display text-emerald-700">+¥{p.mediumLockerExtra}</div>
            <div className="text-[10px] text-slate-400">加收费</div>
          </div>
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 text-center">
            <div className="text-xs text-slate-500 mb-1">大号 (L)</div>
            <div className="text-lg font-bold font-display text-violet-700">+¥{p.largeLockerExtra}</div>
            <div className="text-[10px] text-slate-400">加收费</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawerCapacity({ zone }: { zone: StorageZone }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);
  return (
    <div className="space-y-5 p-6">
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">时段容量分布</span>
        </div>
        <div className="text-xs text-slate-600">典型工作日各时段预估使用率</div>
      </div>

      <div className="space-y-2">
        {hours.map((h) => {
          const base = h >= 10 && h <= 12 ? 0.85 : h >= 14 && h <= 18 ? 0.9 : h >= 19 && h <= 21 ? 0.7 : 0.4;
          const v = Math.round(base * 100 + (Math.sin(h) * 8));
          const val = Math.max(10, Math.min(98, v));
          const color =
            val >= zone.capacityWarning
              ? "from-amber-500 to-orange-400"
              : val >= 60
              ? "from-emerald-500 to-teal-400"
              : "from-sky-500 to-cyan-400";
          return (
            <div key={h} className="flex items-center gap-3">
              <span className="w-12 text-xs font-mono text-slate-500 tabular-nums shrink-0">
                {String(h).padStart(2, "0")}:00
              </span>
              <div className="flex-1 h-6 rounded-md bg-slate-50 overflow-hidden relative">
                <div
                  className={clsx("h-full rounded-md bg-gradient-to-r transition-all", color)}
                  style={{ width: `${val}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-slate-700 tabular-nums">
                  {val}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>柜位总数</span>
          <span className="font-semibold text-navy-800 tabular-nums">{zone.totalLockers} 个</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-1.5">
          <span>高峰预警阈值</span>
          <span className="font-semibold text-amber-700 tabular-nums">{zone.capacityWarning}%</span>
        </div>
      </div>
    </div>
  );
}

function DrawerTips({ zone }: { zone: StorageZone }) {
  return (
    <div className="space-y-5 p-6">
      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
        <div className="flex items-center gap-2 mb-3">
          <Ban className="w-4 h-4 text-rose-600" />
          <span className="text-sm font-semibold text-rose-800">禁寄物品清单</span>
          <span className="tag-danger ml-auto">{zone.bannedItems.length} 项</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {zone.bannedItems.map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-semibold text-sky-800">客户寄存提示</span>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed bg-white/60 rounded-lg p-3 border border-sky-100">
          {zone.tips}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">保险费率</div>
          <div className="text-2xl font-bold font-display text-navy-800 tabular-nums">
            {(zone.insuranceRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-xs text-slate-500 mb-1">容量预警</div>
          <div className="text-2xl font-bold font-display text-amber-700 tabular-nums">
            {zone.capacityWarning}%
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigDrawer({
  zone,
  onClose,
  onEdit,
}: {
  zone: StorageZone | null;
  onClose: () => void;
  onEdit: (z: StorageZone) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("basic");

  const tabs: { key: DrawerTab; label: string; icon: JSX.Element }[] = [
    { key: "basic", label: "基础信息", icon: <Info className="w-3.5 h-3.5" /> },
    { key: "pricing", label: "收费规则", icon: <CreditCard className="w-3.5 h-3.5" /> },
    { key: "capacity", label: "时段容量", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { key: "tips", label: "禁寄与提示", icon: <Lightbulb className="w-3.5 h-3.5" /> },
  ];

  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-navy-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h3 className="font-semibold text-navy-900 truncate">{zone.name}</h3>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{zone.location}</span>
              <span className="mx-1.5">·</span>
              <span className={statusMap[zone.status].cls}>{statusMap[zone.status].text}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-3"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-slate-100 flex gap-1 shrink-0 bg-slate-50/50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all",
                tab === t.key
                  ? "bg-white text-navy-800 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {tab === "basic" && <DrawerBasic zone={zone} />}
          {tab === "pricing" && <DrawerPricing zone={zone} />}
          {tab === "capacity" && <DrawerCapacity zone={zone} />}
          {tab === "tips" && <DrawerTips zone={zone} />}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="btn-secondary text-sm">
            关闭
          </button>
          <button onClick={() => onEdit(zone)} className="btn-primary text-sm">
            <Edit3 className="w-4 h-4" />
            编辑配置
          </button>
        </div>
      </div>
    </div>
  );
}

interface ZoneFormModalProps {
  mode: "create" | "edit";
  initialZone?: StorageZone;
  onClose: () => void;
}

function ZoneFormModal({ mode, initialZone, onClose }: ZoneFormModalProps) {
  const defaultPricing: PricingRule = {
    type: "hourly",
    firstHourPrice: 10,
    overtimeUnitPrice: 5,
    overtimeStepMinutes: 30,
    dailyMaxPrice: 60,
    smallLockerExtra: 0,
    mediumLockerExtra: 5,
    largeLockerExtra: 10,
  };

  const [name, setName] = useState(initialZone?.name ?? "");
  const [location, setLocation] = useState(initialZone?.location ?? "");
  const [status, setStatus] = useState<ZoneStatus>(initialZone?.status ?? "open");
  const [openTime, setOpenTime] = useState(initialZone?.openTime ?? "09:00");
  const [closeTime, setCloseTime] = useState(initialZone?.closeTime ?? "21:00");
  const [capacityWarning, setCapacityWarning] = useState(initialZone?.capacityWarning ?? 85);
  const [insuranceRate, setInsuranceRate] = useState(initialZone?.insuranceRate ?? 0.01);
  const [tips, setTips] = useState(initialZone?.tips ?? "");
  const [pricing, setPricing] = useState<PricingRule>(initialZone?.pricingRule ?? defaultPricing);
  const [bannedItemsText, setBannedItemsText] = useState(
    initialZone?.bannedItems.join("\n") ?? ""
  );

  const [totalLockers, setTotalLockers] = useState(initialZone?.totalLockers ?? 30);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "请输入寄存区名称";
    if (!location.trim()) newErrors.location = "请输入所在位置";
    if (mode === "create" && (!totalLockers || totalLockers <= 0)) {
      newErrors.totalLockers = "柜位总数必须大于0";
    }
    if (capacityWarning < 1 || capacityWarning > 100) {
      newErrors.capacityWarning = "预警阈值需在 1-100 之间";
    }
    if (insuranceRate <= 0) newErrors.insuranceRate = "保险费率必须大于0";
    if (pricing.firstHourPrice <= 0) newErrors.firstHourPrice = "首小时价格必须大于0";
    if (pricing.overtimeUnitPrice <= 0) newErrors.overtimeUnitPrice = "超时单价必须大于0";
    if (pricing.overtimeStepMinutes <= 0) newErrors.overtimeStepMinutes = "超时步长必须大于0";
    if (pricing.dailyMaxPrice <= 0) newErrors.dailyMaxPrice = "每日封顶价必须大于0";
    if (pricing.smallLockerExtra < 0) newErrors.smallLockerExtra = "小号加价不能为负";
    if (pricing.mediumLockerExtra < 0) newErrors.mediumLockerExtra = "中号加价不能为负";
    if (pricing.largeLockerExtra < 0) newErrors.largeLockerExtra = "大号加价不能为负";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const bannedItems = bannedItemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (mode === "create") {
      const zoneId = uid("zone");
      const now = new Date().toISOString();

      const r = rows;
      const c = cols;
      const total = r * c;
      const sizes: LockerSize[] = ["S", "M", "L"];
      const floors = ["F1"];
      const areas = ["A区"];
      const lockers: Locker[] = [];
      for (let i = 0; i < total; i++) {
        const rowIdx = Math.floor(i / c);
        const colIdx = i % c;
        const rowCode = String.fromCharCode(65 + (rowIdx % 26));
        const colCode = String(colIdx + 1).padStart(2, "0");
        lockers.push({
          id: uid("locker"),
          zoneId,
          code: `${rowCode}${colCode}`,
          size: sizes[i % 3],
          status: "free",
          floor: floors[rowIdx % floors.length],
          area: areas[rowIdx % areas.length],
        });
      }

      const zone: StorageZone = {
        id: zoneId,
        name: name.trim(),
        location: location.trim(),
        status,
        openTime,
        closeTime,
        totalLockers: total,
        usedLockers: 0,
        pricingRule: pricing,
        bannedItems,
        tips: tips.trim(),
        insuranceRate,
        capacityWarning,
        createdAt: now,
      };

      useAppStore.getState().createZone(zone, lockers);
      alert("寄存区创建成功！");
      onClose();
    } else if (initialZone) {
      const patch: Partial<StorageZone> = {
        name: name.trim(),
        location: location.trim(),
        status,
        openTime,
        closeTime,
        capacityWarning,
        insuranceRate,
        tips: tips.trim(),
        bannedItems,
        pricingRule: pricing,
      };
      useAppStore.getState().updateZone(initialZone.id, patch);
      alert("寄存区配置已更新！");
      onClose();
    }
  };

  const isCreate = mode === "create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-navy-900">
              {isCreate ? "新增寄存区" : "编辑寄存区配置"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCreate ? "填写寄存区基础信息和柜位布局，系统将自动生成柜位" : "修改寄存区的配置信息"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              基础信息
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">寄存区名称 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：国金中心北一门"
                  className={clsx("input-base", errors.name && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="label">所在位置 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：上海国金中心商场"
                  className={clsx("input-base", errors.location && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="label">运营状态</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ZoneStatus)}
                  className="input-base"
                >
                  <option value="open">营业中</option>
                  <option value="closed">打烊</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
              <div>
                <label className="label">容量预警阈值 (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={capacityWarning}
                  onChange={(e) => setCapacityWarning(Number(e.target.value))}
                  className={clsx("input-base", errors.capacityWarning && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.capacityWarning && <p className="text-xs text-rose-500 mt-1">{errors.capacityWarning}</p>}
              </div>
              <div>
                <label className="label">开始营业时间</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label">结束营业时间</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label">保险费率（如 0.01 表示 1%）</label>
                <input
                  type="number"
                  step={0.001}
                  min={0}
                  value={insuranceRate}
                  onChange={(e) => setInsuranceRate(Number(e.target.value))}
                  className={clsx("input-base", errors.insuranceRate && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.insuranceRate && <p className="text-xs text-rose-500 mt-1">{errors.insuranceRate}</p>}
              </div>
              <div />
              <div className="col-span-2">
                <label className="label">客户寄存提示</label>
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  rows={3}
                  placeholder="提示客户的寄存注意事项..."
                  className="input-base resize-y"
                />
              </div>
            </div>
          </div>

          {isCreate && (
            <div>
              <h4 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-500" />
                柜位布局
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">柜位总数 <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={totalLockers}
                    onChange={(e) => setTotalLockers(Number(e.target.value))}
                    className={clsx("input-base", errors.totalLockers && "ring-2 ring-rose-200 border-rose-300")}
                  />
                  {errors.totalLockers && <p className="text-xs text-rose-500 mt-1">{errors.totalLockers}</p>}
                </div>
                <div>
                  <label className="label">行数（可选）</label>
                  <input
                    type="number"
                    min={1}
                    value={rows}
                    onChange={(e) => {
                      const r = Math.max(1, Number(e.target.value));
                      setRows(r);
                      setTotalLockers(r * cols);
                    }}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label">列数（可选）</label>
                  <input
                    type="number"
                    min={1}
                    value={cols}
                    onChange={(e) => {
                      const c = Math.max(1, Number(e.target.value));
                      setCols(c);
                      setTotalLockers(rows * c);
                    }}
                    className="input-base"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                将自动生成 {rows} 行 × {cols} 列 = {rows * cols} 个柜位，柜位编码如 A01、B03，尺寸按 S/M/L 循环分配。
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              收费规则
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">计费模式</label>
                <select
                  value={pricing.type}
                  onChange={(e) => setPricing({ ...pricing, type: e.target.value as PricingRule["type"] })}
                  className="input-base"
                >
                  <option value="hourly">按时计费</option>
                  <option value="perUse">按次计费</option>
                  <option value="tiered">阶梯计费</option>
                </select>
              </div>
              <div>
                <label className="label">首小时价格 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.firstHourPrice}
                  onChange={(e) => setPricing({ ...pricing, firstHourPrice: Number(e.target.value) })}
                  className={clsx("input-base", errors.firstHourPrice && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.firstHourPrice && <p className="text-xs text-rose-500 mt-1">{errors.firstHourPrice}</p>}
              </div>
              <div>
                <label className="label">超时步长（分钟）</label>
                <input
                  type="number"
                  min={1}
                  value={pricing.overtimeStepMinutes}
                  onChange={(e) => setPricing({ ...pricing, overtimeStepMinutes: Number(e.target.value) })}
                  className={clsx("input-base", errors.overtimeStepMinutes && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.overtimeStepMinutes && <p className="text-xs text-rose-500 mt-1">{errors.overtimeStepMinutes}</p>}
              </div>
              <div>
                <label className="label">超时单价 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.overtimeUnitPrice}
                  onChange={(e) => setPricing({ ...pricing, overtimeUnitPrice: Number(e.target.value) })}
                  className={clsx("input-base", errors.overtimeUnitPrice && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.overtimeUnitPrice && <p className="text-xs text-rose-500 mt-1">{errors.overtimeUnitPrice}</p>}
              </div>
              <div>
                <label className="label">每日封顶价 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.dailyMaxPrice}
                  onChange={(e) => setPricing({ ...pricing, dailyMaxPrice: Number(e.target.value) })}
                  className={clsx("input-base", errors.dailyMaxPrice && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.dailyMaxPrice && <p className="text-xs text-rose-500 mt-1">{errors.dailyMaxPrice}</p>}
              </div>
              <div />
              <div>
                <label className="label">小号柜位加价 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.smallLockerExtra}
                  onChange={(e) => setPricing({ ...pricing, smallLockerExtra: Number(e.target.value) })}
                  className={clsx("input-base", errors.smallLockerExtra && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.smallLockerExtra && <p className="text-xs text-rose-500 mt-1">{errors.smallLockerExtra}</p>}
              </div>
              <div>
                <label className="label">中号柜位加价 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.mediumLockerExtra}
                  onChange={(e) => setPricing({ ...pricing, mediumLockerExtra: Number(e.target.value) })}
                  className={clsx("input-base", errors.mediumLockerExtra && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.mediumLockerExtra && <p className="text-xs text-rose-500 mt-1">{errors.mediumLockerExtra}</p>}
              </div>
              <div>
                <label className="label">大号柜位加价 (¥)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricing.largeLockerExtra}
                  onChange={(e) => setPricing({ ...pricing, largeLockerExtra: Number(e.target.value) })}
                  className={clsx("input-base", errors.largeLockerExtra && "ring-2 ring-rose-200 border-rose-300")}
                />
                {errors.largeLockerExtra && <p className="text-xs text-rose-500 mt-1">{errors.largeLockerExtra}</p>}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-500" />
              禁寄物品
            </h4>
            <textarea
              value={bannedItemsText}
              onChange={(e) => setBannedItemsText(e.target.value)}
              rows={4}
              placeholder="每行一项，如：&#10;易燃易爆物品&#10;鲜活易腐物品&#10;贵重物品"
              className="input-base resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">每行输入一项禁寄物品名称</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
          <button onClick={onClose} className="btn-secondary text-sm">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorageConfig() {
  const [tab, setTab] = useState<ZoneStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [drawerZone, setDrawerZone] = useState<StorageZone | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formZone, setFormZone] = useState<StorageZone | null>(null);
  const zones = useAppStore((s) => s.zones);

  const openCreate = () => {
    setFormZone(null);
    setFormMode("create");
  };

  const openEdit = (zone: StorageZone) => {
    setDrawerZone(null);
    setFormZone(zone);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setFormZone(null);
  };

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (tab !== "all" && z.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          z.name.toLowerCase().includes(q) ||
          z.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [zones, tab, search]);

  const tabCounts = useMemo(() => {
    return {
      all: zones.length,
      open: zones.filter((z) => z.status === "open").length,
      closed: zones.filter((z) => z.status === "closed").length,
      maintenance: zones.filter((z) => z.status === "maintenance").length,
    };
  }, [zones]);

  return (
    <div className="p-6 space-y-5">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">寄存区配置</h1>
          <p className="text-sm text-slate-500 mt-1">管理各门店寄存区的基础信息、收费规则与容量设置</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          新增寄存区
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {statusTabs.map((t) => {
            const count = tabCounts[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  tab === t.key
                    ? "bg-white text-navy-800 shadow-sm"
                    : "text-slate-600 hover:text-navy-800"
                )}
              >
                {t.label}
                <span
                  className={clsx(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums",
                    tab === t.key ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="sm:ml-auto relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索寄存区名称或位置..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50/60 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredZones.map((z) => (
          <ZoneCard key={z.id} zone={z} onView={setDrawerZone} onEdit={openEdit} />
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <div className="text-5xl mb-3">📦</div>
          <div className="text-navy-800 font-medium">暂无匹配的寄存区</div>
          <div className="text-sm text-slate-500 mt-1">请尝试调整筛选条件</div>
        </div>
      )}

      <ConfigDrawer
        zone={drawerZone}
        onClose={() => setDrawerZone(null)}
        onEdit={openEdit}
      />

      {formMode && (
        <ZoneFormModal
          mode={formMode}
          initialZone={formZone ?? undefined}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
