import { useState } from 'react';
import { AlertTriangle, Clock, Phone, RefreshCw, CalendarDays, MessageSquare, ChevronRight } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { Badge } from '@/components/common/Badge';
import { FollowupModal } from '@/components/Modal/FollowupModal';
import { usePatientStore } from '@/store/usePatientStore';
import type { Patient, FollowupResult } from '@/types';
import { noShowReasonLabels, followupResultLabels } from '@/types';
import { daysSince, formatChineseDate, isToday, isTomorrow } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function FollowupPage() {
  const { getFollowupPatients, resetData, addFollowupRecord } = usePatientStore();
  const patients = getFollowupPatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);

  const highRiskCount = patients.filter((p) => p.riskLevel === 'high').length;
  const needFollowupTodayCount = patients.filter((p) => {
    if (!p.nextFollowupDate) return false;
    return isToday(p.nextFollowupDate);
  }).length;

  const handleFollowupClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFollowupModalOpen(true);
  };

  const handleFollowupConfirm = (result: FollowupResult, note: string, nextFollowupDate?: string) => {
    if (selectedPatient) {
      addFollowupRecord(selectedPatient.id, result, note, nextFollowupDate);
    }
    setSelectedPatient(null);
  };

  const getLastFollowup = (patient: Patient) => {
    if (!patient.followupRecords || patient.followupRecords.length === 0) return null;
    const last = patient.followupRecords[0];
    return {
      date: last.date,
      result: followupResultLabels[last.result],
      note: last.note,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-accent-500" />
              <span className="text-lg font-semibold text-gray-800">需跟进患者</span>
            </div>
            <button
              onClick={resetData}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              重置数据
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              共 <span className="font-semibold text-gray-700">{patients.length}</span> 位待跟进
            </span>
            {highRiskCount > 0 && (
              <span className="text-red-500 font-medium">
                高风险 {highRiskCount} 位
              </span>
            )}
          </div>
        </div>

        {needFollowupTodayCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <CalendarDays size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">今日需跟进 {needFollowupTodayCount} 位患者</p>
                <p className="text-xs text-amber-500 mt-1">
                  请优先联系设置了今日跟进时间的患者
                </p>
              </div>
            </div>
          </div>
        )}

        {highRiskCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">优先跟进高风险病例</p>
                <p className="text-xs text-red-500 mt-1">
                  根管未完成、正畸复诊超期、种植术后拆线等病例需优先追回
                </p>
              </div>
            </div>
          </div>
        )}

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Clock size={40} className="text-green-400" />
            </div>
            <p className="text-gray-400 text-lg">暂无需跟进患者</p>
            <p className="text-gray-300 text-sm mt-1">所有患者都按时到诊啦 👏</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => {
              const days = patient.lastTreatmentDate ? daysSince(patient.lastTreatmentDate) : 0;
              const isHighRisk = patient.riskLevel === 'high';
              const lastFollowup = getLastFollowup(patient);
              const isFollowupToday = patient.nextFollowupDate && isToday(patient.nextFollowupDate);
              const isFollowupTomorrow = patient.nextFollowupDate && isTomorrow(patient.nextFollowupDate);

              return (
                <div
                  key={patient.id}
                  className={cn(
                    'rounded-2xl overflow-hidden transition-all duration-200',
                    isHighRisk ? 'ring-2 ring-red-200' : '',
                    isFollowupToday ? 'ring-2 ring-amber-300' : ''
                  )}
                >
                  {isHighRisk && (
                    <div className="bg-red-50 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-xs font-medium text-red-600">高风险 · 优先跟进</span>
                      </div>
                      {patient.riskTags && patient.riskTags.length > 0 && (
                        <div className="flex gap-1">
                          {patient.riskTags.map((tag, index) => (
                            <Badge key={index} variant="danger" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isFollowupToday && !isHighRisk && (
                    <div className="bg-amber-50 px-4 py-2 flex items-center gap-2">
                      <CalendarDays size={14} className="text-amber-500" />
                      <span className="text-xs font-medium text-amber-600">今日需跟进</span>
                    </div>
                  )}

                  <PatientCard
                    patient={patient}
                    variant="followup"
                    actionSlot={
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowupClick(patient);
                        }}
                        className={cn(
                          'flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform',
                          isFollowupToday || isHighRisk
                            ? 'bg-accent-500 text-white hover:bg-accent-600'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        )}
                      >
                        <Phone size={16} />
                        跟进
                      </button>
                    }
                  />

                  {lastFollowup && (
                    <div className="bg-white px-5 pb-3 -mt-1">
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(lastFollowup.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                            </span>
                            <Badge variant="primary" size="sm">
                              {lastFollowup.result}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{lastFollowup.note}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </div>
                  )}

                  <div className="bg-white px-5 pb-4">
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <span className="text-xs text-gray-400">爽约原因：</span>
                      {patient.noShowReason && (
                        <Badge variant="warning" size="sm">
                          {noShowReasonLabels[patient.noShowReason]}
                        </Badge>
                      )}
                      {patient.nextFollowupDate && (
                        <div className="flex items-center gap-1 ml-auto">
                          <CalendarDays size={12} className="text-primary-500" />
                          <span className="text-xs text-primary-600">
                            下次跟进：{formatChineseDate(patient.nextFollowupDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1" />
                      <span className={cn(
                        'text-sm font-semibold',
                        days > 30 ? 'text-red-500' : days > 14 ? 'text-accent-500' : 'text-gray-500'
                      )}>
                        已过 {days} 天
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        onConfirm={handleFollowupConfirm}
        patientName={selectedPatient?.name}
        lastFollowup={getLastFollowup(selectedPatient!)}
      />
    </div>
  );
}
