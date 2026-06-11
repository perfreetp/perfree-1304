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
export function genOrderNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  orderCounter = (orderCounter + 1) % 10000;
  const seq = String(orderCounter).padStart(4, "0");
  return `LC${year}${month}${day}${seq}`;
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
