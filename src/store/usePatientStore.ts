import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient, ReminderMethod, NoShowReason, PatientStatus, FollowupResult, DateFilter, FollowupRecord, FollowupFilter } from '@/types';
import { highRiskKeywords } from '@/types';
import { mockPatients } from '@/data/mockData';
import { isToday, isTomorrow } from '@/utils/date';

function calculateRisk(treatment: string): { level: 'high' | 'medium' | 'low'; tags: string[] } {
  const tags: string[] = [];
  
  for (const item of highRiskKeywords) {
    if (treatment.includes(item.keyword)) {
      tags.push(item.tag);
    }
  }
  
  if (tags.length > 0) {
    return { level: 'high', tags };
  }
  
  if (treatment.includes('补牙') || treatment.includes('洁牙') || treatment.includes('假牙')) {
    return { level: 'medium', tags: [] };
  }
  
  return { level: 'low', tags: [] };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

interface PatientState {
  patients: Patient[];
  dateFilter: DateFilter;
  doctorFilter: string;
  treatmentFilter: string;
  confirmedDateFilter: DateFilter;
  followupFilter: FollowupFilter;
  
  setDateFilter: (filter: DateFilter) => void;
  setDoctorFilter: (filter: string) => void;
  setTreatmentFilter: (filter: string) => void;
  setConfirmedDateFilter: (filter: DateFilter) => void;
  setFollowupFilter: (filter: FollowupFilter) => void;
  
  resetPendingFilters: () => void;
  resetConfirmedFilter: () => void;
  resetFollowupFilter: () => void;
  clearFilters: () => void;
  
  sendReminder: (id: string, method: ReminderMethod, remark?: string) => void;
  markArrived: (id: string) => void;
  markNoShow: (id: string, reason: NoShowReason) => void;
  addFollowupRecord: (id: string, result: FollowupResult, note: string, nextFollowupDate?: string, rescheduledTime?: string) => void;
  
  getFilteredPendingPatients: () => Patient[];
  getPendingPatients: () => Patient[];
  getPendingDoctors: () => string[];
  getPendingTreatments: () => string[];
  getConfirmedPatientsToHandle: () => Patient[];
  getConfirmedPatientsHandled: () => Patient[];
  getFollowupPatients: () => Patient[];
  getFilteredFollowupPatients: () => Patient[];
  getAllConfirmedToHandle: () => Patient[];
  
  resetData: () => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: mockPatients,
      dateFilter: 'today',
      doctorFilter: '',
      treatmentFilter: '',
      confirmedDateFilter: 'today',
      followupFilter: 'all',

      setDateFilter: (filter) => set({ dateFilter: filter }),
      setDoctorFilter: (filter) => set({ doctorFilter: filter }),
      setTreatmentFilter: (filter) => set({ treatmentFilter: filter }),
      setConfirmedDateFilter: (filter) => set({ confirmedDateFilter: filter }),
      setFollowupFilter: (filter) => set({ followupFilter: filter }),

      resetPendingFilters: () => set({ dateFilter: 'today', doctorFilter: '', treatmentFilter: '' }),
      resetConfirmedFilter: () => set({ confirmedDateFilter: 'today' }),
      resetFollowupFilter: () => set({ followupFilter: 'all' }),
      clearFilters: () => set({ dateFilter: 'today', doctorFilter: '', treatmentFilter: '' }),

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
                  ...calculateRisk(p.treatment),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      addFollowupRecord: (id, result, note, nextFollowupDate, rescheduledTime) =>
        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id !== id) return p;
            
            const newRecord: FollowupRecord = {
              id: generateId(),
              date: new Date().toISOString(),
              result,
              note,
              nextFollowupDate,
              rescheduledTime,
              createdAt: new Date().toISOString(),
            };

            const existingRecords = p.followupRecords || [];
            
            const isRescheduled = result === 'rescheduled' && rescheduledTime;
            
            return {
              ...p,
              followupRecords: [newRecord, ...existingRecords],
              nextFollowupDate: isRescheduled ? undefined : nextFollowupDate,
              appointmentTime: isRescheduled ? rescheduledTime : p.appointmentTime,
              status: isRescheduled ? 'pending' as PatientStatus : p.status,
              reminderMethod: isRescheduled ? undefined : p.reminderMethod,
              remark: isRescheduled ? undefined : p.remark,
              noShowReason: isRescheduled ? undefined : p.noShowReason,
              riskLevel: isRescheduled ? undefined : p.riskLevel,
              riskTags: isRescheduled ? undefined : p.riskTags,
              lastTreatmentDate: isRescheduled ? undefined : p.lastTreatmentDate,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      getFilteredPendingPatients: () => {
        const { patients, dateFilter, doctorFilter, treatmentFilter } = get();
        return patients
          .filter((p) => p.status === 'pending')
          .filter((p) => {
            if (dateFilter === 'today') return isToday(p.appointmentTime);
            if (dateFilter === 'tomorrow') return isTomorrow(p.appointmentTime);
            return true;
          })
          .filter((p) => {
            if (!doctorFilter) return true;
            return p.doctor === doctorFilter;
          })
          .filter((p) => {
            if (!treatmentFilter) return true;
            return p.treatment === treatmentFilter;
          })
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      getPendingPatients: () => {
        const { patients } = get();
        return patients
          .filter((p) => p.status === 'pending')
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      getPendingDoctors: () => {
        const { patients } = get();
        const doctors = patients
          .filter((p) => p.status === 'pending')
          .map((p) => p.doctor);
        return [...new Set(doctors)];
      },

      getPendingTreatments: () => {
        const { patients } = get();
        const treatments = patients
          .filter((p) => p.status === 'pending')
          .map((p) => p.treatment);
        return [...new Set(treatments)];
      },

      getConfirmedPatientsToHandle: () => {
        const { patients, confirmedDateFilter } = get();
        return patients
          .filter((p) => p.status === 'confirmed')
          .filter((p) => {
            if (confirmedDateFilter === 'today') return isToday(p.appointmentTime);
            if (confirmedDateFilter === 'tomorrow') return isTomorrow(p.appointmentTime);
            return true;
          })
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      getConfirmedPatientsHandled: () => {
        const { patients, confirmedDateFilter } = get();
        return patients
          .filter((p) => p.status === 'arrived' || p.status === 'no_show' || p.status === 'followup')
          .filter((p) => {
            if (confirmedDateFilter === 'today') return isToday(p.appointmentTime);
            if (confirmedDateFilter === 'tomorrow') return isTomorrow(p.appointmentTime);
            return true;
          })
          .sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime());
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
            
            if (a.nextFollowupDate && b.nextFollowupDate) {
              return new Date(a.nextFollowupDate).getTime() - new Date(b.nextFollowupDate).getTime();
            }
            if (a.nextFollowupDate) return -1;
            if (b.nextFollowupDate) return 1;
            
            return new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime();
          });
      },

      getFilteredFollowupPatients: () => {
        const { followupFilter } = get();
        const patients = get().getFollowupPatients();
        
        return patients.filter((p) => {
          if (followupFilter === 'today') {
            return p.nextFollowupDate && isToday(p.nextFollowupDate);
          }
          if (followupFilter === 'high_risk') {
            return p.riskLevel === 'high';
          }
          return true;
        });
      },

      getAllConfirmedToHandle: () => {
        const { patients } = get();
        return patients
          .filter((p) => p.status === 'confirmed')
          .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());
      },

      resetData: () => set({ 
        patients: mockPatients,
        dateFilter: 'today',
        doctorFilter: '',
        treatmentFilter: '',
        confirmedDateFilter: 'today',
        followupFilter: 'all',
      }),
    }),
    {
      name: 'dental-reminder-data',
    }
  )
);
