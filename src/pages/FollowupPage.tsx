import { AlertTriangle, Clock, Phone, RefreshCw } from 'lucide-react';
import { PatientCard } from '@/components/Patient/PatientCard';
import { Badge } from '@/components/common/Badge';
import { usePatientStore } from '@/store/usePatientStore';
import { noShowReasonLabels } from '@/types';
import { daysSince } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function FollowupPage() {
  const { getFollowupPatients, resetData } = usePatientStore();
  const patients = getFollowupPatients();

  const highRiskCount = patients.filter((p) => p.riskLevel === 'high').length;

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

              return (
                <div
                  key={patient.id}
                  className={cn(
                    'rounded-2xl overflow-hidden transition-all duration-200',
                    isHighRisk ? 'ring-2 ring-red-200' : ''
                  )}
                >
                  {isHighRisk && (
                    <div className="bg-red-50 px-4 py-2 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-xs font-medium text-red-600">高风险 · 优先跟进</span>
                    </div>
                  )}
                  <PatientCard
                    patient={patient}
                    variant="followup"
                    actionSlot={
                      <button
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform hover:bg-primary-600"
                      >
                        <Phone size={16} />
                        跟进
                      </button>
                    }
                  />
                  {patient.noShowReason && (
                    <div className="bg-white px-5 pb-4 -mt-1">
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-400">爽约原因：</span>
                        <Badge variant="warning" size="sm">
                          {noShowReasonLabels[patient.noShowReason]}
                        </Badge>
                        <div className="flex-1" />
                        <span className={cn(
                          'text-sm font-semibold',
                          days > 30 ? 'text-red-500' : days > 14 ? 'text-accent-500' : 'text-gray-500'
                        )}>
                          已过 {days} 天
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
