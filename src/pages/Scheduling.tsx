import { useMemo, useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Plus, HandCoins, Users, Clock,
  AlertTriangle, ClipboardList, CheckCircle2, CalendarClock,
  Archive, ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import KpiCard from "@/components/KpiCard";
import { Modal } from "@/components/Tooltip";
import { useAppStore } from "@/store";
import { Shift, ShiftType, HandoverRecord, Staff, LockerStatus } from "@/types";
import { uid } from "@/lib/utils";

const shiftMeta: Record<ShiftType, { label: string; cls: string; start: string; end: string }> = {
  morning: { label: "早班", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", start: "08:00", end: "15:00" },
  afternoon: { label: "中班", cls: "bg-blue-100 text-blue-700 ring-blue-200", start: "14:00", end: "21:00" },
  night: { label: "晚班", cls: "bg-indigo-100 text-indigo-700 ring-indigo-200", start: "20:00", end: "23:00" },
};

interface HandoverFormModalProps {
  open: boolean;
  onClose: () => void;
}

function HandoverFormModal({ open, onClose }: HandoverFormModalProps) {
  const { zones, staff, lockers, currentUser, addHandover } = useAppStore();

  const [zoneId, setZoneId] = useState<string>(zones[0]?.id || "");
  const [previousStaffId, setPreviousStaffId] = useState<string>(currentUser?.id || "");
  const [nextStaffId, setNextStaffId] = useState<string>("");
  const [storedCountOnShift, setStoredCountOnShift] = useState<number>(0);
  const [abnormalCount, setAbnormalCount] = useState<number>(0);
  const [remark, setRemark] = useState<string>("");

  useEffect(() => {
    if (open) {
      setZoneId(zones[0]?.id || "");
      setPreviousStaffId(currentUser?.id || "");
      setNextStaffId("");
      setAbnormalCount(0);
      setRemark("");
    }
  }, [open, zones, currentUser]);

  useEffect(() => {
    if (zoneId) {
      const count = lockers.filter((l) => l.zoneId === zoneId && l.status === "occupied").length;
      setStoredCountOnShift(count);
    } else {
      setStoredCountOnShift(0);
    }
  }, [zoneId, lockers]);

  const getStaffName = (id: string) => staff.find((s) => s.id === id)?.name || "";

  const handleSubmit = () => {
    if (!zoneId || !previousStaffId || !nextStaffId) {
      alert("请完整填写必填项");
      return;
    }
    if (previousStaffId === nextStaffId) {
      alert("交班人和接班人不能为同一人");
      return;
    }
    if (storedCountOnShift < 0 || abnormalCount < 0) {
      alert("件数不能为负数");
      return;
    }

    const lockerSnapshot = lockers
      .filter((l) => l.zoneId === zoneId)
      .map((l) => ({ lockerId: l.id, status: l.status as LockerStatus }));

    const record: HandoverRecord = {
      id: uid("hd"),
      zoneId,
      shiftDate: format(new Date(), "yyyy-MM-dd"),
      previousStaffId,
      nextStaffId,
      storedCountOnShift,
      abnormalCount,
      lockerSnapshot,
      handoverAt: new Date().toISOString(),
      previousSignature: getStaffName(previousStaffId),
      nextSignature: getStaffName(nextStaffId),
      remark: remark || undefined,
    };

    addHandover(record);
    onClose();
    alert("交接已记录");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="交接班清点"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>确认交接</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">寄存区 <span className="text-rose-500">*</span></label>
          <select className="input-base" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            <option value="">请选择寄存区</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">交班人 <span className="text-rose-500">*</span></label>
            <select className="input-base" value={previousStaffId} onChange={(e) => setPreviousStaffId(e.target.value)}>
              <option value="">请选择交班人</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">接班人 <span className="text-rose-500">*</span></label>
            <select className="input-base" value={nextStaffId} onChange={(e) => setNextStaffId(e.target.value)}>
              <option value="">请选择接班人</option>
              {staff
                .filter((s) => s.id !== previousStaffId)
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">在存件数 <span className="text-rose-500">*</span></label>
            <input
              type="number"
              className="input-base"
              min={0}
              value={storedCountOnShift}
              onChange={(e) => setStoredCountOnShift(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">异常件数 <span className="text-rose-500">*</span></label>
            <input
              type="number"
              className="input-base"
              min={0}
              value={abnormalCount}
              onChange={(e) => setAbnormalCount(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="label">备注</label>
          <textarea
            className="input-base min-h-[80px] resize-y"
            placeholder="如有异常情况请在此说明..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const shiftTypes: ShiftType[] = ["morning", "afternoon", "night"];
const roleMap: Record<Staff["role"], string> = { operator: "运营", supervisor: "主管", finance: "财务", admin: "管理员" };
const statusTag: Record<string, string> = { 准点: "tag-success", 迟到: "tag-warning", 未签退: "tag-danger" };
const invTag: Record<string, string> = { 已完成: "tag-success", 进行中: "tag-info", 待开始: "tag-warning" };

export default function Scheduling() {
  const { staff, shifts, handovers, zones, addShift } = useAppStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode] = useState<"week" | "month">("week");
  const [bottomTab, setBottomTab] = useState<"attendance" | "inventory">("attendance");
  const [modalOpen, setModalOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [editing, setEditing] = useState<{ staffId: string; date: string; shiftType?: ShiftType } | null>(null);
  const [formZoneId, setFormZoneId] = useState(zones[0]?.id || "");
  const [formShiftType, setFormShiftType] = useState<ShiftType>("morning");

  const today = new Date();
  const weekStart = useMemo(() => startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }), [today, weekOffset]);
  const weekDates = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);
  const shiftMap = useMemo(() => {
    const m = new Map<string, Shift>();
    shifts.forEach((s) => m.set(`${s.staffId}-${s.date}-${s.shiftType}`, s));
    return m;
  }, [shifts]);

  const getStaffName = (id: string) => staff.find((s) => s.id === id)?.name || "-";
  const getStaffColor = (id: string) => staff.find((s) => s.id === id)?.avatarColor || "#64748B";
  const getZoneNameShort = (id: string) => zones.find((z) => z.id === id)?.name.slice(0, 6) || "";

  const onSlotClick = (staffId: string, date: Date, shiftType?: ShiftType) => {
    setEditing({ staffId, date: format(date, "yyyy-MM-dd"), shiftType });
    setFormShiftType(shiftType || "morning");
    setFormZoneId(zones[0]?.id || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    const meta = shiftMeta[formShiftType];
    addShift({ id: `shift-${Date.now()}`, staffId: editing.staffId, zoneId: formZoneId, date: editing.date, shiftType: formShiftType, startTime: meta.start, endTime: meta.end });
    setModalOpen(false);
    setEditing(null);
  };

  const recentHandovers = useMemo((): HandoverRecord[] => {
    const now = Date.now();
    const extra: HandoverRecord[] = [
      { id: "hd2", zoneId: "zone-2", shiftDate: new Date().toISOString().slice(0, 10), previousStaffId: "st-5", nextStaffId: "st-6", storedCountOnShift: 246, abnormalCount: 0, lockerSnapshot: [], handoverAt: new Date(now - 2 * 3600 * 1000).toISOString(), previousSignature: "赵雅琴", nextSignature: "刘强" },
      { id: "hd3", zoneId: "zone-3", shiftDate: new Date().toISOString().slice(0, 10), previousStaffId: "st-3", nextStaffId: "st-8", storedCountOnShift: 62, abnormalCount: 2, lockerSnapshot: [], handoverAt: new Date(now - 5 * 3600 * 1000).toISOString(), previousSignature: "王晓婷", nextSignature: "吴天宇", remark: "儿童推车待核查2件" },
      { id: "hd4", zoneId: "zone-1", shiftDate: new Date(now - 24 * 3600 * 1000).toISOString().slice(0, 10), previousStaffId: "st-6", nextStaffId: "st-5", storedCountOnShift: 92, abnormalCount: 0, lockerSnapshot: [], handoverAt: new Date(now - 26 * 3600 * 1000).toISOString(), previousSignature: "刘强", nextSignature: "赵雅琴" },
    ];
    return [...handovers, ...extra].slice(0, 4);
  }, [handovers]);

  const attendanceRows = useMemo(() => staff.slice(0, 5).map((s, i) => {
    const base = Date.now() - i * 24 * 3600 * 1000;
    const statuses = ["准点", "准点", "迟到", "准点", "未签退"] as const;
    return { staffId: s.id, date: format(new Date(base), "yyyy-MM-dd"), shift: (["早班", "中班", "晚班"] as const)[i % 3], checkIn: format(new Date(base + 8.1 * 3600 * 1000), "HH:mm"), checkOut: i % 4 === 0 ? "-" : format(new Date(base + 15 * 3600 * 1000), "HH:mm"), status: statuses[i % 5] };
  }), [staff]);

  const inventoryTasks = useMemo(() => [
    { id: "t1", zone: zones[0]?.name || "", total: 120, done: 108, status: "进行中", due: "今日 18:00" },
    { id: "t2", zone: zones[1]?.name || "", total: 300, done: 0, status: "待开始", due: "明日 12:00" },
    { id: "t3", zone: zones[2]?.name || "", total: 200, done: 200, status: "已完成", due: "昨日" },
  ], [zones]);

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">人员排班</h1>
          <p className="text-sm text-slate-500 mt-1">管理班表、交接班与考勤盘点</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="w-4 h-4" /></button>
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setWeekOffset(0)}>本周</button>
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(["week", "month"] as const).map(v => (
              <button key={v} className={clsx("px-3 py-1.5 text-xs rounded-md font-medium transition-colors", viewMode === v ? "bg-navy-800 text-white" : "text-slate-600 hover:text-navy-800")}>
                {v === "week" ? "周视图" : "月视图"}
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={() => setHandoverOpen(true)}><HandCoins className="w-4 h-4" />交接班清点</button>
          <button className="btn-primary" onClick={() => { setEditing({ staffId: "", date: format(today, "yyyy-MM-dd") }); setModalOpen(true); }}><Plus className="w-4 h-4" />新建班次</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <KpiCard label="当前在班人数" value={5} subValue={`共 ${staff.length} 人`} variant="emerald" trend={{ value: "+2", up: true }} icon={<Users className="w-5 h-5" strokeWidth={2} />} />
        <KpiCard label="本周准点率" value="94.3%" subValue="7日平均" variant="blue" trend={{ value: "+1.2%", up: true }} icon={<Clock className="w-5 h-5" strokeWidth={2} />} />
        <KpiCard label="异常考勤" value={3} subValue="待处理" variant="rose" icon={<AlertTriangle className="w-5 h-5" strokeWidth={2} />} />
      </div>

      <div className="flex gap-5">
        <div className="flex-1 bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2"><CalendarClock className="w-4 h-4 text-blue-500" />本周排班 · {format(weekStart, "M月d日", { locale: zhCN })} - {format(addDays(weekStart, 6), "M月d日", { locale: zhCN })}</h3>
            <div className="flex items-center gap-2 text-[11px]">
              {Object.values(shiftMeta).map(v => (
                <span key={v.label} className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-inset", v.cls)}>{v.label} {v.start}-{v.end}</span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-3 text-left font-medium border-b border-slate-100 w-[140px]">人员 / 日期</th>
                  {weekDates.map((d, i) => {
                    const isToday = isSameDay(d, today);
                    return (
                      <th key={i} className="px-3 py-3 text-center font-medium border-b border-slate-100 min-w-[160px]">
                        <div className="text-[11px] text-slate-400">{weekDays[i]}</div>
                        <div className={clsx("inline-flex items-center gap-1.5 mt-0.5", isToday && "text-navy-800 font-semibold")}>
                          <span>{format(d, "M/d")}</span>
                          {isToday && <span className="tag-info">今日</span>}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2.5 border-b border-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ backgroundColor: s.avatarColor }}>{s.name[0]}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-navy-800 truncate">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{roleMap[s.role]}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((d, di) => {
                      const dateStr = format(d, "yyyy-MM-dd");
                      return (
                        <td key={di} className="px-1.5 py-2 align-top">
                          <div className="space-y-1">
                            {shiftTypes.map(st => {
                              const shift = shiftMap.get(`${s.id}-${dateStr}-${st}`);
                              const meta = shiftMeta[st];
                              return (
                                <div key={st} onClick={() => onSlotClick(s.id, d, shift ? undefined : st)}
                                  className={clsx("rounded-lg px-2 py-1.5 text-[11px] cursor-pointer transition-all ring-1 ring-inset",
                                    shift ? meta.cls : "bg-white hover:bg-slate-50 text-slate-300 ring-slate-100 border-dashed")}>
                                  {shift ? (
                                    <div>
                                      <div className="font-semibold">{meta.label} · {getZoneNameShort(shift.zoneId)}</div>
                                      <div className="opacity-80 tabular-nums">{shift.startTime}-{shift.endTime}</div>
                                    </div>
                                  ) : <div className="text-center font-medium">+ {meta.label}</div>}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-[340px] space-y-5 shrink-0">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" />今日概览</h3>
            <div className="space-y-3">
              {[
                { label: "在班人数", val: "5 人", cls: "emerald", Icon: CheckCircle2 },
                { label: "准点率", val: "95.2%", cls: "blue", Icon: Clock },
                { label: "异常考勤", val: "2 人", cls: "rose", Icon: AlertTriangle },
              ].map(({ label, val, cls, Icon }) => (
                <div key={label} className={clsx("flex items-center justify-between p-3 rounded-lg ring-1", cls === "emerald" ? "bg-emerald-50/50 ring-emerald-100" : cls === "blue" ? "bg-blue-50/50 ring-blue-100" : "bg-rose-50/50 ring-rose-100")}>
                  <div>
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-xl font-bold text-navy-800 font-display tabular-nums">{val}</div>
                  </div>
                  <Icon className={clsx("w-6 h-6", cls === "emerald" ? "text-emerald-500" : cls === "blue" ? "text-blue-500" : "text-rose-500")} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2"><ArrowRight className="w-4 h-4 text-violet-500" />最近交接班</h3>
              <span className="text-[11px] text-slate-400">共 {recentHandovers.length} 条</span>
            </div>
            <div className="divide-y divide-slate-50">
              {recentHandovers.map(h => (
                <div key={h.id} className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ backgroundColor: getStaffColor(h.previousStaffId) }}>{getStaffName(h.previousStaffId)[0]}</div>
                    <span className="text-navy-800 font-medium">{getStaffName(h.previousStaffId)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ backgroundColor: getStaffColor(h.nextStaffId) }}>{getStaffName(h.nextStaffId)[0]}</div>
                    <span className="text-navy-800 font-medium">{getStaffName(h.nextStaffId)}</span>
                    {h.abnormalCount > 0 && <span className="tag-danger ml-auto">异常 {h.abnormalCount}</span>}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Archive className="w-3 h-3" />在存件 {h.storedCountOnShift}</span>
                    <span className="tabular-nums">{format(new Date(h.handoverAt), "MM-dd HH:mm")}</span>
                  </div>
                  {h.remark && <div className="mt-1 text-[11px] text-amber-600">⚠ {h.remark}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="section-title mb-4 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-500" />本月盘点进度</h3>
            <div className="space-y-4">
              {[{ label: "已盘点", cur: 486, total: 700, cls: "from-emerald-400 to-teal-500", txtCls: "text-emerald-600" },
                { label: "待盘点", cur: 214, total: 700, cls: "from-amber-400 to-orange-500", txtCls: "text-amber-600" }].map(p => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">{p.label}</span>
                    <span className={clsx("font-semibold tabular-nums", p.txtCls)}>{p.cur} / {p.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={clsx("h-full bg-gradient-to-r rounded-full", p.cls)} style={{ width: `${(p.cur / p.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1">
          {[{ key: "attendance", label: "考勤记录", Icon: Clock }, { key: "inventory", label: "库存盘点", Icon: ClipboardList }].map(t => (
            <button key={t.key} onClick={() => setBottomTab(t.key as typeof bottomTab)}
              className={clsx("inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                bottomTab === t.key ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-navy-800 hover:bg-slate-50")}>
              <t.Icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {bottomTab === "attendance" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>人员</th><th>日期</th><th>班次</th><th>签到</th><th>签退</th><th>状态</th></tr></thead>
              <tbody>
                {attendanceRows.map(r => (
                  <tr key={`${r.staffId}-${r.date}`}>
                    <td><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold" style={{ backgroundColor: getStaffColor(r.staffId) }}>{getStaffName(r.staffId)[0]}</div><span className="text-navy-800">{getStaffName(r.staffId)}</span></div></td>
                    <td className="tabular-nums text-slate-600">{r.date}</td>
                    <td>{r.shift}</td>
                    <td className="tabular-nums text-slate-600">{r.checkIn}</td>
                    <td className="tabular-nums text-slate-600">{r.checkOut}</td>
                    <td><span className={statusTag[r.status]}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bottomTab === "inventory" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>寄存区</th><th>柜位总数</th><th>进度</th><th>状态</th><th>截止时间</th><th className="text-right">操作</th></tr></thead>
              <tbody>
                {inventoryTasks.map(t => {
                  const pct = Math.round((t.done / t.total) * 100);
                  return (
                    <tr key={t.id}>
                      <td className="text-navy-800 font-medium">{t.zone}</td>
                      <td className="tabular-nums text-slate-600">{t.done} / {t.total}</td>
                      <td className="w-48"><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${pct}%` }} /></div></td>
                      <td><span className={invTag[t.status]}>{t.status}</span></td>
                      <td className="tabular-nums text-slate-600">{t.due}</td>
                      <td className="text-right"><button className="text-xs text-blue-600 hover:text-blue-700 font-medium">查看详情 →</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing?.shiftType ? "分配班次" : "新建班次"}
        footer={<><button className="btn-secondary" onClick={closeModal}>取消</button><button className="btn-primary" onClick={handleSave}>确认保存</button></>}>
        <div className="space-y-4">
          <div><label className="label">员工</label>
            <select className="input-base" value={editing?.staffId || ""} onChange={e => setEditing(p => p ? { ...p, staffId: e.target.value } : p)}>
              <option value="">请选择员工</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">班次日期</label>
            <input type="date" className="input-base" value={editing?.date || ""} onChange={e => setEditing(p => p ? { ...p, date: e.target.value } : p)} />
          </div>
          <div><label className="label">班次类型</label>
            <div className="grid grid-cols-3 gap-2">
              {shiftTypes.map(st => {
                const m = shiftMeta[st];
                return (
                  <button key={st} type="button" onClick={() => setFormShiftType(st)}
                    className={clsx("p-3 rounded-lg border-2 transition-all text-left",
                      formShiftType === st ? `${m.cls} border-current` : "bg-white border-slate-200 hover:border-slate-300 text-slate-600")}>
                    <div className="font-semibold text-sm">{m.label}</div>
                    <div className="text-[11px] opacity-80 mt-0.5 tabular-nums">{m.start} - {m.end}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div><label className="label">寄存区</label>
            <select className="input-base" value={formZoneId} onChange={e => setFormZoneId(e.target.value)}>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <HandoverFormModal open={handoverOpen} onClose={() => setHandoverOpen(false)} />
    </div>
  );
}
