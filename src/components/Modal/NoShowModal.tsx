import { X, Clock, Briefcase, PhoneOff, Ban } from 'lucide-react';
import type { NoShowReason } from '@/types';
import { noShowReasonLabels } from '@/types';
import { cn } from '@/lib/utils';

interface NoShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: NoShowReason) => void;
  patientName?: string;
}

export function NoShowModal({ isOpen, onClose, onConfirm, patientName }: NoShowModalProps) {
  if (!isOpen) return null;

  const reasons: { id: NoShowReason; icon: typeof Clock; color: string }[] = [
    { id: 'forgot', icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { id: 'busy', icon: Briefcase, color: 'text-blue-500 bg-blue-50' },
    { id: 'unreachable', icon: PhoneOff, color: 'text-gray-500 bg-gray-100' },
    { id: 'unwilling', icon: Ban, color: 'text-red-500 bg-red-50' },
  ];

  const handleSelect = (reason: NoShowReason) => {
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl animate-slide-up pb-safe">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            标记 {patientName || '患者'} 爽约
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-500 mb-4">请选择爽约原因：</p>
          <div className="grid grid-cols-2 gap-3">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => handleSelect(reason.id)}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 active:scale-[0.97] bg-white"
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center',
                  reason.color
                )}>
                  <reason.icon size={28} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {noShowReasonLabels[reason.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-semibold text-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors active:scale-[0.98]"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
