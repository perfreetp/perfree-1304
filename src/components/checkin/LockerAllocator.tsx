import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, X } from "lucide-react";
import LockerCell from "@/components/LockerCell";
import { useAppStore } from "@/store";
import type { LockerSize, Locker } from "@/types";

const sizeOptions: { value: LockerSize; label: string }[] = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
];

export default function LockerAllocator({
  selectedIds,
  setSelectedIds,
  targetSize,
  targetCount,
}: {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  targetSize: LockerSize;
  targetCount: number;
}) {
  const zones = useAppStore((s) => s.zones);
  const activeZoneId = useAppStore((s) => s.activeZoneId);
  const lockers = useAppStore((s) => s.lockers);
  const setActiveZoneId = useAppStore((s) => s.setActiveZoneId);

  const [sizeFilter, setSizeFilter] = useState<LockerSize | "all">("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");

  const currentZone = zones.find((z) => z.id === activeZoneId) || zones[0];
  const zoneLockers = lockers.filter((l) => l.zoneId === activeZoneId);
  const floors = useMemo(() => [...new Set(zoneLockers.map((l) => l.floor))], [zoneLockers]);

  const filteredLockers = zoneLockers.filter((l) => {
    if (sizeFilter !== "all" && l.size !== sizeFilter) return false;
    if (floorFilter !== "all" && l.floor !== floorFilter) return false;
    return true;
  });

  const toggleLocker = (locker: Locker) => {
    if (locker.status !== "free") return;
    if (selectedIds.includes(locker.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== locker.id));
    } else {
      if (selectedIds.length >= targetCount) {
        setSelectedIds([...selectedIds.slice(1), locker.id]);
      } else {
        setSelectedIds([...selectedIds, locker.id]);
      }
    }
  };

  const recommend = () => {
    const freeMatching = zoneLockers
      .filter((l) => l.status === "free" && (l.size === targetSize || (targetSize === "S" && true)))
      .slice(0, targetCount);
    setSelectedIds(freeMatching.map((l) => l.id));
  };

  const selectedLockers = zoneLockers.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="flex-1 bg-white rounded-xl shadow-card p-5 ml-5 min-w-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">柜位分配</h3>
        <button onClick={recommend} className="btn-secondary text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          智能推荐
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <select
            value={activeZoneId || ""}
            onChange={(e) => setActiveZoneId(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-sm text-navy-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">尺寸：</span>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as LockerSize | "all")}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs"
          >
            <option value="all">全部</option>
            {sizeOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">楼层：</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs"
          >
            <option value="all">全部</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500">
          空闲柜位：
          <span className="text-emerald-600 font-semibold ml-1">
            {zoneLockers.filter((l) => l.status === "free").length}
          </span>
          <span className="mx-1">/</span>
          {currentZone?.totalLockers}
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 overflow-auto scrollbar-thin pr-2">
          <div className="grid grid-cols-8 gap-2">
            {filteredLockers.map((locker) => (
              <LockerCell
                key={locker.id}
                code={locker.code}
                size={locker.size}
                status={locker.status}
                floor={locker.floor}
                selected={selectedIds.includes(locker.id)}
                onClick={() => toggleLocker(locker)}
                compact
              />
            ))}
          </div>
        </div>

        <div className="w-56 shrink-0 border-l border-slate-100 pl-4">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span>已选柜位</span>
            <span className="tag-info">
              {selectedIds.length}/{targetCount}
            </span>
          </div>
          <div className="space-y-1.5">
            {selectedLockers.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-6">
                点击左侧柜位选择
              </div>
            )}
            {selectedLockers.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between px-2.5 py-1.5 bg-blue-50 rounded-md text-xs"
              >
                <div>
                  <span className="font-mono font-semibold text-navy-800">{l.code}</span>
                  <span className="text-slate-500 ml-1.5">{l.size} · {l.floor}</span>
                </div>
                <button
                  onClick={() => setSelectedIds(selectedIds.filter((id) => id !== l.id))}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
