import { useState, useMemo } from "react";
import { Search, Clock, Package, User, Calendar, Filter, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { useAppStore } from "@/store";
import type { StorageOrder } from "@/types";

type Tab = "recent" | "advanced";

const orderStatusMap: Record<StorageOrder["status"], { text: string; cls: string }> = {
  stored: { text: "寄存中", cls: "tag-info" },
  picked: { text: "已取件", cls: "tag-success" },
  overtime: { text: "超时", cls: "tag-warning" },
  abnormal: { text: "异常", cls: "tag-danger" },
  refunded: { text: "已退款", cls: "tag-slate" },
};

interface AdvancedFilters {
  phone: string;
  orderNoPart: string;
  dateFrom: string;
  dateTo: string;
  lockerCode: string;
  keyword: string;
}

export default function OrderSearchSection({
  onSelect,
  selectedId,
}: {
  onSelect: (order: StorageOrder) => void;
  selectedId: string | null;
}) {
  const orders = useAppStore((s) => s.orders);
  const zones = useAppStore((s) => s.zones);
  const lockers = useAppStore((s) => s.lockers);

  const [tab, setTab] = useState<Tab>("recent");
  const [filters, setFilters] = useState<AdvancedFilters>({
    phone: "",
    orderNoPart: "",
    dateFrom: "",
    dateTo: "",
    lockerCode: "",
    keyword: "",
  });

  const recentOrders = useMemo(() => orders.slice(0, 10), [orders]);

  const filteredOrders = useMemo(() => {
    if (tab === "recent") return recentOrders;
    return orders.filter((o) => {
      if (filters.phone && !o.customerPhone.includes(filters.phone)) return false;
      if (filters.orderNoPart && !o.orderNo.toLowerCase().includes(filters.orderNoPart.toLowerCase())) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        if (new Date(o.checkedInAt).getTime() < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 24 * 3600 * 1000;
        if (new Date(o.checkedInAt).getTime() > to) return false;
      }
      if (filters.lockerCode) {
        const orderLockerCodes = o.lockerIds
          .map((id) => lockers.find((l) => l.id === id)?.code || "")
          .join(",");
        if (!orderLockerCodes.toLowerCase().includes(filters.lockerCode.toLowerCase())) return false;
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const haystack = [
          o.customerName,
          o.remark || "",
          ...o.luggageTypes.map((l) => `${l.color || ""} ${l.description || ""}`),
        ].join(" ").toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [tab, orders, filters, lockers, recentOrders]);

  const resetFilters = () =>
    setFilters({ phone: "", orderNoPart: "", dateFrom: "", dateTo: "", lockerCode: "", keyword: "" });

  const getZoneName = (id: string) => zones.find((z) => z.id === id)?.name || "-";
  const getLockerCodes = (ids: string[]) =>
    ids.map((id) => lockers.find((l) => l.id === id)?.code || "-").join("、");

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="section-title flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" />
          找包搜索
        </h3>
        <div className="flex p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setTab("recent")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              tab === "recent"
                ? "bg-white text-navy-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Clock className="w-3 h-3" />
            最近订单
          </button>
          <button
            onClick={() => setTab("advanced")}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              tab === "advanced"
                ? "bg-white text-navy-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Filter className="w-3 h-3" />
            高级搜索
          </button>
        </div>
      </div>

      {tab === "advanced" && (
        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="label flex items-center gap-1">
              <User className="w-3 h-3" /> 手机号
            </label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
              placeholder="手机号片段"
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Package className="w-3 h-3" /> 单号段
            </label>
            <input
              type="text"
              value={filters.orderNoPart}
              onChange={(e) => setFilters({ ...filters, orderNoPart: e.target.value })}
              placeholder="订单号关键词"
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Calendar className="w-3 h-3" /> 起始日期
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="label">结束日期</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Search className="w-3 h-3" /> 柜位号
            </label>
            <input
              type="text"
              value={filters.lockerCode}
              onChange={(e) => setFilters({ ...filters, lockerCode: e.target.value })}
              placeholder="如 1A05"
              className="input-base text-xs"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Search className="w-3 h-3" /> 特征关键词
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="颜色/品牌/备注"
              className="input-base text-xs"
            />
          </div>
        </div>
      )}

      {tab === "advanced" && (
        <div className="px-5 py-2 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            共找到 <span className="font-semibold text-navy-800">{filteredOrders.length}</span> 条结果
          </span>
          <button onClick={resetFilters} className="btn-ghost !py-1 text-xs">
            重置条件
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>单号</th>
              <th>客户信息</th>
              <th>寄存区</th>
              <th>柜位</th>
              <th>存入时间</th>
              <th>状态</th>
              <th className="text-right">金额</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                  暂无符合条件的订单
                </td>
              </tr>
            )}
            {filteredOrders.map((o) => {
              const st = orderStatusMap[o.status];
              const isSelected = selectedId === o.id;
              const isPicked = o.status === "picked";
              return (
                <tr
                  key={o.id}
                  className={clsx(isSelected && "bg-blue-50/60")}
                  style={isSelected ? { boxShadow: "inset 3px 0 0 #2563EB" } : undefined}
                >
                  <td className="font-mono text-xs text-navy-700 font-medium">{o.orderNo}</td>
                  <td>
                    <div className="text-sm text-navy-800 font-medium">{o.customerName}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">{o.customerPhone}</div>
                  </td>
                  <td className="text-xs text-slate-600 max-w-[160px] truncate">
                    {getZoneName(o.zoneId)}
                  </td>
                  <td className="font-mono text-[11px] text-slate-600">
                    {getLockerCodes(o.lockerIds)}
                  </td>
                  <td className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
                    {format(new Date(o.checkedInAt), "MM-dd HH:mm")}
                  </td>
                  <td>
                    <span className={st.cls}>{st.text}</span>
                  </td>
                  <td className="text-right font-semibold text-navy-800 tabular-nums">
                    ¥{o.totalFee}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onSelect(o)}
                      disabled={isPicked}
                      className={clsx(
                        "btn-primary !py-1.5 !px-3 text-xs",
                        isPicked && "!bg-slate-200 !text-slate-500 !hover:bg-slate-200 cursor-not-allowed"
                      )}
                    >
                      {isPicked ? "已完成" : "取件"}
                      {!isPicked && <ArrowRight className="w-3 h-3" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
