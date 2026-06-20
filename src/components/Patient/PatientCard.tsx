import { Phone, MessageCircle, Users, Clock, User, Stethoscope, Calendar } from 'lucide-react';
import type { Patient } from '@/types';
import { formatTime, isToday, isTomorrow, formatChineseDate } from '@/utils/date';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  actionSlot?: React.ReactNode;
  variant?: 'pending' | 'confirmed' | 'followup';
}

export function PatientCard({ patient, onClick, actionSlot, variant = 'pending' }: PatientCardProps) {
  const timeLabel = formatTime(patient.appointmentTime);
  const isTodayAppointment = isToday(patient.appointmentTime);
  const isTomorrowAppointment = isTomorrow(patient.appointmentTime);

  const getDateLabel = () => {
    if (isTodayAppointment) return '今天';
    if (isTomorrowAppointment) return '明天';
    return formatChineseDate(patient.appointmentTime);
  };

  const getRiskBadge = () => {
    if (variant === 'followup' || !patient.riskTags?.length) return null;
    return patient.riskTags.map((tag, index) => (
      <Badge key={index} variant="danger" size="sm">
        {tag}
      </Badge>
    ));
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200',
        onClick && 'active:scale-[0.98] cursor-pointer hover:shadow-md hover:border-gray-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-20 flex flex-col items-center justify-center py-2 bg-primary-50 rounded-xl">
          <span className="text-2xl font-bold text-primary-600">{timeLabel}</span>
          <span className="text-xs text-primary-500 mt-1">{getDateLabel()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{patient.name}</h3>
            {variant === 'confirmed' && patient.status === 'arrived' && (
              <Badge variant="success">已到诊</Badge>
            )}
            {variant === 'confirmed' && patient.status === 'confirmed' && (
              <Badge variant="primary">待到诊</Badge>
            )}
            {getRiskBadge()}
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Stethoscope size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{patient.treatment}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-gray-400 flex-shrink-0" />
              <span>{patient.doctor}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} className="text-gray-400 flex-shrink-0" />
              <span>{patient.phone}</span>
            </div>
          </div>

          {patient.remark && (
            <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                <span className="text-gray-400">备注：</span>
                {patient.remark}
              </p>
            </div>
          )}

          {patient.reminderMethod && variant === 'confirmed' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">提醒方式：</span>
              <Badge variant="default" size="sm">
                {patient.reminderMethod === 'sms' && <MessageCircle size={12} className="mr-1" />}
                {patient.reminderMethod === 'phone' && <Phone size={12} className="mr-1" />}
                {patient.reminderMethod === 'wecom' && <Users size={12} className="mr-1" />}
                {patient.reminderMethod === 'sms' ? '短信' : patient.reminderMethod === 'phone' ? '电话' : '企微'}
              </Badge>
            </div>
          )}

          {variant === 'followup' && patient.lastTreatmentDate && (
            <div className="mt-2 flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                距上次治疗 <span className="font-semibold text-accent-600">{getDaysSinceTreatment(patient.lastTreatmentDate)}</span> 天
              </span>
            </div>
          )}
        </div>

        {actionSlot && (
          <div className="flex-shrink-0 flex flex-col gap-2">
            {actionSlot}
          </div>
        )}
      </div>
    </div>
  );
}

function getDaysSinceTreatment(dateStr: string): number {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
