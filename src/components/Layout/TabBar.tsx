import { NavLink } from 'react-router-dom';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { usePatientStore } from '@/store/usePatientStore';

export function TabBar() {
  const { getPendingPatients, getConfirmedPatients, getFollowupPatients } = usePatientStore();
  const pendingCount = getPendingPatients().length;
  const confirmedCount = getConfirmedPatients().filter(p => p.status === 'confirmed').length;
  const followupCount = getFollowupPatients().length;

  const tabs = [
    { to: '/', label: '待提醒', icon: Bell, count: pendingCount },
    { to: '/confirmed', label: '已确认', icon: CheckCircle, count: confirmedCount },
    { to: '/followup', label: '需跟进', icon: Clock, count: followupCount },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex-1 flex items-center justify-around">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-primary-600 bg-primary-50 scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="relative">
                  <tab.icon size={22} strokeWidth={2} />
                  {tab.count > 0 && (
                    <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] bg-accent-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                      {tab.count > 99 ? '99+' : tab.count}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{tab.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
