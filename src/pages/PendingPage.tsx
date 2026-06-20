import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Filter, X, ChevronDown, User, Stethoscope } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { ReminderModal } from '@/components/Modal/ReminderModal';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient, ReminderMethod, DateFilter } from '@/types';
import { formatChineseDate, isToday, isTomorrow } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function PendingPage() {
  const {
    getFilteredPendingPatients,
    getPendingDoctors,
    getPendingTreatments,
    getPendingPatients,
    dateFilter,
    doctorFilter,
    treatmentFilter,
    setDateFilter,
    setDoctorFilter,
    setTreatmentFilter,
    clearFilters,
    resetPendingFilters,
    sendReminder,
  } = usePatientStore();

  const patients = getFilteredPendingPatients();
  const allPatients = getPendingPatients();
  const doctors = getPendingDoctors();
  const treatments = getPendingTreatments();

  const location = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const state = location.state as { dateFilter?: DateFilter } | null;
    if (state?.dateFilter) {
      resetPendingFilters();
      setDateFilter(state.dateFilter);
    } else {
      resetPendingFilters();
    }
  }, []);

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

  const todayPatients = allPatients.filter((p) => isToday(p.appointmentTime));
  const tomorrowPatients = allPatients.filter((p) => isTomorrow(p.appointmentTime));

  const today = new Date();

  const dateTabs: { value: DateFilter; label: string; count: number }[] = [
    { value: 'today', label: '今天', count: todayPatients.length },
    { value: 'tomorrow', label: '明天', count: tomorrowPatients.length },
    { value: 'all', label: '全部', count: allPatients.length },
  ];

  const hasActiveFilters = doctorFilter || treatmentFilter || dateFilter !== 'today';

  const groupedPatients = () => {
    if (dateFilter === 'today' || dateFilter === 'tomorrow') {
      return [{ label: dateFilter === 'today' ? '今天' : '明天', patients, showTitle: false }];
    }
    
    const today = patients.filter((p) => isToday(p.appointmentTime));
    const tomorrow = patients.filter((p) => isTomorrow(p.appointmentTime));
    const later = patients.filter((p) => !isToday(p.appointmentTime) && !isTomorrow(p.appointmentTime));
    
    const groups = [];
    if (today.length > 0) groups.push({ label: '今天', patients: today, showTitle: true });
    if (tomorrow.length > 0) groups.push({ label: '明天', patients: tomorrow, showTitle: true });
    if (later.length > 0) groups.push({ label: '稍后', patients: later, showTitle: true });
    return groups;
  };

  const displayGroups = groupedPatients();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-primary-500" />
              <span className="text-lg font-semibold text-gray-800">
                {formatChineseDate(today)}
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                hasActiveFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <Filter size={16} />
              筛选
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {[doctorFilter, treatmentFilter, dateFilter !== 'today'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            当前显示 <span className="font-semibold text-primary-600">{patients.length}</span> 位待提醒患者
          </p>
        </div>

        <div className="bg-white rounded-2xl p-1 mb-4 shadow-sm border border-gray-100">
          <div className="flex">
            {dateTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setDateFilter(tab.value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all',
                  dateFilter === tab.value
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  dateFilter === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-800">筛选条件</span>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <X size={14} />
                清除
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                  <User size={14} />
                  医生
                </label>
                <div className="relative">
                  <select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">全部医生</option>
                    {doctors.map((doctor) => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                  <Stethoscope size={14} />
                  复诊项目
                </label>
                <div className="relative">
                  <select
                    value={treatmentFilter}
                    onChange={(e) => setTreatmentFilter(e.target.value)}
                    className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">全部项目</option>
                    {treatments.map((treatment) => (
                      <option key={treatment} value={treatment}>{treatment}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={40} className="text-primary-400" />
            </div>
            <p className="text-gray-400 text-lg">暂无待提醒患者</p>
            <p className="text-gray-300 text-sm mt-1">
              {hasActiveFilters ? '当前筛选条件下没有患者' : '今天的提醒都完成啦 🎉'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {displayGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {group.showTitle && (
                  <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <span className={cn(
                      'w-1 h-4 rounded-full',
                      group.label === '今天' ? 'bg-primary-500' : group.label === '明天' ? 'bg-gray-300' : 'bg-gray-200'
                    )}></span>
                    {group.label}
                  </h2>
                )}
                <div className="space-y-3">
                  {group.patients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      variant="pending"
                      onClick={() => handleCardClick(patient)}
                    />
                  ))}
                </div>
              </div>
            ))}
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
