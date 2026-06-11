import { useMemo, useState } from "react";
import {
  AlertTriangle, Clock, ShieldCheck, CheckCircle2, ChevronDown, Plus,
  Calendar as CalendarIcon, User, MapPin, FileText, DollarSign, Eye,
  Play, Send, CheckSquare, X, Camera, Check,
} from "lucide-react";
import { format, formatDistanceToNow, isSameMonth, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import { Incident as IncidentRecord, IncidentStatus, IncidentType } from "@/types";
import { Drawer } from "@/components/Tooltip";
import KpiCard from "@/components/KpiCard";

const typeMap: Record<IncidentType, { text: string; cls: string }> = {
  lost: { text: "遗失", cls: "tag-danger" },
  damaged: { text: "破损", cls: "tag-warning" },
  complaint: { text: "投诉", cls: "tag-info" },
  other: { text: "其他", cls: "tag-slate" },
};
const statusMap: Record<IncidentStatus, { text: string; cls: string }> = {
  pending: { text: "待处理", cls: "tag-danger" },
  processing: { text: "处理中", cls: "tag-warning" },
  approving: { text: "待审批", cls: "tag-info" },
  resolved: { text: "已结案", cls: "tag-success" },
  closed: { text: "已关闭", cls: "tag-slate" },
};
const columns = [
  { status: ["pending"] as IncidentStatus[], title: "待处理", bg: "bg-rose-50" },
  { status: ["processing"] as IncidentStatus[], title: "处理中", bg: "bg-amber-50" },
  { status: ["approving"] as IncidentStatus[], title: "待审批", bg: "bg-sky-50" },
  { status: ["resolved", "closed"] as IncidentStatus[], title: "已处理", bg: "bg-emerald-50" },
];
const typeOpt = [
  { value: "all" as const, label: "全部类型" },
  { value: "lost" as const, label: "遗失" },
  { value: "damaged" as const, label: "破损" },
  { value: "complaint" as const, label: "投诉" },
  { value: "other" as const, label: "其他" },
];
const tabOpt = [
  { value: "all" as const, label: "全部" },
  { value: "pending" as const, label: "待处理" },
  { value: "processing" as const, label: "处理中" },
  { value: "approving" as const, label: "待审批" },
  { value: "resolved" as const, label: "已结案" },
];

function IncidentCard({ incident, onClick }: { incident: IncidentRecord; onClick: () => void }) {
  const { staff, zones } = useAppStore();
  const handler = staff.find((s) => s.id === incident.handler);
  const rpt = staff.find((s) => s.id === incident.reportedBy);
  const t = typeMap[incident.type];
  const zoneName = zones.find((z) => z.id === incident.zoneId)?.name || "-";
  const actionBtn = useMemo(() => {
    switch (incident.status) {
      case "pending": return { text: "开始处理", cls: "btn-primary", icon: <Play className="w-3.5 h-3.5" /> };
      case "processing": return { text: "提交审批", cls: "btn-primary", icon: <Send className="w-3.5 h-3.5" /> };
      case "approving": return { text: "查看审批", cls: "btn-secondary", icon: <Eye className="w-3.5 h-3.5" /> };
      default: return { text: "查看详情", cls: "btn-ghost", icon: <Eye className="w-3.5 h-3.5" /> };
    }
  }, [incident.status]);
  return (
    <div onClick={onClick} className="bg-white rounded-xl p-3 shadow-card mb-3 cursor-pointer hover:shadow-card-hover transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-2">
        <span className={t.cls}>{t.text}</span>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {formatDistanceToNow(parseISO(incident.reportedAt), { addSuffix: true, locale: zhCN })}
        </span>
      </div>
      <div className="font-semibold text-navy-800 text-sm leading-snug mb-0.5 truncate">{incident.title}</div>
      <div className="text-[11px] text-slate-400 font-mono mb-2">#{incident.id.slice(4).toUpperCase()}</div>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{incident.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
            style={{ backgroundColor: handler?.avatarColor || rpt?.avatarColor || "#64748b" }}>
            {(handler?.name || rpt?.name || "?").charAt(0)}
          </div>
          <span className="text-[11px] text-slate-500 truncate max-w-[80px]">{handler?.name || rpt?.name || "未指派"}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={clsx("!px-2 !py-1 text-[11px]", actionBtn.cls)}>
          {actionBtn.icon}{actionBtn.text}
        </button>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400 flex items-center gap-1">
        <MapPin className="w-3 h-3 shrink-0" /><span className="truncate">{zoneName}</span>
      </div>
    </div>
  );
}

function Sel({ value, onChange, children, icon }: any) {
  return (
    <div className="relative">
      {icon && <div className={`absolute ${icon.left ? "left-2.5" : "right-2.5"} top-1/2 -translate-y-1/2 pointer-events-none`}>{icon.el}</div>}
      <select value={value} onChange={onChange} className={clsx(
        "appearance-none bg-white border border-slate-200 rounded-lg py-2 text-sm text-navy-800 shadow-sm",
        "focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all cursor-pointer",
        icon?.left ? "pl-8" : "pl-3", "pr-9"
      )}>{children}</select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export default function Incident() {
  const { incidents, zones, staff, updateIncidentStatus } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");
  const [statusTab, setStatusTab] = useState<IncidentStatus | "all">("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selected, setSelected] = useState<IncidentRecord | null>(null);
  const [approveComment, setApproveComment] = useState("");

  const counts = useMemo(() => {
    const now = new Date();
    return {
      pending: incidents.filter((i) => i.status === "pending").length,
      processing: incidents.filter((i) => i.status === "processing").length,
      approving: incidents.filter((i) => i.status === "approving" && i.compensationAmount > 0).length,
      resolvedThisMonth: incidents.filter(
        (i) => (i.status === "resolved" || i.status === "closed") && i.resolvedAt && isSameMonth(parseISO(i.resolvedAt), now)
      ).length,
    };
  }, [incidents]);

  const filtered = useMemo(() => incidents.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (statusTab !== "all" && i.status !== statusTab) return false;
    if (zoneFilter !== "all" && i.zoneId !== zoneFilter) return false;
    if (dateRange !== "all") {
      const d = parseISO(i.reportedAt);
      if (dateRange === "today" && d.toDateString() !== new Date().toDateString()) return false;
      if (dateRange === "7d" && Date.now() - d.getTime() > 7 * 86400000) return false;
      if (dateRange === "30d" && Date.now() - d.getTime() > 30 * 86400000) return false;
    }
    return true;
  }), [incidents, typeFilter, statusTab, zoneFilter, dateRange]);

  const grouped = useMemo(() => {
    const r: Record<string, IncidentRecord[]> = {};
    columns.forEach((c) => { r[c.title] = filtered.filter((i) => c.status.includes(i.status)); });
    return r;
  }, [filtered]);

  const sn = (id?: string) => staff.find((s) => s.id === id)?.name || "-";
  const zn = (id: string) => zones.find((z) => z.id === id)?.name || "-";

  const updateStatus = (next: IncidentStatus) => {
    if (!selected) return;
    const patch: Partial<IncidentRecord> = {};
    if (next === "processing" && !selected.handler) patch.handler = useAppStore.getState().currentUser?.id;
    if (approveComment && (next === "resolved" || next === "closed"))
      patch.resolution = approveComment + (selected.resolution ? " — " + selected.resolution : "");
    updateIncidentStatus(selected.id, next, patch);
    setSelected(null); setApproveComment("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="page-header flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">异常事件中心</h1>
          <p className="text-sm text-slate-500 mt-1">统一管理遗失、破损、投诉等异常事件</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Sel value={typeFilter} onChange={(e: any) => setTypeFilter(e.target.value)}>
              {typeOpt.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Sel>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              {tabOpt.map((t) => (
                <button key={t.value} onClick={() => setStatusTab(t.value)} className={clsx(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  statusTab === t.value ? "bg-navy-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                )}>{t.label}</button>
              ))}
            </div>
            <Sel value={zoneFilter} onChange={(e: any) => setZoneFilter(e.target.value)}>
              <option value="all">全部寄存区</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </Sel>
            <Sel value={dateRange} onChange={(e: any) => setDateRange(e.target.value)} icon={{ left: true, el: <CalendarIcon className="w-4 h-4 text-slate-400" /> }}>
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
            </Sel>
          </div>
          <button className="btn-danger"><Plus className="w-4 h-4" />登记新事件</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="待处理" value={counts.pending} variant="rose" trend={{ value: "+12%", up: false }} icon={<AlertTriangle className="w-5 h-5" strokeWidth={2} />} />
        <KpiCard label="处理中" value={counts.processing} variant="amber" trend={{ value: "-5%", up: true }} icon={<Clock className="w-5 h-5" strokeWidth={2} />} />
        <KpiCard label="待审批赔付" value={counts.approving} variant="sky" trend={{ value: "+3%", up: false }} icon={<ShieldCheck className="w-5 h-5" strokeWidth={2} />} />
        <KpiCard label="本月已结案" value={counts.resolvedThisMonth} variant="emerald" trend={{ value: "+28%", up: true }} icon={<CheckCircle2 className="w-5 h-5" strokeWidth={2} />} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {columns.map((col) => (
          <div key={col.title} className={clsx("w-[280px] shrink-0", col.bg, "rounded-xl p-3")}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-sm text-navy-800">{col.title}</h3>
              <span className="bg-white/80 text-navy-700 text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums">
                {grouped[col.title]?.length || 0}
              </span>
            </div>
            {grouped[col.title]?.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onClick={() => setSelected(inc)} />
            ))}
            {(!grouped[col.title] || grouped[col.title].length === 0) && (
              <div className="text-center py-8 text-xs text-slate-400">暂无事件</div>
            )}
          </div>
        ))}
      </div>

      <Drawer open={!!selected} onClose={() => { setSelected(null); setApproveComment(""); }} width="w-[520px]"
        title={selected && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={typeMap[selected.type].cls}>{typeMap[selected.type].text}</span>
            <span className={statusMap[selected.status].cls}>{statusMap[selected.status].text}</span>
            <span className="text-xs text-slate-400 font-mono ml-auto">#{selected.id.slice(4).toUpperCase()}</span>
          </div>
        )}>
        {selected && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-navy-900 font-display mb-1">{selected.title}</h2>
              <p className="text-sm text-slate-500">于 {format(parseISO(selected.reportedAt), "yyyy-MM-dd HH:mm")} 上报</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 text-sm">
              <div><div className="label">寄存区</div><div className="text-navy-800 font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{zn(selected.zoneId)}</div></div>
              <div><div className="label">关联订单号</div>{selected.orderNo ? (
                <div className="text-blue-600 font-mono font-medium cursor-pointer hover:underline">{selected.orderNo}</div>
              ) : <div className="text-slate-400">-</div>}</div>
              <div><div className="label">上报人</div><div className="text-navy-800 font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{sn(selected.reportedBy)}</div></div>
              <div><div className="label">处理人</div><div className="text-navy-800 font-medium flex items-center gap-1.5">
                {selected.handler ? (<>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: staff.find((s) => s.id === selected.handler)?.avatarColor || "#64748b" }}>
                    {sn(selected.handler).charAt(0)}
                  </div>{sn(selected.handler)}
                </>) : <span className="text-slate-400">未指派</span>}
              </div></div>
            </div>
            <div>
              <h4 className="section-title text-sm mb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" />事件描述</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-white rounded-lg p-3 border border-slate-100">{selected.description}</p>
            </div>
            <div>
              <h4 className="section-title text-sm mb-2 flex items-center gap-1.5"><Camera className="w-4 h-4 text-slate-400" />取证照片</h4>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const hp = idx < selected.photos.length;
                  return (
                    <div key={idx} className="aspect-square rounded-lg bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {hp ? (<div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-500"><Camera className="w-5 h-5" /></div>)
                        : <span className="text-slate-300 text-2xl font-light">+</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {(selected.compensationAmount > 0 || selected.status === "approving") && (
              <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl p-4 border border-sky-100">
                <h4 className="section-title text-sm mb-3 flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-sky-500" />赔付信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-500">申请赔付金额</span>
                    <span className="font-bold text-lg text-navy-800 font-display tabular-nums">¥{selected.compensationAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">责任判定</span><span className="text-navy-700 font-medium">寄存方主要责任</span></div>
                  {selected.resolution && (<div className="pt-2 mt-2 border-t border-sky-100"><div className="text-slate-500 mb-1">赔付说明</div><div className="text-navy-700">{selected.resolution}</div></div>)}
                </div>
              </div>
            )}
            {selected.status === "approving" && (
              <div className="space-y-3 bg-rose-50/50 rounded-xl p-4 border border-rose-100">
                <h4 className="section-title text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-rose-500" />审批操作</h4>
                <div><div className="label">审批意见</div>
                  <textarea className={clsx("input-base", "min-h-[80px] resize-none")} placeholder="请输入审批意见..."
                    value={approveComment} onChange={(e) => setApproveComment(e.target.value)} /></div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus("resolved")} className="btn-success flex-1"><Check className="w-4 h-4" />批准赔付</button>
                  <button onClick={() => updateStatus("closed")} className="btn-danger flex-1"><X className="w-4 h-4" />驳回</button>
                </div>
              </div>
            )}
            <div>
              <h4 className="section-title text-sm mb-4 flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-slate-400" />操作记录</h4>
              <div className="relative pl-6 space-y-5">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
                {[
                  { active: true, color: "bg-rose-500", icon: <AlertTriangle className="w-2 h-2 text-white" />, title: "事件上报", desc: `${sn(selected.reportedBy)} · ${format(parseISO(selected.reportedAt), "yyyy-MM-dd HH:mm")}` },
                  { active: !!selected.handler, color: "bg-amber-500", icon: <Play className="w-2 h-2 text-white" />, title: "派单处理", desc: `指派 ${sn(selected.handler)} 处理` },
                  { active: selected.status === "approving", color: "bg-sky-500", icon: <Send className="w-2 h-2 text-white" />, title: "提交审批", desc: "等待主管审批赔付方案" },
                  { active: !!selected.resolvedAt, color: "bg-emerald-500", icon: <Check className="w-2 h-2 text-white" />, title: "案件结案", desc: `${selected.approver ? `${selected.approver} 审批通过 · ` : ""}${selected.resolvedAt ? format(parseISO(selected.resolvedAt), "yyyy-MM-dd HH:mm") : ""}` },
                ].filter((x) => x.active).map((t, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-6 w-4 h-4 rounded-full ${t.color} border-2 border-white shadow-sm flex items-center justify-center`}>{t.icon}</div>
                    <div className="text-sm font-medium text-navy-800">{t.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
