import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Clock, AlertTriangle, Calendar, Sunrise, TrendingUp } from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';
import { formatChineseDate, isToday } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    getPendingPatients, 
    getConfirmedPatientsToHandle, 
    getFollowupPatients,
    resetPendingFilters,
    resetConfirmedFilter,
    resetFollowupFilter,
    setFollowupFilter,
  } = usePatientStore();

  const today = new Date();
  const allPending = getPendingPatients();
  const todayPending = allPending.filter((p) => isToday(p.appointmentTime));
  const toHandleToday = getConfirmedPatientsToHandle().filter((p) => isToday(p.appointmentTime));
  const allFollowup = getFollowupPatients();
  const todayFollowup = allFollowup.filter((p) => p.nextFollowupDate && isToday(p.nextFollowupDate));
  const highRiskFollowup = allFollowup.filter((p) => p.riskLevel === 'high');

  const stats = [
    {
      label: '今日待提醒',
      value: todayPending.length,
      icon: Bell,
      color: 'primary',
      bgGradient: 'from-primary-50 to-primary-100',
      iconBg: 'bg-primary-500',
      action: () => {
        resetPendingFilters();
        navigate('/pending', { state: { fromDashboard: true } });
      },
      hint: '点击查看全部',
    },
    {
      label: '待核对到诊',
      value: toHandleToday.length,
      icon: CheckCircle,
      color: 'accent',
      bgGradient: 'from-accent-50 to-orange-100',
      iconBg: 'bg-accent-500',
      action: () => {
        resetConfirmedFilter();
        navigate('/confirmed', { state: { fromDashboard: true } });
      },
      hint: '点击去核对',
    },
    {
      label: '今日需跟进',
      value: todayFollowup.length,
      icon: Clock,
      color: 'amber',
      bgGradient: 'from-amber-50 to-yellow-100',
      iconBg: 'bg-amber-500',
      action: () => {
        resetFollowupFilter();
        setFollowupFilter('today');
        navigate('/followup', { state: { fromDashboard: true } });
      },
      hint: '点击去跟进',
    },
    {
      label: '高风险爽约',
      value: highRiskFollowup.length,
      icon: AlertTriangle,
      color: 'red',
      bgGradient: 'from-red-50 to-rose-100',
      iconBg: 'bg-red-500',
      action: () => {
        resetFollowupFilter();
        setFollowupFilter('high_risk');
        navigate('/followup', { state: { fromDashboard: true } });
      },
      hint: '优先追回',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-gray-50 to-gray-50 pb-8">
      <div className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Sunrise size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">早上好</h1>
              <p className="text-sm text-gray-500">今天也要加油哦 💪</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Calendar size={16} className="text-primary-500" />
            <span className="text-base font-medium text-gray-700">
              {formatChineseDate(today)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={stat.action}
              className={cn(
                'relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.97] hover:shadow-md',
                'bg-gradient-to-br',
                stat.bgGradient
              )}
            >
              <div className="absolute top-3 right-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
                  stat.iconBg
                )}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
              <div className="pt-1">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  {stat.hint}
                  <TrendingUp size={12} />
                </p>
              </div>
            </button>
          ))}
        </div>

        {todayPending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                今日待提醒
              </h2>
              <button
                onClick={() => navigate('/pending')}
                className="text-sm text-primary-600 font-medium"
              >
                查看全部 →
              </button>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
              <div className="space-y-2">
                {todayPending.slice(0, 3).map((patient, index) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">
                        {patient.appointmentTime.slice(11, 16)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{patient.name}</p>
                      <p className="text-xs text-gray-500 truncate">{patient.treatment}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{patient.doctor}</span>
                  </div>
                ))}
                {todayPending.length > 3 && (
                  <p className="text-center text-xs text-gray-400 pt-2 border-t border-gray-50">
                    还有 {todayPending.length - 3} 位待提醒
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {highRiskFollowup.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                高风险待跟进
              </h2>
              <button
                onClick={() => navigate('/followup')}
                className="text-sm text-red-600 font-medium"
              >
                全部跟进 →
              </button>
            </div>
            <div className="bg-red-50/50 rounded-2xl p-3 border border-red-100">
              <div className="space-y-2">
                {highRiskFollowup.slice(0, 3).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{patient.name}</p>
                      <p className="text-xs text-red-500 truncate">
                        {patient.riskTags?.[0] || '高风险'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/followup')}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg flex-shrink-0"
                    >
                      跟进
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {todayPending.length === 0 && highRiskFollowup.length === 0 && toHandleToday.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <p className="text-gray-600 text-lg font-medium">今日暂无待办事项</p>
            <p className="text-gray-400 text-sm mt-1">难得清闲，喝杯咖啡休息一下吧 ☕</p>
          </div>
        )}
      </div>
    </div>
  );
}
