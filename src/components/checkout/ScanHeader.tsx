import { useState } from "react";
import { ScanLine, Search } from "lucide-react";

export default function ScanHeader({
  scanValue,
  setScanValue,
  onSearch,
}: {
  scanValue: string;
  setScanValue: (v: string) => void;
  onSearch: () => void;
}) {
  const [mode, setMode] = useState<"scan" | "manual">("scan");

  return (
    <div className="bg-gradient-to-br from-blue-600 via-navy-700 to-navy-900 rounded-2xl p-8 shadow-card relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-sky-400 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white font-display tracking-tight mb-2">
            订单核销与取件
          </h2>
          <p className="text-blue-200 text-sm">扫码或输入单号/手机号，快速定位寄存订单</p>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setMode("scan")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === "scan"
                ? "bg-white text-navy-800 shadow-lg"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            <ScanLine className="w-3.5 h-3.5 inline mr-1.5" />
            扫码取件
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              mode === "manual"
                ? "bg-white text-navy-800 shadow-lg"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            手动输入单号/手机号
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            {mode === "scan" ? (
              <ScanLine className="w-6 h-6 text-blue-500" strokeWidth={1.8} />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder={
              mode === "scan"
                ? "请将取件码/二维码对准扫描器..."
                : "请输入订单号或客户手机号..."
            }
            className="w-full pl-16 pr-32 h-14 rounded-xl bg-white text-navy-900 placeholder-slate-400 text-base font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300/40"
          />
          <button
            onClick={onSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 h-10 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition-all flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            查询
          </button>
        </div>
      </div>
    </div>
  );
}
