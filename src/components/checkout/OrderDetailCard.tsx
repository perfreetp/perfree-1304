import { Phone, User, Clock, Building2, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import type { StorageOrder } from "@/types";
import { useAppStore } from "@/store";

const orderStatusMap: Record<StorageOrder["status"], { text: string; cls: string }> = {
  stored: { text: "寄存中", cls: "tag-info" },
  picked: { text: "已取件", cls: "tag-success" },
  overtime: { text: "超时", cls: "tag-warning" },
  abnormal: { text: "异常", cls: "tag-danger" },
  refunded: { text: "已退款", cls: "tag-slate" },
};

const luggageTypeLabel: Record<string, string> = {
  suitcase: "拉杆箱",
  backpack: "背包",
  handbag: "手提包",
  box: "纸箱",
  other: "其他",
};

export default function OrderDetailCard({ order }: { order: StorageOrder | null }) {
  const zones = useAppStore((s) => s.zones);
  const lockers = useAppStore((s) => s.lockers);

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 flex flex-col items-center justify-center text-center min-h-[420px]">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h4 className="text-lg font-semibold text-navy-900 mb-1">暂无订单</h4>
        <p className="text-sm text-slate-500 max-w-xs">
          请先扫描取件码或输入订单号/手机号查找寄存订单
        </p>
      </div>
    );
  }

  const st = orderStatusMap[order.status];
  const zone = zones.find((z) => z.id === order.zoneId);
  const orderLockers = lockers.filter((l) => order.lockerIds.includes(l.id));

  const photoSlots = 4;
  const filledPhotos = order.photos.slice(0, photoSlots);
  const emptySlots = photoSlots - filledPhotos.length;

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="section-title">订单详情</h3>
        <span className={clsx(st.cls, "px-2.5 py-1")}>{st.text}</span>
      </div>

      <div className="p-5 space-y-5">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">订单号</div>
              <div className="font-mono font-bold text-navy-900 text-lg tracking-wider">
                {order.orderNo}
              </div>
            </div>
            {order.isGroup && <span className="tag-violet tag">团体寄存</span>}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">客户：</span>
              <span className="font-medium text-navy-800">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">手机：</span>
              <span className="font-medium text-navy-800 tabular-nums">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">存入：</span>
              <span className="font-medium text-navy-800 tabular-nums">
                {format(new Date(order.checkedInAt), "MM-dd HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">寄存区：</span>
              <span className="font-medium text-navy-800 truncate">{zone?.name || "-"}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">行李与柜位清单</div>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="data-table">
              <thead>
                <tr>
                  <th>行李类型</th>
                  <th>尺寸</th>
                  <th>颜色/特征</th>
                  <th>柜位号</th>
                </tr>
              </thead>
              <tbody>
                {order.luggageTypes.map((lug, i) => {
                  const locker = orderLockers.find((l) => l.id === lug.lockerId) || orderLockers[i];
                  return (
                    <tr key={lug.id}>
                      <td className="text-navy-800">{luggageTypeLabel[lug.type] || lug.type}</td>
                      <td>
                        <span className="tag-slate">{lug.size}</span>
                      </td>
                      <td className="text-slate-600 text-xs">
                        <span className="text-navy-700">{lug.color || "-"}</span>
                        {lug.description && (
                          <span className="text-slate-400"> · {lug.description}</span>
                        )}
                      </td>
                      <td className="font-mono text-navy-800 text-xs font-semibold">
                        {locker?.code || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">封存照片</div>
          <div className="grid grid-cols-4 gap-2">
            {filledPhotos.map((p, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center"
              >
                <ImageIcon className="w-5 h-5 text-slate-400 mb-0.5" />
                <span className="text-[9px] text-slate-400 truncate w-full text-center px-1">
                  {p}
                </span>
              </div>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center"
              >
                <span className="text-[10px] text-slate-300">无照片</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
