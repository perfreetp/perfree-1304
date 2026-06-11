import { create } from "zustand";
import {
  FinanceRecord,
  HandoverRecord,
  Incident,
  Locker,
  Shift,
  Staff,
  StorageOrder,
  StorageZone,
} from "../types";
import {
  mockFinanceRecords,
  mockHandovers,
  mockIncidents,
  mockLockers,
  mockOrders,
  mockShifts,
  mockStaff,
  mockZones,
} from "../mock/data";

const STORAGE_KEY = "lockerops_store_v1";

interface AppStateData {
  zones: StorageZone[];
  lockers: Locker[];
  orders: StorageOrder[];
  incidents: Incident[];
  staff: Staff[];
  shifts: Shift[];
  handovers: HandoverRecord[];
  financeRecords: FinanceRecord[];
  currentUser: Staff | null;
  activeZoneId: string | null;
}

interface AppState extends AppStateData {
  setActiveZoneId: (id: string | null) => void;
  createOrder: (order: StorageOrder, financeRecords: FinanceRecord[]) => void;
  checkOutOrder: (
    orderId: string,
    overtimeFee: number,
    paymentRecords: FinanceRecord[]
  ) => void;
  createIncident: (incident: Incident) => void;
  updateIncidentStatus: (
    id: string,
    status: Incident["status"],
    patch?: Partial<Incident>
  ) => void;
  addShift: (shift: Shift) => void;
  addHandover: (handover: HandoverRecord) => void;
  updateLockerStatus: (
    id: string,
    status: Locker["status"],
    remark?: string
  ) => void;
  updateZone: (id: string, patch: Partial<StorageZone>) => void;
  createZone: (zone: StorageZone, lockers: Locker[]) => void;
}

function loadInitialState(): AppStateData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppStateData;
      return parsed;
    }
  } catch {
  }
  const seedCurrentUser = mockStaff.find((s) => s.role === "supervisor") || mockStaff[0];
  return {
    zones: mockZones,
    lockers: mockLockers,
    orders: mockOrders,
    incidents: mockIncidents,
    staff: mockStaff,
    shifts: mockShifts,
    handovers: mockHandovers,
    financeRecords: mockFinanceRecords,
    currentUser: seedCurrentUser,
    activeZoneId: mockZones[0].id,
  };
}

function persistState(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}

const initialState = loadInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setActiveZoneId: (id) => {
    set({ activeZoneId: id });
    persistState(get());
  },

  createOrder: (order, financeRecords) => {
    set((state) => {
      const updatedLockers = state.lockers.map((l) =>
        order.lockerIds.includes(l.id)
          ? { ...l, status: "occupied" as const, currentOrderId: order.id, occupiedAt: new Date().toISOString() }
          : l
      );
      const updatedZones = state.zones.map((z) =>
        z.id === order.zoneId
          ? { ...z, usedLockers: z.usedLockers + order.lockerIds.length }
          : z
      );
      return {
        orders: [order, ...state.orders],
        lockers: updatedLockers,
        zones: updatedZones,
        financeRecords: [...financeRecords, ...state.financeRecords],
      };
    });
    persistState(get());
  },

  checkOutOrder: (orderId, overtimeFee, paymentRecords) => {
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;
      if (order.status === "picked") return state;
      const updatedOrder: StorageOrder = {
        ...order,
        status: "picked",
        overtimeFee: order.overtimeFee + overtimeFee,
        totalFee: order.totalFee + overtimeFee,
        paidAmount: order.paidAmount + overtimeFee,
        pickedAt: new Date().toISOString(),
        pickedBy: state.currentUser?.id,
      };
      const updatedLockers = state.lockers.map((l) =>
        order.lockerIds.includes(l.id)
          ? { ...l, status: "free" as const, currentOrderId: undefined, occupiedAt: undefined }
          : l
      );
      const updatedZones = state.zones.map((z) =>
        z.id === order.zoneId
          ? { ...z, usedLockers: Math.max(0, z.usedLockers - order.lockerIds.length) }
          : z
      );
      return {
        orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        lockers: updatedLockers,
        zones: updatedZones,
        financeRecords: [...paymentRecords, ...state.financeRecords],
      };
    });
    persistState(get());
  },

  createIncident: (incident) => {
    set((state) => ({
      incidents: [incident, ...state.incidents],
    }));
    persistState(get());
  },

  updateIncidentStatus: (id, status, patch) => {
    set((state) => ({
      incidents: state.incidents.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              ...patch,
              resolvedAt:
                (status === "resolved" || status === "closed") && !i.resolvedAt
                  ? new Date().toISOString()
                  : i.resolvedAt,
              approver:
                (status === "resolved" || status === "closed")
                  ? state.currentUser?.name
                  : i.approver,
            }
          : i
      ),
    }));
    persistState(get());
  },

  addShift: (shift) => {
    set((state) => ({
      shifts: [...state.shifts, shift],
    }));
    persistState(get());
  },

  addHandover: (handover) => {
    set((state) => ({
      handovers: [handover, ...state.handovers],
    }));
    persistState(get());
  },

  updateLockerStatus: (id, status, remark) => {
    set((state) => ({
      lockers: state.lockers.map((l) =>
        l.id === id ? { ...l, status, remark: remark ?? l.remark } : l
      ),
    }));
    persistState(get());
  },

  updateZone: (id, patch) => {
    set((state) => ({
      zones: state.zones.map((z) => {
        if (z.id !== id) return z;
        const merged: StorageZone = {
          ...z,
          ...patch,
          pricingRule: patch.pricingRule
            ? { ...z.pricingRule, ...patch.pricingRule }
            : z.pricingRule,
        };
        return merged;
      }),
    }));
    persistState(get());
  },

  createZone: (zone, lockers) => {
    set((state) => ({
      zones: [...state.zones, zone],
      lockers: [...state.lockers, ...lockers],
    }));
    persistState(get());
  },
}));
