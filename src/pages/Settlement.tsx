import { useMemo, useState } from "react";
import { format, subDays, startOfMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  CalendarRange, Download, CheckSquare, ChevronDown, Wallet,
  CircleDollarSign, Clock, Shield, TrendingDown, TrendingUp,
  Eye, FileText, Receipt, BadgePercent, ShieldAlert, MapPin, X,
} from "lucide-react";
import { clsx } from "clsx";
import KpiCard from "@/components/KpiCard";
import { Drawer } from "@/components/Tooltip";
import { useAppStore } from "@/store";
import { FinanceRecord, Incident } from "@/types";

type RangeKey = "7d" | "today" | "month" | "custom";
type TabKey = "daily" | "zone" | "discount" | "compensation";

const rangeLabels: Record<RangeKey, string> = { "7d": "近7日", today: "今日", month: "本月", custom: "自定义" };
const fmtRMB = (n: number) => `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 0 })}`;
const methodMap: Record<string, string> = { wechat: "微信", alipay: "支付宝", cash: "现金", card: "刷卡", offset: "抵扣" };
const incTypeMap: Record<string, string> = { lost: "遗失", damaged: "破损", other: "其他" };
const incStatusMap: Record<string, string> = { pending: "驳回", processing: "驳回", approving: "待批", resolved: "已付", closed: "已付" };

