import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Grid3x3,
  PackagePlus,
  QrCode,
  AlertTriangle,
  CalendarClock,
  Wallet,
  Package,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "运营总览", icon: LayoutDashboard },
  { to: "/storage-config", label: "寄存区配置", icon: MapPin },
  { to: "/locker-manager", label: "柜位管理", icon: Grid3x3 },
  { to: "/check-in", label: "现场收件", icon: PackagePlus },
  { to: "/check-out", label: "订单核销", icon: QrCode },
  { to: "/incident", label: "异常事件", icon: AlertTriangle },
  { to: "/scheduling", label: "人员排班", icon: CalendarClock },
  { to: "/settlement", label: "财务结算", icon: Wallet },
];

export default function Sidebar() {
  return (
    <aside className="nav-sidebar w-60 shrink-0 h-screen flex flex-col text-slate-200 sticky top-0">
      <div className="relative px-5 py-5 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Package className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div>
          <div className="font-display text-base font-bold text-white tracking-wide">
            寄存云
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            LockerOps Platform
          </div>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-white shadow-[inset_3px_0_0_0_#38BDF8]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <span className="flex-1">{item.label}</span>
            <ChevronRight
              className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all"
            />
          </NavLink>
        ))}
      </nav>

      <div className="relative p-4 mt-auto border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-blue-600/20 via-sky-500/10 to-transparent p-3 ring-1 ring-white/10">
          <div className="text-[11px] text-sky-200/70 mb-1">今日运营状态</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-2xl font-bold text-white leading-none">
                76.4%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                综合柜位使用率
              </div>
            </div>
            <span className="tag-success text-[10px]">营业中</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
