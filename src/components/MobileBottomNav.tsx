import React from 'react';
import { Activity, Bell, MapPin, LayoutDashboard } from 'lucide-react';
import { NodeMode } from '../types';
import { useTranslation } from '../services/i18n';

interface MobileBottomNavProps {
  currentMode: NodeMode;
  onSelectMode: (mode: NodeMode) => void;
  activeAlertCount: number;
  isArmed: boolean;
  isPaused: boolean;
  isDarkMode: boolean;
  isAdmin?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentMode,
  onSelectMode,
  activeAlertCount,
  isArmed,
  isPaused,
  isAdmin = false,
}) => {
  const { t } = useTranslation();

  // Villagers and guests only see Village and Alerts tabs.
  // Admins get full app access (Dashboard, Sensor, Alerts, Village).
  interface NavTab {
    id: NodeMode;
    label: string;
    icon: React.ForwardRefExoticComponent<any>;
    statusDot?: string | null;
    badge?: number | null;
  }

  const adminTabs: NavTab[] = [
    {
      id: 'admin',
      label: t.navDashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'sensor',
      label: t.navSensor,
      icon: Activity,
      statusDot: isArmed
        ? isPaused
          ? 'bg-[#B06000]'
          : 'bg-[#137333]'
        : null,
    },
    {
      id: 'receiver',
      label: t.navAlerts,
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
    },
    {
      id: 'village',
      label: t.navVillage,
      icon: MapPin,
    },
  ];

  const villagerTabs: NavTab[] = [
    {
      id: 'village',
      label: t.navVillage,
      icon: MapPin,
    },
    {
      id: 'receiver',
      label: t.navAlerts,
      icon: Bell,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
    },
  ];

  const tabs = isAdmin ? adminTabs : villagerTabs;

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 12px)' }}
      className="md:hidden shrink-0 sticky bottom-0 z-40 w-full bg-white/95 sm:bg-[#FEF7FF]/95 backdrop-blur-xl border-t border-slate-200/90 select-none shadow-[0_-3px_15px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-md mx-auto px-1 sm:px-2 pt-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentMode === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => onSelectMode(tab.id)}
              className="flex-1 py-1 flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer group min-h-[50px] touch-manipulation"
            >
              {/* Material 3 Elliptical Tonal Indicator */}
              <div
                className={`w-14 sm:w-16 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#E0EFFF] text-[#1F71E8] font-bold shadow-2xs'
                    : 'bg-transparent text-[#49454F] group-hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />

                {/* Status Dot */}
                {tab.statusDot && (
                  <span
                    className={`absolute top-1 right-2.5 sm:right-3 w-2.5 h-2.5 rounded-full ring-2 ring-white ${tab.statusDot}`}
                  />
                )}

                {/* Badge Number */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#BA1A1A] text-white font-mono text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] sm:text-xs tracking-tight text-center leading-tight transition-colors truncate max-w-[85px] block ${
                  isActive
                    ? 'text-[#1F71E8] font-bold'
                    : 'text-[#49454F] font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
