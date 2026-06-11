import {
  Briefcase,
  CircleDollarSign,
  Clock,
  Package,
  PackageCheck,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ReactNode } from "react";
import { clsx } from "clsx";

type Variant = "blue" | "emerald" | "amber" | "rose" | "sky" | "violet";

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: Variant;
  trend?: { value: string; up: boolean };
  icon: ReactNode;
}

const variantMap: Record<Variant, { bar: string; iconBg: string; iconColor: string; accent: string }> = {
  blue: {
    bar: "bg-gradient-to-r from-blue-500 to-sky-400",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    accent: "text-blue-600",
  },
  emerald: {
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    accent: "text-emerald-600",
  },
  amber: {
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    accent: "text-amber-600",
  },
  rose: {
    bar: "bg-gradient-to-r from-rose-500 to-pink-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    accent: "text-rose-600",
  },
  sky: {
    bar: "bg-gradient-to-r from-sky-500 to-cyan-400",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    accent: "text-sky-600",
  },
  violet: {
    bar: "bg-gradient-to-r from-violet-500 to-indigo-400",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    accent: "text-violet-600",
  },
};

export default function KpiCard({
  label,
  value,
  subValue,
  variant = "blue",
  trend,
  icon,
}: KpiCardProps) {
  const v = variantMap[variant];
  return (
    <div className="kpi-card group">
      <span className={clsx(v.bar)} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">{label}</div>
          <div className="font-display text-3xl font-bold text-navy-900 mt-2 tracking-tight tabular-nums">
            {value}
          </div>
        </div>
        <div
          className={clsx(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
            v.iconBg,
            v.iconColor
          )}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        {trend ? (
          <span
            className={clsx(
              "inline-flex items-center gap-1 font-semibold",
              trend.up ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.up ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
        ) : (
          <span />
        )}
        <span className="text-slate-400 inline-flex items-center gap-1">
          {subValue}
        </span>
      </div>
    </div>
  );
}

export const KpiIcons = {
  orders: <Package className="w-5 h-5" strokeWidth={2} />,
  stored: <PackageCheck className="w-5 h-5" strokeWidth={2} />,
  revenue: <CircleDollarSign className="w-5 h-5" strokeWidth={2} />,
  usage: <Briefcase className="w-5 h-5" strokeWidth={2} />,
  overtime: <Clock className="w-5 h-5" strokeWidth={2} />,
  incident: <ShieldAlert className="w-5 h-5" strokeWidth={2} />,
  growth: <Sparkles className="w-5 h-5" strokeWidth={2} />,
};
