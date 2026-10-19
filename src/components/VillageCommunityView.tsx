import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Check,
  Home,
  Mic,
  Building,
  CheckCircle2,
  Info,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
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

interface SafeZone {
  name: string;
  capacity: string;
}

interface VillageData {
  id: string;
  name: string;
  safeAreas: SafeZone[];
}

const VILLAGES_DATA: VillageData[] = [
  {
    id: 'dzenje',
    name: 'Dzenje Village',
    safeAreas: [
      {
        name: 'Dzenje CDSS Hall',
        capacity: 'About 300 people',
      },
    ],
  },
  {
    id: 'machokola',
    name: 'Machokola Village',
    safeAreas: [
      {
        name: 'Chikulumuzu Hill',
        capacity: '400+ people',
      },
      {
        name: 'Mayero Church',
        capacity: '250 people',
      },
    ],
  },
];

export const VillageCommunityView: React.FC<VillageCommunityViewProps> = ({
  currentUser,
  alerts = [],
  safetyReports = [],
  selectedVillage = 'Dzenje Village',
  onSelectVillage,
  onOpenDirectVoiceSOS,
  onOpenCheckInModal,
  onOpenReportFloodModal,
}) => {
  const { t } = useTranslation();
  const isAdmin = isAppAdmin(currentUser);
  const currentVillageName = selectedVillage || currentUser?.village || 'Dzenje Village';

  const activeVillageData =
    VILLAGES_DATA.find(
      (v) => v.name.toLowerCase() === currentVillageName.toLowerCase()
    ) || VILLAGES_DATA[0];

  const [activeTabSection, setActiveTabSection] = useState<'shelters' | 'villages' | 'guide'>('shelters');
  const [isInternalReportModalOpen, setIsInternalReportModalOpen] = useState(false);

  const handleTriggerReportFlood = () => {
    if (onOpenReportFloodModal) {
      onOpenReportFloodModal();
    } else {
      setIsInternalReportModalOpen(true);
    }
  };

  const allReports = safetyReports || [];
  const activeVillageReports = allReports.filter(
    (r) =>
      r.village.toLowerCase().includes(activeVillageData.name.toLowerCase()) ||
      activeVillageData.name.toLowerCase().includes(r.village.toLowerCase())
  );

  const realTotalReportsCount = activeVillageReports.length;
  const realSafeCount = activeVillageReports.filter(
    (r) => r.status === 'safe' || r.status === 'evacuated'
  ).length;
  const realHeadcountSum = activeVillageReports.reduce(
    (sum, r) => sum + (r.peopleCount || 1),
    0
  );

  const activeVillageAlert = alerts.find(
    (a) =>
      a.status === 'active' &&
      (!a.village ||
        a.village.toLowerCase().includes(activeVillageData.name.toLowerCase()) ||
        activeVillageData.name.toLowerCase().includes(a.village.toLowerCase()))
  );

  if (isAdmin) {
    const totalAllPeople = allReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);

    return (
      <div className="space-y-4 pb-20 select-none">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                {t.villageCommunityTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t.villageCommunityDesc}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Total People Checked In Across All Villages
            </span>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-slate-900 block">
                {totalAllPeople}
              </span>
              <span className="text-[10px] text-blue-700 font-bold uppercase">
                {totalAllPeople === 1 ? 'Resident' : 'Residents'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VILLAGES_DATA.map((v) => {
            const vReports = allReports.filter(
              (r) =>
                r.village.toLowerCase().includes(v.name.toLowerCase()) ||
                v.name.toLowerCase().includes(r.village.toLowerCase())
            );
            const vPeopleCount = vReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{v.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {vPeopleCount} {vPeopleCount === 1 ? 'person checked in' : 'people checked in'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{vPeopleCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <span className="text-xs font-bold text-slate-600 block">
                      {t.safeAreas} ({v.safeAreas.length})
                    </span>

                    {v.safeAreas.map((area, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-xs text-slate-800 truncate">{area.name === 'Dzenje CDSS Hall' ? t.dzenjeCdssHall : area.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          {area.capacity}
                        </span>
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 leading-tight truncate">
                    {activeVillageData.id === 'dzenje' ? t.villageDzenje : activeVillageData.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t.mulanjeRuoArea}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTabSection('villages')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0"
                title="Switch selected village"
              >
                {t.change}
              </button>
            </div>

            {activeVillageAlert ? (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  activeVillageAlert.severity === 'red'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {activeVillageAlert.severity === 'red' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div className="min-w-0 text-xs">
                  <span className="font-bold block">
                    {activeVillageAlert.severity === 'red'
                      ? 'CRITICAL FLOOD WARNING'
                      : 'HIGH FLOOD RISK'}
                  </span>
                  <span className="font-medium text-slate-700 truncate block">
                    River water rising. Safe high ground areas ready.
                  </span>
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
              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">{t.checkIns}</span>
                <span className="text-base font-bold text-slate-900">{realTotalReportsCount}</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">{t.safe}</span>
                <span className="text-base font-bold text-emerald-600">{realSafeCount}</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">{t.people}</span>
                <span className="text-base font-bold text-blue-600">{realHeadcountSum}</span>
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {onOpenCheckInModal && (
                  <button
                    type="button"
                    id="btn-village-mark-safe"
                    onClick={onOpenCheckInModal}
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t.markIAmSafe}</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-village-report-floods"
                  onClick={handleTriggerReportFlood}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]"
                >
                  <Droplets className="w-4 h-4 shrink-0" />
                  <span>{t.reportFloods}</span>
                </button>
              </div>

              {onOpenDirectVoiceSOS && (
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-red-950 block truncate">{t.emergencyRescueSos}</span>
                        <span className="text-[10px] text-red-700 font-medium block truncate">{t.instantVoiceGps}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0">
                      {t.liveGps}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="btn-village-voice-sos"
                    onClick={onOpenDirectVoiceSOS}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[40px]"
                    title="Send Emergency Voice SOS"
                  >
                    <Mic className="w-4 h-4 shrink-0" />
                    <span>{t.recordSendVoiceSos}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              id="tab-shelters"
              onClick={() => setActiveTabSection('shelters')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTabSection === 'shelters'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.safeAreas} ({activeVillageData.safeAreas.length})</span>
            </button>

            <button
              type="button"
              id="tab-villages"
              onClick={() => setActiveTabSection('villages')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTabSection === 'villages'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.switchVillage}</span>
            </button>

            <button
              type="button"
              id="tab-guide"
              onClick={() => setActiveTabSection('guide')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTabSection === 'guide'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.safetyGuide}</span>
            </button>
          </div>

          {activeTabSection === 'shelters' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t.safeHighGroundEvacuationAreas}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t.designatedSheltersForResidents}
                  </p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {t.highGround}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeVillageData.safeAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-slate-900 leading-tight">
                          {area.name === 'Dzenje CDSS Hall' ? t.dzenjeCdssHall : area.name}
                        </h5>
                        <span className="text-xs text-emerald-700 font-medium block mt-0.5">
                          {t.highGroundEvacuationShelter}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium">{t.capacity}</span>
                      <span className="font-bold text-slate-900">{area.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTabSection === 'villages' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {t.selectVillage}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tap to view flood status and shelters for another village
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {VILLAGES_DATA.map((v) => {
                  const isSelected = activeVillageData.name.toLowerCase() === v.name.toLowerCase();
                  const vReports = allReports.filter(
                    (r) =>
                      r.village.toLowerCase().includes(v.name.toLowerCase()) ||
                      v.name.toLowerCase().includes(r.village.toLowerCase())
                  );
                  const vPeopleCount = vReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onSelectVillage?.(v.name);
                        setActiveTabSection('shelters');
                      }}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-600 ring-1 ring-blue-500'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="font-bold text-sm text-slate-900">
                            {v.id === 'dzenje' ? t.villageDzenje : v.name}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 font-medium">
                        {vPeopleCount} {t.people}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTabSection === 'guide' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
                {t.safetyGuide}
              </h4>
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900">{t.evacStep1Title}</p>
                  <p className="text-xs text-slate-600 mt-1">{t.evacStep1Desc}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-bold text-amber-900">{t.evacStep2Title}</p>
                  <p className="text-xs text-slate-600 mt-1">{t.evacStep2Desc}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-xs font-bold text-blue-900">{t.evacStep3Title}</p>
                  <p className="text-xs text-slate-600 mt-1">{t.evacStep3Desc}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isInternalReportModalOpen && (
        <VillageReportFloodModal
          isOpen={isInternalReportModalOpen}
          onClose={() => setIsInternalReportModalOpen(false)}
          currentUser={currentUser}
          selectedVillage={activeVillageData.name}
        />
      )}
    </div>
  );
};
