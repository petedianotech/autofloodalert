import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Check,
  Home,
  Mic,
  Building,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Phone,
  Shield,
  Info,
} from 'lucide-react';
import { UserProfile, ResidentSafetyReport, FloodAlert } from '../types';
import { useTranslation } from '../services/i18n';

interface VillageCommunityViewProps {
  currentUser: UserProfile | null;
  selectedVillage: string;
  onSelectVillage?: (v: string) => void;
  safetyReports?: ResidentSafetyReport[];
  alerts?: FloodAlert[];
  onOpenSafetyCheckIn?: () => void;
  onOpenVoiceSOS?: () => void;
  isDarkMode?: boolean;
}

/** Generic safe-zone guidance that works for any community name */
const GENERIC_SAFE_ZONES = [
  {
    title: 'Highest Ground Near You',
    description: 'Move to the highest solid ground available in your area. Avoid river banks and low-lying fields.',
    icon: 'hill',
  },
  {
    title: 'Community Building / School',
    description: 'If your village has a school, church, or community hall on higher ground, go there with your family.',
    icon: 'building',
  },
  {
    title: 'Stay Together & Keep Phone Charged',
    description: 'Keep your phone charged and stay with neighbours. Use the Safety Check-In button so others know you are safe.',
    icon: 'people',
  },
];

export const VillageCommunityView: React.FC<VillageCommunityViewProps> = ({
  currentUser,
  selectedVillage,
  onSelectVillage,
  safetyReports = [],
  alerts = [],
  onOpenSafetyCheckIn,
  onOpenVoiceSOS,
}) => {
  const { t } = useTranslation();
  const [customVillage, setCustomVillage] = useState(selectedVillage || '');

  const activeVillage = (currentUser?.village || selectedVillage || customVillage || 'Your Community').trim();
  const activeVillageData = { name: activeVillage };

  const villageReports = safetyReports.filter(
    (r) => (r.village || '').toLowerCase().includes(activeVillage.toLowerCase().split(' ')[0])
  );
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  const handleSetVillage = () => {
    const name = customVillage.trim();
    if (name && onSelectVillage) {
      onSelectVillage(name);
    }
  };

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1F71E8] text-white flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
              {activeVillage} Community
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Flood early-warning network for your area
            </p>
          </div>
        </div>

        {/* Free-text community name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Your village / community name
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={customVillage}
                onChange={(e) => setCustomVillage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetVillage()}
                placeholder="Type any community name"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 outline-none focus:border-[#1F71E8] focus:ring-1 focus:ring-[#1F71E8]"
              />
            </div>
            <button
              type="button"
              onClick={handleSetVillage}
              className="px-4 py-2.5 rounded-xl bg-[#1F71E8] hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Set
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Any name is accepted. Dzenje & Machokola are examples only.
          </p>
        </div>
      </div>

      {/* Active alerts banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-red-900">
              {activeAlerts.length} active flood alert{activeAlerts.length > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-red-700 mt-0.5">
              Check the Alerts tab for details and move to high ground if needed.
            </p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenSafetyCheckIn}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col items-center gap-2 hover:border-emerald-300 transition cursor-pointer active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">I am Safe</span>
          <span className="text-[10px] text-slate-500 text-center">Safety check-in</span>
        </button>

        <button
          type="button"
          onClick={onOpenVoiceSOS}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col items-center gap-2 hover:border-amber-300 transition cursor-pointer active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">Voice SOS</span>
          <span className="text-[10px] text-slate-500 text-center">Need help now</span>
        </button>
      </div>

      {/* Safe zone guidance — generic for any community */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Navigation className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Safe Zones for {activeVillage}</h3>
            <p className="text-[11px] text-slate-500">General guidance that works for any community</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {GENERIC_SAFE_ZONES.map((zone, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                {zone.icon === 'hill' && <Home className="w-4 h-4" />}
                {zone.icon === 'building' && <Building className="w-4 h-4" />}
                {zone.icon === 'people' && <Users className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900">{zone.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{zone.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            These are general recommendations. Follow instructions from local leaders and emergency services for your specific area.
          </p>
        </div>
      </div>

      {/* Recent community check-ins */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Recent Safety Check-ins
          </h3>
          <span className="text-[11px] font-bold text-slate-500">{villageReports.length}</span>
        </div>

        {villageReports.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No check-ins yet for this community</p>
            <p className="text-[11px] mt-1">Be the first to report you are safe</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {villageReports.slice(0, 12).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    r.status === 'safe'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'needs_help'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.status === 'safe' ? '✓' : r.status === 'needs_help' ? '!' : '~'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{r.userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {r.statusLabel || r.status} · {r.formattedTime || new Date(r.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency contacts placeholder */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-600" />
          Emergency Contacts
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Keep local village leaders and district emergency numbers saved on your phone. Use Voice SOS in this app if you need immediate help during a flood.
        </p>
      </div>
    </div>
  );
};
