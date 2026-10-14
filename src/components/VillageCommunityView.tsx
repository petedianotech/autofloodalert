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

const VILLAGES_DATA: VillageData[] = [
  { id: 'dzenje', name: 'Dzenje Village', safeAreas: [{ name: 'Dzenje CDSS Hall', capacity: 'About 300 people' }] },
  { id: 'machokola', name: 'Machokola Village', safeAreas: [
    { name: 'Chikulumuzu Hill', capacity: '400+ people' },
    { name: 'Mayero Church', capacity: '250 people' },
  ]},
];

export const VillageCommunityView: React.FC<VillageCommunityViewProps> = ({
  currentUser, alerts = [], safetyReports = [], selectedVillage = 'Dzenje Village',
  onSelectVillage, onOpenDirectVoiceSOS, onOpenCheckInModal, onOpenReportFloodModal,
}) => {
  const { t } = useTranslation();
  const isAdmin = isAppAdmin(currentUser);
  const currentVillageName = selectedVillage || currentUser?.village || 'Dzenje Village';
  const activeVillageData = VILLAGES_DATA.find(v => v.name.toLowerCase() === currentVillageName.toLowerCase()) || VILLAGES_DATA[0];
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

  if (isAdmin) {
    const totalAllPeople = allReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);
    return (
      <div className="space-y-4 pb-20 select-none">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0"><Building className="w-5 h-5" /></div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">{t.villageCommunityTitle}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t.villageCommunityDesc}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-700">{t.totalPeopleCheckedIn}</span>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-slate-900 block">{totalAllPeople}</span>
              <span className="text-[10px] text-blue-700 font-bold uppercase">{totalAllPeople === 1 ? t.resident : t.residents}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VILLAGES_DATA.map((v) => {
            const vReports = allReports.filter(r =>
              r.village.toLowerCase().includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(r.village.toLowerCase())
            );
            const vPeopleCount = vReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);
            return (
              <div key={v.id} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{v.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{vPeopleCount} {vPeopleCount === 1 ? t.personCheckedIn : t.peopleCheckedIn}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                      <Users className="w-3.5 h-3.5 text-blue-600" /><span>{vPeopleCount}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3">
                    <span className="text-xs font-bold text-slate-600 block">{t.safeAreasLabel} ({v.safeAreas.length})</span>
                    {v.safeAreas.map((area, aIdx) => (
                      <div key={aIdx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-xs text-slate-800 truncate">{area.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">{area.capacity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 select-none">
      <NotificationEnableCard isDarkMode={false} />
      <BatteryOptimizationCard />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 leading-tight truncate">{activeVillageData.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{t.mulanjeRuoArea}</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveTabSection('villages')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0">{t.changeVillage}</button>
            </div>
            {activeVillageAlert ? (
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${activeVillageAlert.severity === 'red' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                {activeVillageAlert.severity === 'red' ? <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                <div className="min-w-0 text-xs">
                  <span className="font-bold block">{activeVillageAlert.severity === 'red' ? t.criticalFloodWarningShort : t.highFloodRiskShort}</span>
                  <span className="font-medium text-slate-700 truncate block">{t.riverRisingSafeGroundReady}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="font-bold text-emerald-900 block">{t.normalMonitoringNoFloods}</span>
                  <span className="font-medium text-slate-600">{t.riverSensorsWatching}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100"><span className="text-[11px] text-slate-500 font-medium block">{t.checkInsLabel}</span><span className="text-base font-bold text-slate-900">{realTotalReportsCount}</span></div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100"><span className="text-[11px] text-slate-500 font-medium block">{t.safeLabel}</span><span className="text-base font-bold text-emerald-600">{realSafeCount}</span></div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100"><span className="text-[11px] text-slate-500 font-medium block">{t.peopleLabel}</span><span className="text-base font-bold text-blue-600">{realHeadcountSum}</span></div>
            </div>
            <div className="pt-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {onOpenCheckInModal && (
                  <button type="button" id="btn-village-mark-safe" onClick={onOpenCheckInModal} className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{t.markIAmSafe}</span>
                  </button>
                )}
                <button type="button" id="btn-village-report-floods" onClick={handleTriggerReportFlood} className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]">
                  <Droplets className="w-4 h-4 shrink-0" /><span>{t.reportFloods}</span>
                </button>
              </div>
              {onOpenDirectVoiceSOS && (
                <button type="button" id="btn-village-voice-sos" onClick={onOpenDirectVoiceSOS} className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[44px]">
                  <Mic className="w-4 h-4 shrink-0" /><span>{t.emergencyVoiceSosRescue}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button type="button" id="tab-shelters" onClick={() => setActiveTabSection('shelters')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'shelters' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
              <Home className="w-3.5 h-3.5 text-emerald-600" /><span>{t.safeAreasLabel} ({activeVillageData.safeAreas.length})</span>
            </button>
            <button type="button" id="tab-villages" onClick={() => setActiveTabSection('villages')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'villages' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
              <MapPin className="w-3.5 h-3.5 text-blue-600" /><span>{t.switchVillage}</span>
            </button>
            <button type="button" id="tab-guide" onClick={() => setActiveTabSection('guide')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTabSection === 'guide' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
              <Info className="w-3.5 h-3.5 text-amber-600" /><span>{t.safetyGuide}</span>
            </button>
          </div>
          {activeTabSection === 'shelters' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.safeHighGroundEvacAreas}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{t.designatedSheltersFor} {activeVillageData.name}</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">{t.highGroundBadge}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeVillageData.safeAreas.map((area, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0"><Home className="w-4 h-4" /></div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-slate-900 leading-tight">{area.name}</h5>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t.highGroundEvacShelter}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-slate-600">{t.capacityLabel}:</span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{area.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTabSection === 'villages' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.selectYourVillage}</h4>
              <div className="space-y-2">
                {VILLAGES_DATA.map((v) => (
                  <button key={v.id} type="button" onClick={() => onSelectVillage?.(v.name)} className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${activeVillageData.id === v.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <span className="font-bold text-sm text-slate-900">{v.name}</span>
                    <span className="text-xs text-slate-500 block mt-0.5">{v.safeAreas.length} {t.safeAreasLabel.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTabSection === 'guide' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t.whatToDoFloodWarning}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.clearSafetySteps}</p>
              </div>
              <div className="space-y-2.5 pt-1">
                {[t.moveToHighGroundNow, t.neverCrossFastWater, t.assistNeighborsChildren, t.sendVoiceSosIfTrapped].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isInternalReportModalOpen && (
        <VillageReportFloodModal isOpen={isInternalReportModalOpen} onClose={() => setIsInternalReportModalOpen(false)} villageName={activeVillageData.name} />
      )}
    </div>
  );
};
