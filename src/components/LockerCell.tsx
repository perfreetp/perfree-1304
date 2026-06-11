import { LockerSize, LockerStatus } from "../types";
import { clsx } from "clsx";
import { Tooltip } from "./Tooltip";

interface LockerCellProps {
  code: string;
  size: LockerSize;
  status: LockerStatus;
  floor?: string;
  onClick?: () => void;
  selected?: boolean;
  occupiedAt?: string;
  compact?: boolean;
}

const statusStyles: Record<
  LockerStatus,
  { bg: string; text: string; border: string; shadow: string; label: string }
> = {
  free: {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
    border: "border border-emerald-200",
    shadow: "hover:shadow-glow-free",
    label: "空闲",
  },
  occupied: {
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-700",
    border: "border border-blue-200",
    shadow: "hover:shadow-glow-occupied",
    label: "占用",
  },
  reserved: {
    bg: "bg-sky-50 hover:bg-sky-100",
    text: "text-sky-700",
    border: "border border-sky-200",
    shadow: "",
    label: "预留",
  },
  fault: {
    bg: "bg-rose-50 hover:bg-rose-100",
    text: "text-rose-700",
    border: "border border-rose-200",
    shadow: "shadow-glow-fault",
    label: "故障",
  },
  cleaning: {
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-700",
    border: "border border-amber-200",
    shadow: "",
    label: "清洁中",
  },
};

const sizeLabel: Record<LockerSize, string> = {
  S: "小",
  M: "中",
  L: "大",
};

export default function LockerCell({
  code,
  size,
  status,
  floor,
  onClick,
  selected,
  occupiedAt,
  compact = false,
}: LockerCellProps) {
  const s = statusStyles[status];
  return (
    <Tooltip
      content={
        <div className="text-xs space-y-1 p-1">
          <div className="font-semibold text-white">{code}</div>
          <div className="text-slate-300">状态：{s.label}</div>
          <div className="text-slate-300">尺寸：{sizeLabel[size]}</div>
          {floor && <div className="text-slate-300">楼层/分区：{floor}</div>}
          {occupiedAt && (
            <div className="text-slate-300">
              存入：{new Date(occupiedAt).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      }
    >
      <button
        onClick={onClick}
        className={clsx(
          "locker-cell",
          s.bg,
          s.text,
          s.border,
          s.shadow,
          selected && "ring-2 ring-blue-500 ring-offset-2",
          status === "occupied" && !compact && "animate-pulse-soft",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-1">
          <div className="font-bold leading-none tracking-tight">{code}</div>
          {!compact && (
            <div className="text-[9px] opacity-70 mt-0.5">{sizeLabel[size]}</div>
          )}
        </div>
        <span
          className={clsx(
            "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
            status === "free" && "bg-emerald-500",
            status === "occupied" && "bg-blue-500",
            status === "fault" && "bg-rose-500",
            status === "cleaning" && "bg-amber-500",
            status === "reserved" && "bg-sky-500"
          )}
        />
      </button>
    </Tooltip>
  );
}
