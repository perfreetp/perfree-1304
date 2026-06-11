import { useMemo } from "react";
import { useAppStore } from "../store";
import { clsx } from "clsx";

export default function CapacityHeatmap() {
  const zones = useAppStore((s) => s.zones);

  const data = useMemo(
    () =>
      zones.map((z) => {
        const rate = z.totalLockers
          ? Math.round((z.usedLockers / z.totalLockers) * 100)
          : 0;
        return {
          ...z,
          rate,
          isWarning: rate >= z.capacityWarning,
          isCritical: rate >= 95,
        };
      }),
    [zones]
  );

  const getColor = (rate: number, isWarning: boolean, isCritical: boolean) => {
    if (rate === 0) return "from-slate-100 to-slate-50 text-slate-400";
    if (isCritical) return "from-rose-500 to-rose-400 text-white";
    if (isWarning) return "from-amber-500 to-orange-400 text-white";
    if (rate >= 60) return "from-emerald-400 to-teal-400 text-white";
    return "from-sky-300 to-sky-200 text-sky-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">实时容量分布</h3>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-sky-300 to-sky-200" />
            正常
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-teal-400" />
            较高
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-amber-500 to-orange-400" />
            预警
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-500 to-rose-400" />
            饱和
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((z) => {
          const colorCls = getColor(z.rate, z.isWarning, z.isCritical);
          return (
            <div
              key={z.id}
              className="relative rounded-xl p-4 overflow-hidden group cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className={clsx("absolute inset-0 bg-gradient-to-br", colorCls)} />
              {z.isCritical && (
                <div className="absolute inset-0 animate-pulse-soft bg-white/10" />
              )}
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-[11px] font-medium opacity-80">
                      {z.location}
                    </div>
                    <div className="font-semibold text-sm mt-0.5 max-w-[180px] line-clamp-2">
                      {z.name}
                    </div>
                  </div>
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      z.status === "open"
                        ? "bg-white/25"
                        : z.status === "maintenance"
                        ? "bg-slate-800/25"
                        : "bg-white/15"
                    )}
                  >
                    {z.status === "open"
                      ? "营业中"
                      : z.status === "maintenance"
                      ? "维护中"
                      : "打烊"}
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display text-4xl font-bold leading-none">
                      {z.rate}
                      <span className="text-xl opacity-80 ml-0.5">%</span>
                    </div>
                    <div className="text-[11px] mt-2 opacity-80">
                      {z.usedLockers} / {z.totalLockers} 柜
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-sm font-display text-xs font-bold"
                      style={{
                        background: `conic-gradient(white/90 ${z.rate}%, transparent 0)`,
                      }}
                    >
                      <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-navy-800">
                        {z.rate >= 90 ? "!" : z.rate >= z.capacityWarning ? "!" : "✓"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
