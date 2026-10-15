import React, { useState } from 'react';
import {
  MapPin, Users, Home, Mic, Building, CheckCircle2, Info, Droplets,
  AlertTriangle, ShieldCheck, ShieldAlert,
} from 'lucide-react';
import { UserProfile, FloodAlert, ResidentSafetyReport, isAppAdmin } from '../types';
import { NotificationEnableCard } from './NotificationEnableCard';
import { BatteryOptimizationCard } from './BatteryOptimizationCard';
import { VillageReportFloodModal } from './VillageReportFloodModal';
import { useTranslation } from '../services/i18n';

interface VillageCommunityViewProps {
  currentUser: UserProfile | null;
  alerts: FloodAlert[];
  safetyReports?: ResidentSafetyReport[];
  isDarkMode?: boolean;
  selectedVillage?: string;
  onSelectVillage?: (village: string) => void;
  onOpenAuthModal?: () => void;
  onOpenDirectVoiceSOS?: () => void;
  onOpenCheckInModal?: () => void;
  onOpenReportFloodModal?: () => void;
  onOpenAboutModal?: () => void;
}

interface SafeZone { name: string; capacity: string; }
interface VillageData { id: string; name: string; safeAreas: SafeZone[]; }

/** Known communities with mapped safe zones — any other name still works with generic guidance */
const VILLAGES_DATA: VillageData[] = [
  { id: 'dzenje', name: 'Dzenje Village', safeAreas: [{ name: 'Dzenje CDSS Hall', capacity: 'About 300 people' }] },
  { id: 'machokola', name: 'Machokola Village', safeAreas: [
    { name: 'Chikulumuzu Hill', capacity: '400+ people' },
    { name: 'Mayero Church', capacity: '250 people' },
  ]},
];

