import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { ReminderModal } from '@/components/Modal/ReminderModal';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient, ReminderMethod } from '@/types';
import { formatChineseDate, isToday, isTomorrow } from '@/utils/date';

export default function PendingPage() {
  const { getPendingPatients, sendReminder } = usePatientStore();
  const patients = getPendingPatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleConfirmReminder = (method: ReminderMethod, remark: string) => {
    if (selectedPatient) {
      sendReminder(selectedPatient.id, method, remark);
    }
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const todayPatients = patients.filter((p) => isToday(p.appointmentTime));
  const tomorrowPatients = patients.filter((p) => isTomorrow(p.appointmentTime));
  const laterPatients = patients.filter((p) => !isToday(p.appointmentTime) && !isTomorrow(p.appointmentTime));

  const today = new Date();

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
          <p className="text-sm text-gray-500">
            今日待提醒 <span className="font-semibold text-primary-600">{todayPatients.length}</span> 位患者
          </p>
        </div>

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={40} className="text-primary-400" />
            </div>
            <p className="text-gray-400 text-lg">暂无待提醒患者</p>
            <p className="text-gray-300 text-sm mt-1">今天的提醒都完成啦 🎉</p>
          </div>
        ) : (
          <div className="space-y-6">
            {todayPatients.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                  今天
                </h2>
                <div className="space-y-3">
                  {todayPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      variant="pending"
                      onClick={() => handleCardClick(patient)}
                    />
                  ))}
                </div>
              </div>
            )}

            {tomorrowPatients.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gray-300 rounded-full"></span>
                  明天
                </h2>
                <div className="space-y-3">
                  {tomorrowPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      variant="pending"
                      onClick={() => handleCardClick(patient)}
                    />
                  ))}
                </div>
              </div>
            )}

            {laterPatients.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gray-200 rounded-full"></span>
                  稍后
                </h2>
                <div className="space-y-3">
                  {laterPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      variant="pending"
                      onClick={() => handleCardClick(patient)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReminder}
        patientName={selectedPatient?.name}
      />
    </div>
  );
}
