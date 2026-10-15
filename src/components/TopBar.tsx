import React from 'react';
import { Info, User, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { NodeMode, UserProfile } from '../types';

interface TopBarProps {
  currentMode: NodeMode;
  isOnline: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  isDarkMode?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  isOnline,
  isRefreshing = false,
  onRefresh,
  currentUser,
  onOpenAuth,
  onOpenAbout,
}) => {
  const modeLabel =
    currentMode === 'admin'
      ? 'Dashboard'
      : currentMode === 'sensor'
      ? 'Sensor Node'
      : currentMode === 'receiver'
      ? 'Alerts'
      : 'Village';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-xs select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#1F71E8] text-white flex items-center justify-center shrink-0 shadow-xs">
          <span className="text-sm font-black leading-none">FA</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
            Flood Alert
          </h1>
          <p className="text-[11px] text-slate-500 font-medium truncate">{modeLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Online / Offline indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
          title={isOnline ? 'Online' : 'Offline — using cached data'}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Manual refresh */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Sync with Firebase"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* About / Privacy / Terms */}
        <button
          type="button"
          id="btn-open-about-legal"
          onClick={onOpenAbout}
          className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition active:scale-95 cursor-pointer"
          title="About, Privacy & Terms"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Sign in / Profile */}
        <button
          type="button"
          id="btn-open-auth"
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1F71E8] hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs min-h-[36px]"
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline truncate max-w-[80px]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Sign in'}
          </span>
        </button>
      </div>
    </header>
  );
};
