import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Home,
  Mic,
  Building,
  CheckCircle2,
  Info,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Plus,
  Trash2,
  X,
  Save,
  RotateCcw,
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

export interface SafeZone {
  name: string;
  capacity: string;
}

export interface VillageData {
  id: string;
  name: string;
  safeAreas: SafeZone[];
}

export const DEFAULT_VILLAGES_DATA: VillageData[] = [
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

const STORAGE_KEY = 'flood_alert_villages_shelters';

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
  const { t, isChichewa } = useTranslation();
  const isAdmin = isAppAdmin(currentUser);

  // Dynamic villages & shelters state
  const [villagesData, setVillagesData] = useState<VillageData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read villagesData from localStorage', e);
    }
    return DEFAULT_VILLAGES_DATA;
  });

  // Local selected village state to guarantee immediate switching
  const [localSelectedVillage, setLocalSelectedVillage] = useState<string>(selectedVillage || 'Dzenje Village');

  useEffect(() => {
    if (selectedVillage && selectedVillage !== localSelectedVillage) {
      setLocalSelectedVillage(selectedVillage);
    }
  }, [selectedVillage]);

  // Find active village data
  const activeVillageData =
    villagesData.find(
      (v) => v.name.toLowerCase() === localSelectedVillage.toLowerCase()
    ) || villagesData[0] || DEFAULT_VILLAGES_DATA[0];

  const [activeTabSection, setActiveTabSection] = useState<'shelters' | 'villages' | 'guide'>('shelters');
  const [isInternalReportModalOpen, setIsInternalReportModalOpen] = useState(false);

  // Admin Shelter Editor Modal State
  const [isEditingShelters, setIsEditingShelters] = useState(false);
  const [editingVillageId, setEditingVillageId] = useState<string | null>(null);
  const [editableVillages, setEditableVillages] = useState<VillageData[]>([]);

  const handleOpenEditModal = (targetVillageId?: string) => {
    setEditableVillages(JSON.parse(JSON.stringify(villagesData)));
    setEditingVillageId(targetVillageId || villagesData[0]?.id || 'dzenje');
    setIsEditingShelters(true);
  };

  const handleSaveVillages = () => {
    setVillagesData(editableVillages);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editableVillages));
    } catch (e) {
      console.warn('Failed to save villagesData to localStorage', e);
    }
    setIsEditingShelters(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all village shelters and capacities to default?')) {
      setVillagesData(DEFAULT_VILLAGES_DATA);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear villagesData', e);
      }
      setIsEditingShelters(false);
    }
  };

  const handleTriggerReportFlood = () => {
    if (onOpenReportFloodModal) {
      onOpenReportFloodModal();
    } else {
      setIsInternalReportModalOpen(true);
    }
  };

  const handleVillageSelect = (villageName: string) => {
    setLocalSelectedVillage(villageName);
    onSelectVillage?.(villageName);
    setActiveTabSection('shelters');
  };

  // Real-time Firestore dynamic stats calculation
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

  // Check if there is an active flood warning for this village
  const activeVillageAlert = alerts.find(
    (a) =>
      a.status === 'active' &&
      (!a.village ||
        a.village.toLowerCase().includes(activeVillageData.name.toLowerCase()) ||
        activeVillageData.name.toLowerCase().includes(a.village.toLowerCase()))
  );

  // ================= ADMIN VIEW =================
  if (isAdmin) {
    const totalAllPeople = allReports.reduce((sum, r) => sum + (r.peopleCount || 1), 0);

    return (
      <div className="space-y-4 pb-20 select-none">
        {/* Admin Header: Village Evacuation Centers & Safety Management */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F71E8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Building className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                  Village Evacuation Centers & Safe Places
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage emergency shelters, safe capacities, and resident check-ins across villages.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEditModal()}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-50 text-[#1F71E8] hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Edit village shelters and capacity"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Shelters</span>
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Total People Checked In Across All Villages
            </span>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-slate-900 block">
                {totalAllPeople}
              </span>
              <span className="text-[10px] text-[#1F71E8] font-bold uppercase">
                {totalAllPeople === 1 ? 'Resident' : 'Residents'}
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Grid of Villages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {villagesData.map((v) => {
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
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1F71E8] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{v.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {vPeopleCount} {vPeopleCount === 1 ? 'person checked in' : 'people checked in'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(v.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1F71E8] hover:bg-blue-50 transition cursor-pointer"
                        title="Edit village shelters and capacity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
                        <Users className="w-3.5 h-3.5 text-[#1F71E8]" />
                        <span>{vPeopleCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 block">
                        Safe Areas ({v.safeAreas.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(v.id)}
                        className="text-[11px] font-bold text-[#1F71E8] hover:underline cursor-pointer"
                      >
                        + Add Shelter
                      </button>
                    </div>

                    {v.safeAreas.map((area, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-xs text-slate-800 truncate">{area.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
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

        {/* ADMIN SHELTER & CAPACITY EDIT MODAL */}
        {isEditingShelters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-5 border border-slate-200 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1F71E8] flex items-center justify-center shrink-0">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Edit Villages & Shelters</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Update evacuation centers, safe areas, and capacities
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingShelters(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Village selector pill tabs in modal */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {editableVillages.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setEditingVillageId(v.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                      editingVillageId === v.id
                        ? 'bg-[#1F71E8] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>

              {/* Editing Selected Village */}
              {editableVillages
                .filter((v) => v.id === editingVillageId)
                .map((currentV) => (
                  <div key={currentV.id} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Village Name
                      </label>
                      <input
                        type="text"
                        value={currentV.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableVillages((prev) =>
                            prev.map((v) =>
                              v.id === currentV.id ? { ...v, name: val } : v
                            )
                          );
                        }}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#1F71E8] focus:ring-1 focus:ring-blue-100"
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Safe Evacuation Shelters & Capacity
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditableVillages((prev) =>
                              prev.map((v) =>
                                v.id === currentV.id
                                  ? {
                                      ...v,
                                      safeAreas: [
                                        ...v.safeAreas,
                                        { name: 'New Safe Shelter', capacity: 'About 200 people' },
                                      ],
                                    }
                                  : v
                              )
                            );
                          }}
                          className="text-xs font-bold text-[#1F71E8] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Shelter</span>
                        </button>
                      </div>

                      {currentV.safeAreas.map((area, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">
                              Shelter #{sIdx + 1}
                            </span>
                            {currentV.safeAreas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditableVillages((prev) =>
                                    prev.map((v) =>
                                      v.id === currentV.id
                                        ? {
                                            ...v,
                                            safeAreas: v.safeAreas.filter((_, i) => i !== sIdx),
                                          }
                                        : v
                                    )
                                  );
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded-md transition cursor-pointer"
                                title="Delete shelter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] text-slate-500 font-bold mb-1">
                                Shelter Name / Location
                              </span>
                              <input
                                type="text"
                                value={area.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditableVillages((prev) =>
                                    prev.map((v) =>
                                      v.id === currentV.id
                                        ? {
                                            ...v,
                                            safeAreas: v.safeAreas.map((sa, i) =>
                                              i === sIdx ? { ...sa, name: val } : sa
                                            ),
                                          }
                                        : v
                                    )
                                  );
                                }}
                                placeholder="e.g. Dzenje CDSS Hall"
                                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#1F71E8]"
                              />
                            </div>

                            <div>
                              <span className="block text-[10px] text-slate-500 font-bold mb-1">
                                Capacity (people)
                              </span>
                              <input
                                type="text"
                                value={area.capacity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditableVillages((prev) =>
                                    prev.map((v) =>
                                      v.id === currentV.id
                                        ? {
                                            ...v,
                                            safeAreas: v.safeAreas.map((sa, i) =>
                                              i === sIdx ? { ...sa, capacity: val } : sa
                                            ),
                                          }
                                        : v
                                    )
                                  );
                                }}
                                placeholder="e.g. About 300 people"
                                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#1F71E8]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Bottom modal actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 transition cursor-pointer"
                  title="Reset to initial data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingShelters(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVillages}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1F71E8] hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VILLAGER / RESIDENT DASHBOARD =================
  return (
    <div className="space-y-4 pb-20 select-none">
      {/* 0. Native System Enablement Prompts */}
      <NotificationEnableCard isDarkMode={false} />
      <BatteryOptimizationCard />

      {/* Responsive layout: 2-column on desktop/tablets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Village Safety Hub & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* ================= 1. PRIMARY VILLAGE DASHBOARD CARD ================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            {/* Top Row: Selected Village & Quick Switch */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1F71E8] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-slate-900 leading-tight truncate">
                    {activeVillageData.name === 'Dzenje Village'
                      ? (isChichewa ? t.villageDzenjeName : 'Dzenje Village')
                      : activeVillageData.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isChichewa ? t.mulanjeDistrictRuoArea : 'Mulanje District • Ruo River Area'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-switch-village-top"
                onClick={() => {
                  setActiveTabSection('villages');
                  setTimeout(() => {
                    const el = document.getElementById('tab-villages');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }, 50);
                }}
                className="text-xs font-semibold text-[#1F71E8] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0"
                title="Switch selected village"
              >
                {t.change}
              </button>
            </div>

            {/* Safety Status Banner */}
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
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-slate-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0 text-xs">
                  <span className="font-bold text-emerald-700 block">{t.normalMonitoringNoFloods}</span>
                  <span className="font-medium text-slate-600">{t.riverSensorsWatchingContinuously}</span>
                </div>
              </div>
            )}

            {/* Statistics Bar: Check-Ins / Safe / People */}
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
                <span className="text-base font-bold text-[#1F71E8]">{realHeadcountSum}</span>
              </div>
            </div>

            {/* Primary Safety Actions: Prioritize "Mark I Am Safe", "Report Floods", and "Voice SOS" */}
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
                  className="py-3 px-3 rounded-xl bg-[#1F71E8] hover:bg-blue-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]"
                >
                  <Droplets className="w-4 h-4 shrink-0" />
                  <span>{t.reportFloods}</span>
                </button>
              </div>

              {/* Emergency Voice SOS Rescue Card */}
              {onOpenDirectVoiceSOS && (
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-red-950 block truncate">{t.emergencyRescueSos}</span>
                        <span className="text-[10px] text-red-700 font-medium block truncate">{t.instantVoiceGpsDispatch}</span>
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

        {/* Right Column: Safe Areas, Village Selection, & Safety Guide */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Segmented Control Tabs */}
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
              <span>Safe Places ({activeVillageData.safeAreas.length})</span>
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
              <MapPin className="w-3.5 h-3.5 text-[#1F71E8]" />
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

          {/* TAB 1: SAFE HIGH GROUND SHELTERS - IMPROVED CARD IN SIMPLE ENGLISH */}
          {activeTabSection === 'shelters' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
              <div className="flex items-start justify-between pb-2 border-b border-slate-100 gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Village Evacuation Centers & Safe Places
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Designated high ground and safe shelters for families during river floods.
                  </p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  {t.highGround}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeVillageData.safeAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-slate-900 leading-tight">
                          {area.name === 'Dzenje CDSS Hall' && isChichewa ? t.dzenjeCdssHallName : area.name}
                        </h5>
                        <span className="text-xs text-emerald-700 font-medium block mt-0.5">
                          Safe Evacuation Center
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium">Capacity</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {isChichewa
                          ? area.capacity.replace('About', t.aboutPeople).replace('people', '')
                          : area.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SWITCH VILLAGE */}
          {activeTabSection === 'villages' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select Your Village
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tap to view flood status and shelters for another village
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {villagesData.map((v) => {
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
                      onClick={() => handleVillageSelect(v.name)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/60 border-[#1F71E8] ring-1 ring-[#1F71E8]'
                          : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#1F71E8]' : 'text-slate-400'}`} />
                          <span className="font-bold text-sm text-slate-900">{v.name}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F71E8] text-white">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 w-full">
                        <span>{v.safeAreas.length} Safe Area{v.safeAreas.length > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-slate-700">{vPeopleCount} checked in</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY GUIDE */}
          {activeTabSection === 'guide' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    What To Do In A Flood Warning
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Clear safety steps for families in the village
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#1F71E8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Move to High Ground Now</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Do not wait for water to reach your home. Walk to designated high ground right away.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#1F71E8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Never Cross Fast River Water</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Moving flood water can sweep away people and animals. Stay on dry land.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#1F71E8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Keep Your Phone Charged</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Keep your battery high and ensure sound is turned on to hear emergency sirens and SMS.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#1F71E8] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Check In With Your Family</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Tap 'I Am Safe' once you reach high ground so community rescue teams know you are safe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Internal Report Flood Modal Fallback */}
      {isInternalReportModalOpen && (
        <VillageReportFloodModal
          currentUser={currentUser}
          isOpen={isInternalReportModalOpen}
          onClose={() => setIsInternalReportModalOpen(false)}
        />
      )}
    </div>
  );
};