function resolveVillageData(name: string): VillageData {
  const found = VILLAGES_DATA.find(v => v.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  const clean = name.trim() || 'Your Community';
  return {
    id: 'custom-' + clean.toLowerCase().replace(/\s+/g, '-'),
    name: clean,
    safeAreas: [
      { name: 'Nearest high ground / school', capacity: 'Follow local guidance' },
      { name: 'Village meeting place', capacity: 'Ask chiefs / disaster committee' },
    ],
  };
}

export const VillageCommunityView: React.FC<VillageCommunityViewProps> = ({
  currentUser, alerts = [], safetyReports = [], selectedVillage = '',
  onSelectVillage, onOpenDirectVoiceSOS, onOpenCheckInModal, onOpenReportFloodModal, onOpenAboutModal,
}) => {
  const { t } = useTranslation();
  const isAdmin = isAppAdmin(currentUser);
  const currentVillageName = selectedVillage || currentUser?.village || 'Your Community';
  const activeVillageData = resolveVillageData(currentVillageName);
  const [activeTabSection, setActiveTabSection] = useState<'shelters' | 'villages' | 'guide'>('shelters');
  const [isInternalReportModalOpen, setIsInternalReportModalOpen] = useState(false);

  const handleTriggerReportFlood = () => {
    if (onOpenReportFloodModal) onOpenReportFloodModal();
    else setIsInternalReportModalOpen(true);
  };

  const allReports = safetyReports || [];
  const activeVillageReports = allReports.filter(r =>
    r.village.toLowerCase().includes(activeVillageData.name.toLowerCase()) ||
    activeVillageData.name.toLowerCase().includes(r.village.toLowerCase())
  );
  const realTotalReportsCount = activeVillageReports.length;
  const realSafeCount = activeVillageReports.filter(r => r.status === 'safe' || r.status === 'evacuated').length;
  const realHeadcountSum = activeVillageReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);
  const activeVillageAlert = alerts.find(a =>
    a.status === 'active' && (!a.village ||
      a.village.toLowerCase().includes(activeVillageData.name.toLowerCase()) ||
      activeVillageData.name.toLowerCase().includes(a.village.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-24 select-none">
      <NotificationEnableCard />
      <BatteryOptimizationCard />

      <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">{t.villageCommunityTitle}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t.villageCommunityDesc}</p>
          </div>
          {onOpenAboutModal && (
            <button type="button" onClick={onOpenAboutModal} className="shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer" title="About & Privacy">
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {VILLAGES_DATA.map((v) => {
            const count = allReports.filter(r =>
              r.village.toLowerCase().includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(r.village.toLowerCase())
            ).length;
            const isActive = activeVillageData.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVillage?.(v.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
                  isActive ? 'bg-[#1F71E8] text-white border-[#1F71E8]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                {v.name.replace(' Village', '')}{count > 0 ? ` · ${count}` : ''}
              </button>
            );
          })}
          {activeVillageData.id.startsWith('custom-') && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {activeVillageData.name}
            </span>
          )}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1F71E8] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 leading-tight truncate">{activeVillageData.name}</h3>
                <p className="text-[11px] text-slate-500">{t.mulanjeRuoArea}</p>
              </div>
            </div>
            <button type="button" onClick={() => setActiveTabSection('villages')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0">{t.changeVillage}</button>
          </div>

          {activeVillageAlert ? (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${activeVillageAlert.severity === 'red' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              {activeVillageAlert.severity === 'red' ? <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              <div className="min-w-0">
                <span className="font-bold block">{activeVillageAlert.severity === 'red' ? t.criticalFloodWarningShort : t.highFloodRiskShort}</span>
                <span className="text-xs opacity-90">{t.riverRisingSafeGroundReady}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">{t.normalMonitoringNoFloods}</span>
                <span className="text-xs opacity-90">{t.riverSensorsWatching}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold block">{t.checkInsLabel}</span>
              <span className="text-lg font-bold text-slate-900">{realTotalReportsCount}</span>
            </div>
            <div className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold block">{t.safeLabel}</span>
              <span className="text-lg font-bold text-emerald-700">{realSafeCount}</span>
            </div>
            <div className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold block">{t.peopleLabel}</span>
              <span className="text-lg font-bold text-slate-900">{realHeadcountSum}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" id="btn-village-mark-safe" onClick={onOpenCheckInModal} className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]">
              <CheckCircle2 className="w-4 h-4" /> {t.markIAmSafe}
            </button>
            <button type="button" id="btn-village-report-floods" onClick={handleTriggerReportFlood} className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]">
              <Droplets className="w-4 h-4" /> {t.reportFloods}
            </button>
          </div>
          <button type="button" id="btn-village-voice-sos" onClick={onOpenDirectVoiceSOS} className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[44px]">
            <Mic className="w-4 h-4" /> {t.emergencyVoiceSosRescue}
          </button>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
          <button type="button" id="tab-shelters" onClick={() => setActiveTabSection('shelters')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'shelters' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Home className="w-3.5 h-3.5" /> {t.safeAreasLabel}
          </button>
          <button type="button" id="tab-villages" onClick={() => setActiveTabSection('villages')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'villages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Building className="w-3.5 h-3.5" /> {t.switchVillage}
          </button>
          <button type="button" id="tab-guide" onClick={() => setActiveTabSection('guide')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'guide' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Info className="w-3.5 h-3.5" /> {t.safetyGuide}
          </button>
        </div>

        {activeTabSection === 'shelters' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">{t.safeHighGroundEvacAreas}</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t.designatedSheltersFor} {activeVillageData.name}</p>
            </div>
            <div className="space-y-2">
              {activeVillageData.safeAreas.map((area, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-slate-900 block">{area.name}</span>
                    <span className="text-[11px] text-slate-500">{t.capacityLabel}: {area.capacity}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">{t.highGroundBadge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTabSection === 'villages' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Examples on the network — your own community name is set in Profile / Sign in.</p>
            <div className="space-y-2">
              {VILLAGES_DATA.map((v) => (
                <button key={v.id} type="button" onClick={() => onSelectVillage?.(v.name)} className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${activeVillageData.id === v.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <span className="font-bold text-sm text-slate-900">{v.name}</span>
                  <span className="text-[11px] text-slate-500 block">{v.safeAreas.length} safe area(s)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTabSection === 'guide' && (
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">{t.whatToDoFloodWarning}</h4>
            <p className="text-xs text-slate-500">{t.clearSafetySteps}</p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> {t.moveToHighGroundNow}</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> {t.neverCrossFastWater}</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> {t.assistNeighborsChildren}</li>
              <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> {t.sendVoiceSosIfTrapped}</li>
            </ul>
            {onOpenAboutModal && (
              <button type="button" onClick={onOpenAboutModal} className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                About, Privacy & Legal
              </button>
            )}
          </div>
        )}
      </div>

      <VillageReportFloodModal isOpen={isInternalReportModalOpen} onClose={() => setIsInternalReportModalOpen(false)} villageName={activeVillageData.name} />
    </div>
  );
};
