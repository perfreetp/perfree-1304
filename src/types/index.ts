export interface PricingRule {
  type: "hourly" | "perUse" | "tiered";
  firstHourPrice: number;
  overtimeUnitPrice: number;
  overtimeStepMinutes: number;
  dailyMaxPrice: number;
  smallLockerExtra: number;
  mediumLockerExtra: number;
  largeLockerExtra: number;
}

export type ZoneStatus = "open" | "closed" | "maintenance";

export interface StorageZone {
  id: string;
  name: string;
  location: string;
  status: ZoneStatus;
  openTime: string;
  closeTime: string;
  totalLockers: number;
  usedLockers: number;
  pricingRule: PricingRule;
  bannedItems: string[];
  tips: string;
  insuranceRate: number;
  capacityWarning: number;
  createdAt: string;
}

export type LockerSize = "S" | "M" | "L";
export type LockerStatus = "free" | "occupied" | "reserved" | "fault" | "cleaning";

export interface Locker {
  id: string;
  zoneId: string;
  code: string;
  size: LockerSize;
  status: LockerStatus;
  floor: string;
  area: string;
  currentOrderId?: string;
  occupiedAt?: string;
  remark?: string;
}

export type LuggageType = "suitcase" | "backpack" | "handbag" | "box" | "other";

export interface LuggageItem {
  id: string;
  type: LuggageType;
  size: LockerSize;
  color?: string;
  description?: string;
  lockerId: string;
}

export type OrderStatus =
  | "stored"
  | "picked"
  | "overtime"
  | "abnormal"
  | "refunded";

export interface StorageOrder {
  id: string;
  orderNo: string;
  zoneId: string;
  lockerIds: string[];
  customerName: string;
  customerPhone: string;
  luggageCount: number;
  luggageTypes: LuggageItem[];
  insuranceAmount: number;
  estimatedPickupAt?: string;
  checkedInAt: string;
  checkedInBy: string;
  photos: string[];
  status: OrderStatus;
  baseFee: number;
  overtimeFee: number;
  insuranceFee: number;
  discount: number;
  totalFee: number;
  paidAmount: number;
  pickedAt?: string;
  pickedBy?: string;
  remark?: string;
  isGroup?: boolean;
}

export type IncidentType = "lost" | "damaged" | "complaint" | "other";
export type IncidentStatus =
  | "pending"
  | "processing"
  | "approving"
  | "resolved"
  | "closed";

export interface Incident {
  id: string;
  orderId?: string;
  orderNo?: string;
  zoneId: string;
  type: IncidentType;
  title: string;
  description: string;
  photos: string[];
  status: IncidentStatus;
  reportedAt: string;
  reportedBy: string;
  handler?: string;
  compensationAmount: number;
  resolution?: string;
  resolvedAt?: string;
  approver?: string;
}

export type StaffRole = "operator" | "supervisor" | "finance" | "admin";

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  avatarColor: string;
}

export type ShiftType = "morning" | "afternoon" | "night";

export interface Shift {
  id: string;
  staffId: string;
  zoneId: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  checkInAt?: string;
  checkOutAt?: string;
}

export interface HandoverRecord {
  id: string;
  zoneId: string;
  shiftDate: string;
  previousStaffId: string;
  nextStaffId: string;
  storedCountOnShift: number;
  abnormalCount: number;
  lockerSnapshot: { lockerId: string; status: LockerStatus }[];
  handoverAt: string;
  previousSignature: string;
  nextSignature: string;
  remark?: string;
}

export type FinanceType =
  | "storage_fee"
  | "overtime_fee"
  | "insurance_fee"
  | "refund"
  | "discount"
  | "compensation";

export type FinanceDirection = "income" | "expense";
export type PaymentMethod = "cash" | "wechat" | "alipay" | "card" | "offset";

export interface FinanceRecord {
  id: string;
  orderId?: string;
  orderNo?: string;
  zoneId: string;
  type: FinanceType;
  amount: number;
  direction: FinanceDirection;
  method: PaymentMethod;
  transactionNo?: string;
  operatorId: string;
  happenedAt: string;
  remark?: string;
}
