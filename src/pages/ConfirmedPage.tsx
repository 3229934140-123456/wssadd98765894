import { useState } from 'react';
import { Check, XCircle, Calendar } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { NoShowModal } from '@/components/Modal/NoShowModal';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient, NoShowReason } from '@/types';
import { formatChineseDate } from '@/utils/date';

export default function ConfirmedPage() {
  const { getConfirmedPatients, markArrived, markNoShow } = usePatientStore();
  const patients = getConfirmedPatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);

  const handleArrived = (patient: Patient) => {
    markArrived(patient.id);
  };

  const handleNoShowClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsNoShowModalOpen(true);
  };

  const handleNoShowConfirm = (reason: NoShowReason) => {
    if (selectedPatient) {
      markNoShow(selectedPatient.id, reason);
    }
    setSelectedPatient(null);
  };

  const today = new Date();
  const pendingCount = patients.filter((p) => p.status === 'confirmed').length;
  const arrivedCount = patients.filter((p) => p.status === 'arrived').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-primary-500" />
            <span className="text-lg font-semibold text-gray-800">
              {formatChineseDate(today)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              待到诊 <span className="font-semibold text-accent-600">{pendingCount}</span> 位
            </span>
            <span className="text-gray-500">
              已到诊 <span className="font-semibold text-green-600">{arrivedCount}</span> 位
            </span>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">暂无已确认患者</p>
            <p className="text-gray-300 text-sm mt-1">提醒后的患者会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                variant="confirmed"
                actionSlot={
                  patient.status === 'confirmed' ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArrived(patient);
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform hover:bg-green-600"
                      >
                        <Check size={16} />
                        已到
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNoShowClick(patient);
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium active:scale-95 transition-transform hover:bg-red-100 border border-red-200"
                      >
                        <XCircle size={16} />
                        爽约
                      </button>
                    </>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>

      <NoShowModal
        isOpen={isNoShowModalOpen}
        onClose={() => setIsNoShowModalOpen(false)}
        onConfirm={handleNoShowConfirm}
        patientName={selectedPatient?.name}
      />
    </div>
  );
}
