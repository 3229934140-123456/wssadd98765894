import { useState } from 'react';
import { X, MessageCircle, Phone, Users } from 'lucide-react';
import type { ReminderMethod } from '@/types';
import { cn } from '@/lib/utils';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: ReminderMethod, remark: string) => void;
  patientName?: string;
}

export function ReminderModal({ isOpen, onClose, onConfirm, patientName }: ReminderModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<ReminderMethod | null>(null);
  const [remark, setRemark] = useState('');

  const handleConfirm = () => {
    if (!selectedMethod) return;
    onConfirm(selectedMethod, remark);
    setSelectedMethod(null);
    setRemark('');
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setRemark('');
    onClose();
  };

  if (!isOpen) return null;

  const methods: { id: ReminderMethod; label: string; icon: typeof Phone; color: string }[] = [
    { id: 'sms', label: '短信', icon: MessageCircle, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { id: 'phone', label: '电话', icon: Phone, color: 'text-green-500 bg-green-50 border-green-200' },
    { id: 'wecom', label: '企微', icon: Users, color: 'text-primary-500 bg-primary-50 border-primary-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up pb-safe">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            提醒 {patientName || '患者'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择提醒方式
            </label>
            <div className="grid grid-cols-3 gap-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                    selectedMethod === method.id
                      ? 'border-primary-500 bg-primary-50 scale-105 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    method.color
                  )}>
                    <method.icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注信息
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="例如：患者说可能晚到 20 分钟、家长代孩子确认..."
              className="w-full h-24 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod}
            className={cn(
              'w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200',
              selectedMethod
                ? 'bg-primary-500 text-white active:scale-[0.98] hover:bg-primary-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            确认提醒
          </button>
        </div>
      </div>
    </div>
  );
}
