import { useMemo, useState } from "react";
import type { Locker, LockerSize, LockerStatus } from "@/types";
import { useAppStore } from "@/store";
import LockerCell from "@/components/LockerCell";
import { Drawer } from "@/components/Tooltip";
import { cn } from "@/lib/utils";

type SizeFilter = "all" | LockerSize;
type StatusFilter = "all" | LockerStatus;
type FloorFilter = "all" | "F1" | "F2";
type AreaFilter = "all" | "A区" | "B区" | "C区";

const STATUS_OPTS = [
  { v: "all" as const, l: "全部", t: "tag-slate", d: "bg-slate-400" },
  { v: "free" as const, l: "空闲", t: "tag-success", d: "bg-emerald-500" },
  { v: "occupied" as const, l: "占用", t: "tag-info", d: "bg-blue-500" },
  { v: "reserved" as const, l: "预留", t: "tag-slate", d: "bg-sky-500" },
  { v: "fault" as const, l: "故障", t: "tag-danger", d: "bg-rose-500" },
  { v: "cleaning" as const, l: "清洁中", t: "tag-warning", d: "bg-amber-500" },
];
const SIZE_OPTS: { v: SizeFilter; l: string }[] = [
  { v: "all", l: "全部" },
  { v: "S", l: "S" },
  { v: "M", l: "M" },
  { v: "L", l: "L" },
];
const FLOOR_OPTS: FloorFilter[] = ["all", "F1", "F2"];
const AREA_OPTS: AreaFilter[] = ["all", "A区", "B区", "C区"];
const STATUS_TAG: Record<LockerStatus, string> = {
  free: "tag-success", occupied: "tag-info", reserved: "tag-slate",
  fault: "tag-danger", cleaning: "tag-warning",
};
const STATUS_LBL: Record<LockerStatus, string> = {
  free: "空闲", occupied: "占用", reserved: "预留",
  fault: "故障", cleaning: "清洁中",
};
const MOCK_HIST = [
  { d: "06-11 14:32", c: "刘先生", t: "3h 22m", s: "已取件" },
  { d: "06-10 09:15", c: "陈女士", t: "6h 08m", s: "已取件" },
  { d: "06-09 18:44", c: "周先生", t: "2h 15m", s: "已取件" },
];
function fmtDur(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function fmtDT(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default function LockerManager() {
  const zones = useAppStore((s) => s.zones);
  const activeZoneId = useAppStore((s) => s.activeZoneId);
  const setActiveZoneId = useAppStore((s) => s.setActiveZoneId);
  const lockers = useAppStore((s) => s.lockers);
  const orders = useAppStore((s) => s.orders);
  const updateLockerStatus = useAppStore((s) => s.updateLockerStatus);

  const [sizeF, setSizeF] = useState<SizeFilter>("all");
  const [statusF, setStatusF] = useState<StatusFilter>("all");
  const [floorF, setFloorF] = useState<FloorFilter>("all");
  const [areaF, setAreaF] = useState<AreaFilter>("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AreaFilter>("A区");
  const [sel, setSel] = useState<Locker | null>(null);
  const [open, setOpen] = useState(false);

  const zl = useMemo(() => lockers.filter((l) => l.zoneId === activeZoneId), [lockers, activeZoneId]);
  const stats = useMemo(() => {
    const b: Record<LockerStatus, number> = { free: 0, occupied: 0, reserved: 0, fault: 0, cleaning: 0 };
    zl.forEach((l) => (b[l.status] += 1));
    return b;
  }, [zl]);
  const filtered = useMemo(() => zl.filter((l) => {
    if (sizeF !== "all" && l.size !== sizeF) return false;
    if (statusF !== "all" && l.status !== statusF) return false;
    if (floorF !== "all" && l.floor !== floorF) return false;
    if (areaF !== "all" && l.area !== areaF) return false;
    if (search && !l.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [zl, sizeF, statusF, floorF, areaF, search]);
  const tabs = useMemo(() => Array.from(new Set(zl.map((l) => l.area))).sort() as AreaFilter[], [zl]);
  const order = useMemo(
    () => (sel?.currentOrderId ? orders.find((o) => o.id === sel.currentOrderId) : undefined),
    [sel, orders]
  );
  const grid = useMemo(() => filtered.filter((l) => l.area === tab), [filtered, tab]);
  const total = zl.length;

  const onClick = (l: Locker) => { setSel(l); setOpen(true); };
  const upd = (st: Locker["status"], rk?: string) => {
    if (!sel) return;
    updateLockerStatus(sel.id, st, rk);
    setSel({ ...sel, status: st, remark: rk });
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-2xl font-bold text-navy-900">柜位管理</h1>
          <select value={activeZoneId ?? ""} onChange={(e) => setActiveZoneId(e.target.value || null)} className="input-base w-72">
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">批量启用</button>
          <button className="btn-secondary">标记故障</button>
          <button className="btn-secondary">导出清单</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-5 shadow-card">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">尺寸：</span>
            <div className="flex gap-1.5">
              {SIZE_OPTS.map((o) => (
                <button key={o.v} onClick={() => setSizeF(o.v)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    sizeF === o.v ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">状态：</span>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTS.map((o) => (
                <button key={o.v} onClick={() => setStatusF(o.v)}
                  className={cn(o.t, "cursor-pointer transition-all",
                    statusF === o.v && "ring-2 ring-offset-1 ring-navy-400")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", o.d)} />{o.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">楼层：</span>
            <div className="flex gap-1.5">
              {FLOOR_OPTS.map((o) => (
                <button key={o} onClick={() => setFloorF(o)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    floorF === o ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {o === "all" ? "全部" : o}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12">分区：</span>
            <div className="flex gap-1.5">
              {AREA_OPTS.map((o) => (
                <button key={o} onClick={() => setAreaF(o)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    areaF === o ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {o === "all" ? "全部" : o}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索柜位编号..." className="input-base w-56" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-5">
        {[
          { l: "共", n: total, d: "bg-slate-400", t: "tag-slate" },
          { l: "空闲", n: stats.free, d: "bg-emerald-500", t: "tag-success" },
          { l: "占用", n: stats.occupied, d: "bg-blue-500", t: "tag-info" },
          { l: "预留", n: stats.reserved, d: "bg-sky-500", t: "tag-slate" },
          { l: "故障", n: stats.fault, d: "bg-rose-500", t: "tag-danger" },
          { l: "清洁", n: stats.cleaning, d: "bg-amber-500", t: "tag-warning" },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-xl p-4 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">柜位{s.l}</div>
              <div className="font-display text-2xl font-bold text-navy-900">{s.n}</div>
            </div>
            <span className={cn(s.t, "flex items-center gap-1.5 px-2.5 py-1")}>
              <span className={cn("w-2 h-2 rounded-full", s.d)} />
              <span className="text-[11px]">{s.l}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-1 mb-5 border-b border-slate-100">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2.5 text-sm font-medium transition-colors relative -mb-px",
                tab === t ? "text-navy-800 border-b-2 border-navy-600" : "text-slate-500 hover:text-navy-700")}>
              {t}
              <span className="ml-1.5 text-xs text-slate-400">
                ({filtered.filter((l) => l.area === t).length})
              </span>
            </button>
          ))}
        </div>
        {grid.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm">暂无符合条件的柜位</div>
        ) : (
          <div className="grid grid-cols-10 gap-1.5">
            {grid.map((l) => (
              <LockerCell key={l.id} code={l.code} size={l.size} status={l.status}
                floor={`${l.floor} ${l.area}`} occupiedAt={l.occupiedAt}
                selected={sel?.id === l.id} onClick={() => onClick(l)} />
            ))}
          </div>
        )}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)}
        title={sel ? (
          <span className="flex items-center gap-2">柜位详情
            <span className="text-sm text-slate-400 font-normal">#{sel.code}</span>
          </span>
        ) : "柜位详情"}>
        {sel && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="tag-info">编号：{sel.code}</span>
              <span className="tag-slate">尺寸：{sel.size}</span>
              <span className={STATUS_TAG[sel.status]}>状态：{STATUS_LBL[sel.status]}</span>
              <span className="tag-slate">楼层：{sel.floor}</span>
              <span className="tag-slate">分区：{sel.area}</span>
            </div>
            {order && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-navy-800">关联订单</div>
                  <span className="tag-info">{order.orderNo}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  <div><span className="text-slate-500 text-xs">客户姓名</span>
                    <div className="font-medium text-navy-900">{order.customerName}</div></div>
                  <div><span className="text-slate-500 text-xs">手机</span>
                    <div className="font-medium text-navy-900">{order.customerPhone}</div></div>
                  <div><span className="text-slate-500 text-xs">存入时间</span>
                    <div className="font-medium text-navy-900">{fmtDT(order.checkedInAt)}</div></div>
                  <div><span className="text-slate-500 text-xs">已存时长</span>
                    <div className="font-medium text-navy-900">{fmtDur(order.checkedInAt)}</div></div>
                  <div className="col-span-2"><span className="text-slate-500 text-xs">保价金额</span>
                    <div className="font-medium text-navy-900">¥{order.insuranceAmount.toLocaleString()}</div></div>
                </div>
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-navy-800 mb-3">操作</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => upd("fault", "手动标记故障")} className="btn-danger"
                  disabled={sel.status === "fault"}>标记故障</button>
                <button onClick={() => upd("free")} className="btn-secondary"
                  disabled={sel.status !== "occupied" && sel.status !== "reserved"}>手动释放柜位</button>
                <button onClick={() => upd("free")} className="btn-success"
                  disabled={sel.status !== "cleaning"}>清洁完成</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-navy-800 mb-3">历史使用</div>
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="data-table">
                  <thead><tr><th>时间</th><th>客户</th><th>时长</th><th>状态</th></tr></thead>
                  <tbody>
                    {MOCK_HIST.map((h, i) => (
                      <tr key={i}>
                        <td className="text-xs text-slate-500">{h.d}</td>
                        <td className="font-medium text-navy-900">{h.c}</td>
                        <td className="text-slate-600">{h.t}</td>
                        <td><span className="tag-success">{h.s}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
