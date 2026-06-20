import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient, ReminderMethod, NoShowReason, PatientStatus } from '@/types';
import { mockPatients } from '@/data/mockData';

interface PatientState {
  patients: Patient[];
  
  sendReminder: (id: string, method: ReminderMethod, remark?: string) => void;
  markArrived: (id: string) => void;
  markNoShow: (id: string, reason: NoShowReason) => void;
  getPendingPatients: () => Patient[];
  getConfirmedPatients: () => Patient[];
  getFollowupPatients: () => Patient[];
  resetData: () => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: mockPatients,

      sendReminder: (id, method, remark) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'confirmed' as PatientStatus,
                  reminderMethod: method,
                  remark: remark || '',
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      markArrived: (id) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'arrived' as PatientStatus,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      markNoShow: (id, reason) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'followup' as PatientStatus,
                  noShowReason: reason,
                  lastTreatmentDate: p.lastTreatmentDate || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      getPendingPatients: () => {
        const { patients } = get();
        return patients
          .filter((p) => p.status === 'pending')
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      getConfirmedPatients: () => {
        const { patients } = get();
        return patients
          .filter((p) => p.status === 'confirmed' || p.status === 'arrived')
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      getFollowupPatients: () => {
        const { patients } = get();
        const riskOrder = { high: 0, medium: 1, low: 2 };
        return patients
          .filter((p) => p.status === 'followup' || p.status === 'no_show')
          .sort((a, b) => {
            const riskA = riskOrder[a.riskLevel || 'low'];
            const riskB = riskOrder[b.riskLevel || 'low'];
            if (riskA !== riskB) return riskA - riskB;
            return new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime();
          });
      },

      resetData: () => set({ patients: mockPatients }),
    }),
    {
      name: 'dental-reminder-data',
    }
  )
);
