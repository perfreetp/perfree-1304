import { QrCode, Printer, Camera, Calculator, Plus, X } from "lucide-react";
import { clsx } from "clsx";

export function LabelPreview({
  orderNo,
  customerName,
  lockerCodes,
  onPrint,
}: {
  orderNo: string;
  customerName: string;
  lockerCodes: string[];
  onPrint: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <QrCode className="w-4 h-4 text-blue-500" />
        标签预览
      </h3>
      <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
        <div className="w-28 h-28 mx-auto bg-white border-2 border-navy-800 rounded-lg flex items-center justify-center mb-3">
          <QrCode className="w-16 h-16 text-navy-800" strokeWidth={1.2} />
        </div>
        <div className="font-mono font-bold text-navy-900 text-sm tracking-wide">{orderNo}</div>
        <div className="text-xs text-slate-500 mt-1 truncate">{customerName || "待填写客户"}</div>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {lockerCodes.length > 0 ? (
            lockerCodes.map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-navy-800 text-white text-[10px] font-mono rounded">
                {c}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400">未分配柜位</span>
          )}
        </div>
      </div>
      <button onClick={onPrint} className="btn-secondary w-full mt-4 text-xs">
        <Printer className="w-3.5 h-3.5" />
        打印标签
      </button>
    </div>
  );
}

export function PhotoCapture({
  photos,
  setPhotos,
}: {
  photos: string[];
  setPhotos: (p: string[]) => void;
}) {
  const addPhoto = () => {
    const newPhoto = `photo-${Date.now()}-${photos.length + 1}.jpg`;
    if (photos.length < 3) setPhotos([...photos, newPhoto]);
  };
  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const slots = 3;
  const placeholders = Array.from({ length: slots - photos.length });

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <Camera className="w-4 h-4 text-emerald-500" />
        拍照封存
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-[9px] text-slate-500 truncate px-1">{p}</div>
            </div>
            <button
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {placeholders.map((_, i) => (
          <button
            key={`ph-${i}`}
            onClick={addPhoto}
            className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] mt-1">添加</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeeBreakdown({
  baseFee,
  overtimeEst,
  insuranceFee,
  discount,
}: {
  baseFee: number;
  overtimeEst: number;
  insuranceFee: number;
  discount: number;
}) {
  const total = baseFee + overtimeEst + insuranceFee - discount;
  const rows = [
    { label: "基本寄存费", value: baseFee, cls: "" },
    { label: "超时预估", value: overtimeEst, cls: "text-amber-600" },
    { label: "保价费", value: insuranceFee, cls: "" },
    { label: "折扣", value: -discount, cls: discount > 0 ? "text-emerald-600" : "" },
  ];
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-violet-500" />
        费用明细
      </h3>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{r.label}</span>
            <span className={clsx("font-medium tabular-nums", r.cls)}>
              {r.value >= 0 ? "¥" : "-¥"}
              {Math.abs(r.value).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-100 my-2" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-navy-900">合计应付</span>
          <span className="font-display text-2xl font-bold text-navy-900 tabular-nums">
            ¥{total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
