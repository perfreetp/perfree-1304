import { useMemo, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  ChevronDown,
  AlertTriangle,
  Clock,
  Building2,
} from "lucide-react";
import { clsx } from "clsx";
import KpiCard, { KpiIcons } from "@/components/KpiCard";
import CapacityHeatmap from "@/components/CapacityHeatmap";
import { useAppStore } from "@/store";
import { StorageOrder, Incident } from "@/types";

const orderStatusMap: Record<StorageOrder["status"], { text: string; cls: string }> = {
  stored: { text: "寄存中", cls: "tag-info" },
  picked: { text: "已取件", cls: "tag-success" },
  overtime: { text: "已超时", cls: "tag-warning" },
  abnormal: { text: "异常", cls: "tag-danger" },
  refunded: { text: "已退款", cls: "tag-slate" },
};

const incidentStatusMap: Record<Incident["status"], { text: string; cls: string }> = {
  pending: { text: "待处理", cls: "tag-danger" },
  processing: { text: "处理中", cls: "tag-warning" },
  approving: { text: "待审批", cls: "tag-info" },
  resolved: { text: "已解决", cls: "tag-success" },
  closed: { text: "已关闭", cls: "tag-slate" },
};

const lineData = [
  { day: "周一", orders: 186, revenue: 6800 },
  { day: "周二", orders: 242, revenue: 8900 },
  { day: "周三", orders: 208, revenue: 7500 },
  { day: "周四", orders: 278, revenue: 10200 },
  { day: "周五", orders: 310, revenue: 11800 },
  { day: "周六", orders: 294, revenue: 11200 },
  { day: "周日", orders: 328, revenue: 12580 },
];

const pieData = [
  { name: "拉杆箱", value: 45, color: "#2563EB" },
  { name: "背包", value: 28, color: "#10B981" },
  { name: "手提包", value: 15, color: "#F59E0B" },
  { name: "纸箱", value: 8, color: "#8B5CF6" },
  { name: "其他", value: 4, color: "#64748B" },
];

export default function Dashboard() {
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const zones = useAppStore((s) => s.zones);
  const orders = useAppStore((s) => s.orders);
  const incidents = useAppStore((s) => s.incidents);

  const todayText = useMemo(
    () => format(new Date(), "yyyy年MM月dd日 EEEE", { locale: zhCN }),
    []
  );

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const pendingIncidents = useMemo(
    () => incidents.filter((i) => i.status === "pending" || i.status === "processing").slice(0, 3),
    [incidents]
  );

  const overtimeOrders = useMemo(
    () => orders.filter((o) => o.status === "overtime").slice(0, 3),
    [orders]
  );

  const getZoneName = (zoneId: string) => zones.find((z) => z.id === zoneId)?.name || "-";
  const getZoneLocation = (zoneId: string) => zones.find((z) => z.id === zoneId)?.location || "-";

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">运营总览</h1>
          <p className="text-sm text-slate-500 mt-1">实时掌握业务数据与运营状态</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{todayText}</span>
          </div>
          <div className="relative">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm text-navy-800 font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all cursor-pointer"
            >
              <option value="all">全部门店</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        <KpiCard label="今日寄存单" value={328} variant="blue" trend={{ value: "+12.4%", up: true }} icon={KpiIcons.orders} />
        <KpiCard label="在存件数" value={395} variant="emerald" icon={KpiIcons.stored} />
        <KpiCard label="今日营收" value="¥12,580" variant="violet" trend={{ value: "+8.6%", up: true }} icon={KpiIcons.revenue} />
        <KpiCard label="柜位使用率" value="76.4%" variant="sky" icon={KpiIcons.usage} />
        <KpiCard label="超时单" value={23} variant="amber" icon={KpiIcons.overtime} />
        <KpiCard label="异常" value={5} variant="rose" trend={{ value: "-3", up: true }} icon={KpiIcons.incident} />
      </div>

      <CapacityHeatmap />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">近7天寄存量 & 营收趋势</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-0.5 rounded bg-blue-500" />
                寄存量
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-0.5 rounded bg-emerald-500" />
                营收(¥)
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                <ReTooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(15,39,71,0.08)" }}
                  labelStyle={{ color: "#0F2747", fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ display: "none" }} />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="寄存量" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} name="营收" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="section-title mb-4">寄存类型占比</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <ReTooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(15,39,71,0.08)" }}
                  formatter={(value: number) => [`${value}%`, "占比"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
                <span className="ml-auto font-semibold text-navy-800 tabular-nums">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="section-title">最近订单</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">查看全部 →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>单号</th>
                  <th>客户</th>
                  <th>寄存区</th>
                  <th>柜位</th>
                  <th>存入时间</th>
                  <th>状态</th>
                  <th className="text-right">金额</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = orderStatusMap[o.status];
                  return (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-navy-700 font-medium">{o.orderNo}</td>
                      <td className="text-navy-800">{o.customerName}</td>
                      <td>
                        <div className="text-sm text-navy-800">{getZoneName(o.zoneId)}</div>
                        <div className="text-[11px] text-slate-400">{getZoneLocation(o.zoneId)}</div>
                      </td>
                      <td className="font-mono text-xs text-slate-600">{o.lockerIds.length} 柜</td>
                      <td className="text-xs text-slate-600 tabular-nums">
                        {format(new Date(o.checkedInAt), "MM-dd HH:mm")}
                      </td>
                      <td><span className={st.cls}>{st.text}</span></td>
                      <td className="text-right font-semibold text-navy-800 tabular-nums">¥{o.totalFee}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                待处理异常
              </h3>
              <span className="tag-danger">{pendingIncidents.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingIncidents.map((inc) => {
                const st = incidentStatusMap[inc.status];
                return (
                  <div key={inc.id} className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-navy-800 truncate">{inc.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{getZoneName(inc.zoneId)}</span>
                          <span>·</span>
                          <span>{format(new Date(inc.reportedAt), "HH:mm")}</span>
                        </div>
                      </div>
                      <span className={clsx(st.cls, "shrink-0")}>{st.text}</span>
                    </div>
                  </div>
                );
              })}
              {pendingIncidents.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">暂无待处理异常</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                超时未取
              </h3>
              <span className="tag-warning">{overtimeOrders.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {overtimeOrders.map((o) => (
                <div key={o.id} className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-navy-800 truncate">
                        {o.orderNo} · {o.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        超时费 ¥{o.overtimeFee} · 待付 ¥{o.totalFee - o.paidAmount}
                      </div>
                    </div>
                    <span className="tag-warning">催取</span>
                  </div>
                </div>
              ))}
              {overtimeOrders.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">暂无超时订单</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
