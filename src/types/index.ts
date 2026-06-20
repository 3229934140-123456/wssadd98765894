export type PatientStatus = 'pending' | 'confirmed' | 'arrived' | 'no_show' | 'followup';

export type ReminderMethod = 'sms' | 'phone' | 'wecom';

export type NoShowReason = 'forgot' | 'busy' | 'unreachable' | 'unwilling';

export type RiskLevel = 'high' | 'medium' | 'low';

export type FollowupResult = 'promised_arrival' | 'rescheduled' | 'needs_callback' | 'unreachable' | 'unwilling' | 'other';

export type DateFilter = 'today' | 'tomorrow' | 'all';

export type FollowupFilter = 'all' | 'today' | 'high_risk';

export interface FollowupRecord {
  id: string;
  date: string;
  result: FollowupResult;
  note: string;
  nextFollowupDate?: string;
  rescheduledTime?: string;
  createdAt: string;
}

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
  followupRecords?: FollowupRecord[];
  nextFollowupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  dateFilter: DateFilter;
  doctorFilter: string;
  treatmentFilter: string;
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

export const followupResultLabels: Record<FollowupResult, string> = {
  promised_arrival: '承诺到院',
  rescheduled: '已改约',
  needs_callback: '需再联系',
  unreachable: '仍联系不上',
  unwilling: '不愿继续治疗',
  other: '其他',
};

export const statusLabels: Record<PatientStatus, string> = {
  pending: '待提醒',
  confirmed: '已确认',
  arrived: '已到诊',
  no_show: '爽约',
  followup: '需跟进',
};

export const highRiskKeywords = [
  { keyword: '根管', tag: '根管未完成' },
  { keyword: '正畸', tag: '正畸复诊超期' },
  { keyword: '种植', tag: '种植术后拆线' },
  { keyword: '拔牙', tag: '拔牙后复查' },
];

export const highRiskTreatments = ['根管治疗', '根管治疗复诊', '根管治疗复查', '正畸', '正畸复诊', '正畸常规复诊', '正畸复诊调整', '种植', '种植牙', '种植术后', '种植牙二期', '种植术后拆线'];
