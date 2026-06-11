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

interface AppState {
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
  updateZone: (zone: StorageZone) => void;
  createZone: (zone: StorageZone) => void;
}

const seedCurrentUser = mockStaff.find((s) => s.role === "supervisor") || mockStaff[0];

export const useAppStore = create<AppState>((set) => ({
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

  setActiveZoneId: (id) => set({ activeZoneId: id }),

  createOrder: (order, financeRecords) =>
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
    }),

  checkOutOrder: (orderId, overtimeFee, paymentRecords) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;
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
    }),

  createIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
    })),

  updateIncidentStatus: (id, status, patch) =>
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
    })),

  addShift: (shift) =>
    set((state) => ({
      shifts: [...state.shifts, shift],
    })),

  addHandover: (handover) =>
    set((state) => ({
      handovers: [handover, ...state.handovers],
    })),

  updateLockerStatus: (id, status, remark) =>
    set((state) => ({
      lockers: state.lockers.map((l) =>
        l.id === id ? { ...l, status, remark: remark ?? l.remark } : l
      ),
    })),

  updateZone: (zone) =>
    set((state) => ({
      zones: state.zones.map((z) => (z.id === zone.id ? zone : z)),
    })),

  createZone: (zone) =>
    set((state) => ({
      zones: [...state.zones, zone],
    })),
}));
