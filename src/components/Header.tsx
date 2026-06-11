import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronRight,
  Home,
  Settings,
} from "lucide-react";
import { useAppStore } from "../store";
import { clsx } from "clsx";

const routeNames: Record<string, string> = {
  dashboard: "运营总览",
  "storage-config": "寄存区配置",
  "locker-manager": "柜位管理",
  "check-in": "现场收件",
  "check-out": "订单核销",
  incident: "异常事件",
  scheduling: "人员排班",
  settlement: "财务结算",
};

export default function Header() {
  const { pathname } = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const pendingIncidents = useAppStore((s) =>
    s.incidents.filter((i) => i.status === "pending" || i.status === "processing")
      .length
  );

  const currentKey = pathname.replace("/", "") || "dashboard";
  const pageTitle = routeNames[currentKey] || "首页";

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 sticky top-0 z-20">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>首页</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-navy-800 font-medium">{pageTitle}</span>
      </nav>

      <div className="ml-8 flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索订单号、手机号、柜位..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50/60 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
          {pendingIncidents > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {pendingIncidents > 9 ? "9+" : pendingIncidents}
            </span>
          )}
        </button>
        <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <div className="flex items-center gap-2.5 pr-2">
          <div
            className={clsx(
              "w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            )}
            style={{ backgroundColor: currentUser?.avatarColor || "#6366F1" }}
          >
            {currentUser?.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-navy-800">
              {currentUser?.name}
            </div>
            <div className="text-[11px] text-slate-500">
              {currentUser?.role === "admin"
                ? "系统管理员"
                : currentUser?.role === "supervisor"
                ? "门店主管"
                : currentUser?.role === "finance"
                ? "财务人员"
                : "现场操作员"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
