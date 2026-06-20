export type PatientStatus = 'pending' | 'confirmed' | 'arrived' | 'no_show' | 'followup';

export type ReminderMethod = 'sms' | 'phone' | 'wecom';

export type NoShowReason = 'forgot' | 'busy' | 'unreachable' | 'unwilling';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  treatment: string;
  doctor: string;
  appointmentTime: string;
  status: PatientStatus;
  reminderMethod?: ReminderMethod;
  remark?: string;
  noShowReason?: NoShowReason;
  lastTreatmentDate?: string;
  riskLevel?: RiskLevel;
  riskTags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const reminderMethodLabels: Record<ReminderMethod, string> = {
  sms: '短信',
  phone: '电话',
  wecom: '企微',
};

export const noShowReasonLabels: Record<NoShowReason, string> = {
  forgot: '忘记时间',
  busy: '临时有事',
  unreachable: '联系不上',
  unwilling: '不愿继续治疗',
};

export const statusLabels: Record<PatientStatus, string> = {
  pending: '待提醒',
  confirmed: '已确认',
  arrived: '已到诊',
  no_show: '爽约',
  followup: '需跟进',
};
