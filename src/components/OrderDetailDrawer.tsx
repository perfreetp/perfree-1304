import { Drawer } from "@/components/Tooltip";
import { useAppStore } from "@/store";
import { format } from "date-fns";

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

const orderStatusMap: Record<string, { text: string; cls: string }> = {
  stored: { text: "寄存中", cls: "tag-info" },
  picked: { text: "已取件", cls: "tag-success" },
  overtime: { text: "超时", cls: "tag-warning" },
  abnormal: { text: "异常", cls: "tag-danger" },
  refunded: { text: "已退款", cls: "tag-slate" },
};

const incidentStatusMap: Record<string, { text: string; cls: string }> = {
  pending: { text: "待处理", cls: "tag-danger" },
  processing: { text: "处理中", cls: "tag-warning" },
  approving: { text: "待审批", cls: "tag-info" },
  resolved: { text: "已解决", cls: "tag-success" },
  closed: { text: "已关闭", cls: "tag-slate" },
};

const incidentTypeMap: Record<string, string> = {
  lost: "丢失",
  damaged: "损坏",
  complaint: "投诉",
  other: "其他",
};

const financeTypeMap: Record<string, string> = {
  storage_fee: "寄存费",
  overtime_fee: "超时费",
  insurance_fee: "保价费",
  refund: "退款",
  discount: "折扣",
  compensation: "赔偿",
};

const lockerSizeMap: Record<string, string> = { S: "小", M: "中", L: "大" };
const lockerStatusMap: Record<string, { text: string; cls: string }> = {
  free: { text: "空闲", cls: "tag-success" },
  occupied: { text: "占用", cls: "tag-info" },
  reserved: { text: "预留", cls: "tag-slate" },
  fault: { text: "故障", cls: "tag-danger" },
  cleaning: { text: "清洁中", cls: "tag-warning" },
};

export default function OrderDetailDrawer({ open, onClose, orderId }: OrderDetailDrawerProps) {
  const orders = useAppStore((s) => s.orders);
  const lockers = useAppStore((s) => s.lockers);
  const financeRecords = useAppStore((s) => s.financeRecords);
  const incidents = useAppStore((s) => s.incidents);
  const staff = useAppStore((s) => s.staff);

  const order = orderId ? orders.find((o) => o.id === orderId) : undefined;

  const orderLockers = order
    ? lockers.filter((l) => order.lockerIds.includes(l.id))
    : [];

  const orderFinances = order
    ? financeRecords.filter((f) => f.orderId === order.id)
    : [];

  const orderIncidents = order
    ? incidents.filter((i) => i.orderId === order.id)
    : [];

  const picker = order?.pickedBy
    ? staff.find((s) => s.id === order.pickedBy)
    : undefined;

  return (
    <Drawer open={open} onClose={onClose} title="订单详情" width="w-[560px]">
      {order ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-navy-800 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="font-mono text-2xl font-bold tracking-wider">
                {order.orderNo}
              </div>
              <span className={`${orderStatusMap[order.status]?.cls ?? "tag-slate"} shrink-0`}>
                {orderStatusMap[order.status]?.text ?? order.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-white/90">
              <div>
                <span className="text-white/60 text-xs">客户姓名</span>
                <div className="font-medium">{order.customerName}</div>
              </div>
              <div>
                <span className="text-white/60 text-xs">手机号</span>
                <div className="font-medium tabular-nums">{order.customerPhone}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="section-title mb-3">柜位信息</div>
            {orderLockers.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {orderLockers.map((l) => {
                  const ls = lockerStatusMap[l.status] ?? { text: l.status, cls: "tag-slate" };
                  return (
                    <div key={l.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-navy-800 text-sm">
                          {l.code}
                        </span>
                        <span className={ls.cls}>{ls.text}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        尺寸：<span className="text-navy-700 font-medium">{lockerSizeMap[l.size] ?? l.size}</span>
                        <span className="mx-1.5">·</span>
                        {l.floor} {l.area}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-400">无关联柜位</div>
            )}
          </div>

          <div>
            <div className="section-title mb-3">入库照片</div>
            {order.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {order.photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    {p.startsWith("data:") || p.startsWith("http") ? (
                      <img src={p} alt={`照片${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 px-1 text-center break-all">
                        {p}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                未拍摄
              </div>
            )}
          </div>

          <div>
            <div className="section-title mb-3">费用流水</div>
            {orderFinances.length > 0 ? (
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>方向</th>
                      <th className="text-right">金额</th>
                      <th>时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderFinances.map((f) => (
                      <tr key={f.id}>
                        <td className="text-sm text-navy-800">
                          {financeTypeMap[f.type] ?? f.type}
                        </td>
                        <td>
                          <span className={f.direction === "income" ? "text-emerald-600" : "text-rose-600"}>
                            {f.direction === "income" ? "收入" : "支出"}
                          </span>
                        </td>
                        <td className="text-right font-semibold tabular-nums text-navy-800">
                          ¥{f.amount}
                        </td>
                        <td className="text-xs text-slate-500 tabular-nums">
                          {format(new Date(f.happenedAt), "MM-dd HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                暂无费用记录
              </div>
            )}
          </div>

          {order.status === "picked" && (
            <div>
              <div className="section-title mb-3">取件记录</div>
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">取件时间</span>
                    <div className="font-medium text-navy-900 tabular-nums">
                      {order.pickedAt
                        ? format(new Date(order.pickedAt), "yyyy-MM-dd HH:mm")
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">操作人</span>
                    <div className="font-medium text-navy-900">
                      {picker?.name ?? order.pickedBy ?? "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="section-title mb-3">关联异常</div>
            {orderIncidents.length > 0 ? (
              <div className="space-y-2">
                {orderIncidents.map((inc) => {
                  const is = incidentStatusMap[inc.status] ?? { text: inc.status, cls: "tag-slate" };
                  return (
                    <div key={inc.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-navy-800">{inc.title}</span>
                        <span className={is.cls}>{is.text}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {incidentTypeMap[inc.type] ?? inc.type}
                        <span className="mx-1.5">·</span>
                        {format(new Date(inc.reportedAt), "MM-dd HH:mm")}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-4 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                无关联异常
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-sm">未选择订单</div>
      )}
    </Drawer>
  );
}