export default function Settlement() {
  const { financeRecords, staff, zones, incidents } = useAppStore();
  const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<TabKey>("daily");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<FinanceRecord | null>(null);

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || "-";
  const getZoneName = (id: string) => zones.find(z => z.id === id)?.name || "-";

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    let startTs: number;
    if (rangeKey === "today") { const d = new Date(); d.setHours(0, 0, 0, 0); startTs = d.getTime(); }
    else if (rangeKey === "month") startTs = startOfMonth(new Date()).getTime();
    else startTs = subDays(new Date(), 7).getTime();
    return financeRecords.filter(r => {
      const ts = new Date(r.happenedAt).getTime();
      return ts >= startTs && ts <= now && (zoneFilter === "all" || r.zoneId === zoneFilter);
    });
  }, [financeRecords, rangeKey, zoneFilter]);

  const sumBy = (pred: (r: FinanceRecord) => boolean) => filteredRecords.filter(pred).reduce((s, r) => s + r.amount, 0);
  const totalIncome = sumBy(r => r.direction === "income");
  const totalExpense = sumBy(r => r.direction === "expense");
  const storageFee = sumBy(r => r.type === "storage_fee");
  const overtimeFee = sumBy(r => r.type === "overtime_fee");
  const insuranceFee = sumBy(r => r.type === "insurance_fee");

  const dailyRows = useMemo(() => {
    const m = new Map<string, { date: string; orders: number; storage: number; overtime: number; insurance: number; discount: number }>();
    filteredRecords.forEach(r => {
      const d = format(new Date(r.happenedAt), "yyyy-MM-dd");
      if (!m.has(d)) m.set(d, { date: d, orders: 0, storage: 0, overtime: 0, insurance: 0, discount: 0 });
      const row = m.get(d)!;
      if (r.type === "storage_fee") { row.storage += r.amount; row.orders += 1; }
      else if (r.type === "overtime_fee") row.overtime += r.amount;
      else if (r.type === "insurance_fee") row.insurance += r.amount;
      else if (r.type === "discount") row.discount += r.amount;
    });
    return Array.from(m.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRecords]);

  const dt = dailyRows.reduce((a, r) => {
    a.orders += r.orders; a.storage += r.storage; a.overtime += r.overtime; a.insurance += r.insurance; a.discount += r.discount;
    return a;
  }, { orders: 0, storage: 0, overtime: 0, insurance: 0, discount: 0 });

  const zoneRows = useMemo(() => {
    const m = new Map<string, { zoneId: string; name: string; storage: number; overtime: number; insurance: number; total: number; ratio: number }>();
    filteredRecords.filter(r => r.direction === "income").forEach(r => {
      if (!m.has(r.zoneId)) m.set(r.zoneId, { zoneId: r.zoneId, name: getZoneName(r.zoneId), storage: 0, overtime: 0, insurance: 0, total: 0, ratio: 0.7 });
      const row = m.get(r.zoneId)!;
      if (r.type === "storage_fee") row.storage += r.amount;
      else if (r.type === "overtime_fee") row.overtime += r.amount;
      else if (r.type === "insurance_fee") row.insurance += r.amount;
    });
    const arr = Array.from(m.values());
    const sum = arr.reduce((s, r) => s + r.storage + r.overtime + r.insurance, 0) || 1;
    arr.forEach(r => { r.total = r.storage + r.overtime + r.insurance; r.ratio = +((r.total / sum) * 0.7 + 0.25).toFixed(2); });
    return arr;
  }, [filteredRecords]);

  const discountRows = useMemo(() =>
    filteredRecords.filter(r => r.type === "discount").map(r => ({
      id: r.id, time: r.happenedAt, orderNo: r.orderNo || "-",
      type: (r.remark || "").includes("VIP") ? "优惠券" : (r.remark || "").includes("团体") ? "会员折扣" : "手动减免",
      amount: r.amount, operatorId: r.operatorId, remark: r.remark || "-",
    })), [filteredRecords]);

  const compRows = useMemo(() =>
    incidents.filter((i: Incident) => i.compensationAmount > 0).map((i: Incident) => ({
      id: i.id, time: i.reportedAt, event: i.title, amount: i.compensationAmount,
      type: incTypeMap[i.type] || "其他", applicant: getStaffName(i.reportedBy),
      approver: i.approver || "-", status: incStatusMap[i.status] || "待批",
    })), [incidents]);

  const openDrawer = (r: FinanceRecord) => { setDrawerRecord(r); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setDrawerRecord(null); };

  const incomeTypeLabel = (t: string) => t === "storage_fee" ? "寄存费" : t === "overtime_fee" ? "超时费" : "保价费";
  const expenseTypeLabel = (t: string) => t === "discount" ? "优惠抵扣" : "赔付支出";
  const directionTypeLabel = (r: FinanceRecord) => r.direction === "income" ? incomeTypeLabel(r.type) : expenseTypeLabel(r.type);
  const methodFull = (m: string) => methodMap[m] || m;
  const discTagCls = (t: string) => t === "优惠券" ? "tag-info" : t === "会员折扣" ? "tag-success" : "tag-warning";

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display tracking-tight">财务结算</h1>
          <p className="text-sm text-slate-500 mt-1">营收概览、门店分账与赔付台账</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2 text-sm text-navy-800 font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all cursor-pointer">
              <option value="all">全部门店</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {(Object.keys(rangeLabels) as RangeKey[]).map(k => (
              <button key={k} onClick={() => setRangeKey(k)}
                className={clsx("px-3 py-1.5 text-xs rounded-md font-medium transition-colors inline-flex items-center gap-1",
                  rangeKey === k ? "bg-navy-800 text-white" : "text-slate-600 hover:text-navy-800")}>
                {k === "custom" && <CalendarRange className="w-3.5 h-3.5" />}{rangeLabels[k]}
              </button>
            ))}
          </div>
          <button className="btn-secondary"><Download className="w-4 h-4" />导出报表</button>
          <button className="btn-primary"><CheckSquare className="w-4 h-4" />对账确认</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <KpiCard label="总收入" value={fmtRMB(totalIncome)} variant="violet" trend={{ value: "+8.6%", up: true }} icon={<CircleDollarSign className="w-5 h-5" strokeWidth={2} />} subValue="本月累计" />
        <KpiCard label="寄存费" value={fmtRMB(storageFee)} variant="blue" trend={{ value: "+6.2%", up: true }} icon={<Wallet className="w-5 h-5" strokeWidth={2} />} subValue="占比 65%" />
        <KpiCard label="超时费" value={fmtRMB(overtimeFee)} variant="amber" trend={{ value: "+12.3%", up: true }} icon={<Clock className="w-5 h-5" strokeWidth={2} />} subValue="占比 15%" />
        <KpiCard label="保价收入" value={fmtRMB(insuranceFee)} variant="emerald" trend={{ value: "+4.1%", up: true }} icon={<Shield className="w-5 h-5" strokeWidth={2} />} subValue="占比 20%" />
        <KpiCard label="总支出" value={fmtRMB(totalExpense)} variant="rose" trend={{ value: "-2.8%", up: false }} icon={<TrendingDown className="w-5 h-5" strokeWidth={2} />} subValue="优惠+赔付" />
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1">
          {[{ k: "daily", l: "日结报表", I: FileText }, { k: "zone", l: "门店分账", I: MapPin },
            { k: "discount", l: "优惠与抵扣", I: BadgePercent }, { k: "compensation", l: "赔付台账", I: ShieldAlert }].map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k as TabKey)}
              className={clsx("inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === t.k ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-navy-800 hover:bg-slate-50")}>
              <t.I className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>

        {activeTab === "daily" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>日期</th><th>寄存单数</th><th>寄存费</th><th>超时费</th><th>保价费</th><th>优惠抵扣</th><th className="text-right">实收合计</th><th className="text-right">操作</th></tr></thead>
              <tbody>
                {dailyRows.map(r => {
                  const t = r.storage + r.overtime + r.insurance - r.discount;
                  return (
                    <tr key={r.date}>
                      <td className="tabular-nums text-navy-800 font-medium">{r.date}</td>
                      <td className="tabular-nums">{r.orders}</td>
                      <td className="tabular-nums">{fmtRMB(r.storage)}</td>
                      <td className="tabular-nums">{fmtRMB(r.overtime)}</td>
                      <td className="tabular-nums">{fmtRMB(r.insurance)}</td>
                      <td className="tabular-nums text-rose-600">-{fmtRMB(r.discount)}</td>
                      <td className="text-right font-semibold text-navy-800 tabular-nums">{fmtRMB(t)}</td>
                      <td className="text-right"><button className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"><Eye className="w-3 h-3" />明细</button></td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50/80 font-semibold">
                  <td className="text-navy-800">合计</td><td className="tabular-nums text-navy-800">{dt.orders}</td>
                  <td className="tabular-nums text-navy-800">{fmtRMB(dt.storage)}</td><td className="tabular-nums text-navy-800">{fmtRMB(dt.overtime)}</td>
                  <td className="tabular-nums text-navy-800">{fmtRMB(dt.insurance)}</td><td className="tabular-nums text-rose-600">-{fmtRMB(dt.discount)}</td>
                  <td className="text-right text-emerald-600 tabular-nums text-base">{fmtRMB(dt.storage + dt.overtime + dt.insurance - dt.discount)}</td><td />
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "zone" && (
          <div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>寄存区</th><th>寄存费</th><th>超时费</th><th>保价费</th><th>收入小计</th><th>分账比例</th><th className="text-right">分账金额</th></tr></thead>
                <tbody>
                  {zoneRows.map(r => (
                    <tr key={r.zoneId}>
                      <td className="text-navy-800 font-medium">{r.name}</td>
                      <td className="tabular-nums">{fmtRMB(r.storage)}</td><td className="tabular-nums">{fmtRMB(r.overtime)}</td>
                      <td className="tabular-nums">{fmtRMB(r.insurance)}</td><td className="tabular-nums font-medium text-navy-800">{fmtRMB(r.total)}</td>
                      <td><span className="tag-info">{Math.round(r.ratio * 100)}%</span></td>
                      <td className="text-right font-semibold text-emerald-600 tabular-nums">{fmtRMB(Math.round(r.total * r.ratio))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">共 {zoneRows.length} 个寄存区，分账金额为系统估算，最终以合同约定为准</span>
              <button className="btn-primary"><FileText className="w-4 h-4" />生成分账单</button>
            </div>
          </div>
        )}

        {activeTab === "discount" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>时间</th><th>订单号</th><th>类型</th><th>抵扣金额</th><th>操作人</th><th>备注</th></tr></thead>
              <tbody>
                {discountRows.map(r => (
                  <tr key={r.id}>
                    <td className="tabular-nums text-xs text-slate-600">{format(new Date(r.time), "yyyy-MM-dd HH:mm")}</td>
                    <td className="font-mono text-xs text-navy-700 font-medium">{r.orderNo}</td>
                    <td><span className={discTagCls(r.type)}>{r.type}</span></td>
                    <td className="tabular-nums font-semibold text-rose-600">-{fmtRMB(r.amount)}</td>
                    <td className="text-navy-800">{getStaffName(r.operatorId)}</td>
                    <td className="text-xs text-slate-500 max-w-[220px] truncate">{r.remark}</td>
                  </tr>
                ))}
                {!discountRows.length && <tr><td colSpan={6} className="text-center text-sm text-slate-400 py-8">暂无优惠记录</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "compensation" && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>申请时间</th><th>关联事件</th><th>赔付金额</th><th>类型</th><th>申请人</th><th>审批人</th><th>状态</th></tr></thead>
              <tbody>
                {compRows.map(r => (
                  <tr key={r.id}>
                    <td className="tabular-nums text-xs text-slate-600">{format(new Date(r.time), "yyyy-MM-dd HH:mm")}</td>
                    <td className="text-navy-800 max-w-[260px] truncate" title={r.event}>{r.event}</td>
                    <td className="tabular-nums font-semibold text-rose-600">-{fmtRMB(r.amount)}</td>
                    <td><span className={r.type === "遗失" ? "tag-danger" : r.type === "破损" ? "tag-warning" : "tag-slate"}>{r.type}</span></td>
                    <td className="text-navy-800">{r.applicant}</td>
                    <td className="text-navy-800">{r.approver}</td>
                    <td><span className={r.status === "已付" ? "tag-success" : r.status === "待批" ? "tag-info" : "tag-danger"}>{r.status}</span></td>
                  </tr>
                ))}
                {!compRows.length && <tr><td colSpan={7} className="text-center text-sm text-slate-400 py-8">暂无赔付记录</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="section-title flex items-center gap-2"><Receipt className="w-4 h-4 text-blue-500" />最近交易流水（点击查看明细）</h3>
          <span className="text-[11px] text-slate-400">共 {filteredRecords.length} 条</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>时间</th><th>订单号</th><th>门店</th><th>类型</th><th>金额</th><th>支付方式</th><th>操作人</th><th /></tr></thead>
            <tbody>
              {filteredRecords.slice(0, 8).map(r => (
                <tr key={r.id} className="cursor-pointer" onClick={() => openDrawer(r)}>
                  <td className="tabular-nums text-xs text-slate-600">{format(new Date(r.happenedAt), "MM-dd HH:mm")}</td>
                  <td className="font-mono text-xs text-navy-700 font-medium">{r.orderNo || "-"}</td>
                  <td className="text-sm text-navy-800">{getZoneName(r.zoneId).slice(0, 10)}</td>
                  <td><span className={r.direction === "income" ? "tag-success" : "tag-danger"}>{directionTypeLabel(r)}</span></td>
                  <td className={clsx("tabular-nums font-semibold", r.direction === "income" ? "text-emerald-600" : "text-rose-600")}>
                    {r.direction === "income" ? "+" : "-"}{fmtRMB(r.amount)}
                  </td>
                  <td className="text-xs text-slate-600">{methodFull(r.method)}</td>
                  <td className="text-sm text-navy-800">{getStaffName(r.operatorId)}</td>
                  <td className="text-right"><Eye className="w-4 h-4 text-slate-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer}
        title={<span className="inline-flex items-center gap-2"><Receipt className="w-4 h-4 text-blue-500" />交易明细</span>}>
        {drawerRecord && (
          <div className="space-y-5">
            <div className="text-center py-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100">
              <div className="text-xs text-slate-500 mb-1">交易金额</div>
              <div className={clsx("text-3xl font-bold font-display tabular-nums", drawerRecord.direction === "income" ? "text-emerald-600" : "text-rose-600")}>
                {drawerRecord.direction === "income" ? "+" : "-"}{fmtRMB(drawerRecord.amount)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="w-3.5 h-3.5" />{drawerRecord.transactionNo ? `流水号 ${drawerRecord.transactionNo}` : `ID ${drawerRecord.id}`}
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["交易类型", drawerRecord.direction === "income" ? "收入" : "支出"],
                ["费用类型", directionTypeLabel(drawerRecord)],
                ["关联订单", drawerRecord.orderNo || "无"],
                ["寄存区", getZoneName(drawerRecord.zoneId)],
                ["支付方式", methodFull(drawerRecord.method) + "支付"],
                ["操作人", getStaffName(drawerRecord.operatorId)],
                ["发生时间", format(new Date(drawerRecord.happenedAt), "yyyy-MM-dd HH:mm:ss", { locale: zhCN })],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{k}</span><span className="text-navy-800 font-medium">{v}</span>
                </div>
              ))}
              {drawerRecord.remark && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 ring-1 ring-amber-100">
                  <div className="text-[11px] text-amber-600 font-medium mb-1">备注</div>
                  <div className="text-sm text-amber-800">{drawerRecord.remark}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-secondary flex-1" onClick={closeDrawer}><X className="w-4 h-4" />关闭</button>
              <button className="btn-primary flex-1"><Download className="w-4 h-4" />打印凭证</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
