import { useState } from 'react';
import { X, Calendar, CheckCircle, Clock, PhoneOff, Ban, CalendarDays, MessageSquare } from 'lucide-react';
import type { FollowupResult } from '@/types';
import { followupResultLabels } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

interface FollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: FollowupResult, note: string, nextFollowupDate?: string) => void;
  patientName?: string;
  lastFollowup?: { date: string; result: string; note: string } | null;
}

export function FollowupModal({ isOpen, onClose, onConfirm, patientName, lastFollowup }: FollowupModalProps) {
  const [selectedResult, setSelectedResult] = useState<FollowupResult | null>(null);
  const [note, setNote] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [showNextDate, setShowNextDate] = useState(false);

  const handleConfirm = () => {
    if (!selectedResult) return;
    onConfirm(selectedResult, note, showNextDate && nextDate ? nextDate : undefined);
    setSelectedResult(null);
    setNote('');
    setNextDate('');
    setShowNextDate(false);
  };

  const handleClose = () => {
    setSelectedResult(null);
    setNote('');
    setNextDate('');
    setShowNextDate(false);
    onClose();
  };

  if (!isOpen) return null;

  const results: { id: FollowupResult; label: string; icon: typeof CheckCircle; color: string }[] = [
    { id: 'promised_arrival', label: '承诺到院', icon: CheckCircle, color: 'text-green-500 bg-green-50 border-green-200' },
    { id: 'rescheduled', label: '已改约', icon: CalendarDays, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { id: 'needs_callback', label: '需再联系', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'unreachable', label: '仍联系不上', icon: PhoneOff, color: 'text-gray-500 bg-gray-100 border-gray-200' },
    { id: 'unwilling', label: '不愿继续治疗', icon: Ban, color: 'text-red-500 bg-red-50 border-red-200' },
    { id: 'other', label: '其他', icon: MessageSquare, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = formatDate(tomorrow);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up pb-safe max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center justify-between p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              跟进记录 - {patientName || '患者'}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {lastFollowup && (
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-500 mb-2">上次跟进记录</p>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(lastFollowup.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                      {lastFollowup.result}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{lastFollowup.note}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              本次联系结果
            </label>
            <div className="grid grid-cols-2 gap-3">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                    selectedResult === result.id
                      ? 'border-primary-500 bg-primary-50 scale-105 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    result.color
                  )}>
                    <result.icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{result.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              跟进备注
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="请记录本次沟通内容，例如：患者承诺下周一上午10点到院、已改约至下周三下午..."
              className="w-full h-24 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-gray-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                设置下次联系时间
              </label>
              <button
                type="button"
                onClick={() => setShowNextDate(!showNextDate)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  showNextDate ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {showNextDate ? '取消' : '设置'}
              </button>
            </div>
            {showNextDate && (
              <input
                type="date"
                value={nextDate}
                min={minDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-5 pt-0 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            disabled={!selectedResult}
            className={cn(
              'w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200',
              selectedResult
                ? 'bg-primary-500 text-white active:scale-[0.98] hover:bg-primary-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            保存跟进记录
          </button>
        </div>
      </div>
    </div>
  );
}
