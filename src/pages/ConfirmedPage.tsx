import { useState, useEffect } from 'react';
import { Check, XCircle, Calendar, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { NoShowModal } from '@/components/Modal/NoShowModal';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient, NoShowReason, DateFilter } from '@/types';
import { noShowReasonLabels, statusLabels } from '@/types';
import { formatChineseDate, formatTime, isToday } from '@/utils/date';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/lib/utils';

export default function ConfirmedPage() {
  const { 
    getConfirmedPatientsToHandle, 
    getConfirmedPatientsHandled, 
    confirmedDateFilter,
    setConfirmedDateFilter,
    resetConfirmedFilter,
    markArrived, 
    markNoShow 
  } = usePatientStore();
  
  const toHandlePatients = getConfirmedPatientsToHandle();
  const handledPatients = getConfirmedPatientsHandled();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isNoShowModalOpen, setIsNoShowModalOpen] = useState(false);
  const [showHandled, setShowHandled] = useState(false);

  useEffect(() => {
    resetConfirmedFilter();
  }, []);

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
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateTabs: { value: DateFilter; label: string }[] = [
    { value: 'today', label: '今天' },
    { value: 'tomorrow', label: '明天' },
    { value: 'all', label: '全部' },
  ];

  const allEmpty = toHandlePatients.length === 0 && handledPatients.length === 0;
  const allDone = toHandlePatients.length === 0 && handledPatients.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-primary-500" />
            <span className="text-lg font-semibold text-gray-800">
              {confirmedDateFilter === 'today' ? formatChineseDate(today) : confirmedDateFilter === 'tomorrow' ? formatChineseDate(tomorrow) : '全部预约'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              待核对 <span className="font-semibold text-accent-600 text-base">{toHandlePatients.length}</span> 位
            </span>
            <span className="text-gray-500">
              已处理 <span className="font-semibold text-green-600 text-base">{handledPatients.length}</span> 位
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-1 mb-4 shadow-sm border border-gray-100">
          <div className="flex">
            {dateTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setConfirmedDateFilter(tab.value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all',
                  confirmedDateFilter === tab.value
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {toHandlePatients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-accent-500 rounded-full animate-pulse"></div>
              <h2 className="font-semibold text-gray-800">待核对到诊</h2>
              <Badge variant="accent" size="sm">{toHandlePatients.length}</Badge>
            </div>
            <div className="bg-accent-50/50 rounded-2xl p-3 border border-accent-200/50">
              <p className="text-xs text-accent-700 mb-3 flex items-center gap-1.5">
                <Clock size={12} />
                以下患者已确认预约，请核对到诊情况
              </p>
              <div className="space-y-3">
                {toHandlePatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-accent-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center py-2 bg-accent-100 rounded-xl">
                        <span className="text-xl font-bold text-accent-600">
                          {formatTime(patient.appointmentTime)}
                        </span>
                        {!isToday(patient.appointmentTime) && (
                          <span className="text-xs text-accent-500 mt-0.5">
                            {formatChineseDate(patient.appointmentTime).split(' ')[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{patient.treatment}</p>
                        <p className="text-xs text-gray-400">{patient.doctor} · {patient.phone}</p>
                        {patient.remark && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                            备注：{patient.remark}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArrived(patient);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform hover:bg-green-600 min-w-[80px]"
                        >
                          <Check size={16} />
                          已到
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNoShowClick(patient);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-medium active:scale-95 transition-transform hover:bg-red-100 border border-red-200 min-w-[80px]"
                        >
                          <XCircle size={16} />
                          爽约
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {allEmpty && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">暂无已确认患者</p>
            <p className="text-gray-300 text-sm mt-1">
              {confirmedDateFilter === 'today' ? '今天暂无已确认预约' : confirmedDateFilter === 'tomorrow' ? '明天暂无已确认预约' : '暂无已确认预约'}
            </p>
          </div>
        )}

        {allDone && !allEmpty && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
            <p className="text-green-700 font-semibold text-lg">
              {confirmedDateFilter === 'today' ? '今日患者已全部处理完毕！' : confirmedDateFilter === 'tomorrow' ? '明日患者已全部处理完毕！' : '所有患者已全部处理完毕！'}
            </p>
            <p className="text-green-600 text-sm mt-1">太棒了，核对工作完成啦 🎉</p>
          </div>
        )}

        {handledPatients.length > 0 && (
          <div>
            <button
              onClick={() => setShowHandled(!showHandled)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-medium text-gray-700">
                  {confirmedDateFilter === 'today' ? '今日' : confirmedDateFilter === 'tomorrow' ? '明日' : '全部'}已处理
                </span>
                <Badge variant="success" size="sm">{handledPatients.length}</Badge>
              </div>
              {showHandled ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </button>

            {showHandled && (
              <div className="mt-3 space-y-3 animate-fade-in">
                {handledPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={cn(
                      'bg-white rounded-xl p-4 border transition-all',
                      patient.status === 'arrived'
                        ? 'border-green-100 bg-green-50/30'
                        : 'border-gray-100 opacity-80'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-14 text-center">
                        <span className="text-lg font-bold text-gray-400">
                          {formatTime(patient.appointmentTime)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-700">{patient.name}</h3>
                          {patient.status === 'arrived' ? (
                            <Badge variant="success">已到诊</Badge>
                          ) : (
                            <Badge variant="danger">
                              {patient.noShowReason ? noShowReasonLabels[patient.noShowReason] : '爽约'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{patient.treatment} · {patient.doctor}</p>
                      </div>

                      <div className="text-xs text-gray-400">
                        {statusLabels[patient.status]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
