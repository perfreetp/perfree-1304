import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid(prefix?: string): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(10000 + Math.random() * 90000).toString();
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

let orderCounter = 0;

function extractSeq(orderNo: string): number {
  const m = orderNo.match(/LC\d{8}(\d{4})$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function genOrderNo(existingOrderNos: string[] = []): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const prefix = `LC${datePart}`;
  let maxSeq = orderCounter;
  for (const no of existingOrderNos) {
    if (no.startsWith(prefix)) {
      const seq = extractSeq(no);
      if (seq > maxSeq) maxSeq = seq;
    }
  }
  const nextSeq = (maxSeq + 1) % 10000;
  orderCounter = nextSeq;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export function differenceInMinutesNow(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - target) / 60000);
}

export function formatMoney(n: number): string {
  return `¥${n.toFixed(2)}`;
}

export function maskPhone(p: string): string {
  if (p.length < 7) return p;
  return p.slice(0, 3) + "****" + p.slice(-4);
}
