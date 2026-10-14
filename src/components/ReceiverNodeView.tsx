import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Bell,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  MapPin,
  Clock,
  MessageSquare,
  BellRing,
  Music,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
} from 'lucide-react';
import { FloodAlert, UserProfile, isAppAdmin } from '../types';
import { sirenService } from '../services/audioSiren';
import { NotificationEnableCard } from './NotificationEnableCard';
import { BatteryOptimizationCard } from './BatteryOptimizationCard';
import { useTranslation } from '../services/i18n';

interface ReceiverNodeViewProps {
  alerts: FloodAlert[];
  notificationPermission?: NotificationPermission;
  onRequestNotificationPermission?: () => void;
  onDismissAlert: (id: string) => void;
  onDeleteAlert?: (id: string) => void;
  onClearAlerts: () => void;
  isFirebaseConnected?: boolean;
  onOpenFirebaseModal?: () => void;
  isDarkMode?: boolean;
  isOnline?: boolean;
  currentUser?: UserProfile | null;
  isAdmin?: boolean;
  onOpenVoiceSOS?: () => void;
  onTriggerSiren?: () => void;
  onOpenFcmModal?: () => void;
  onOpenSoundModal?: () => void;
  onOpenSmsModal?: () => void;
}

export const ReceiverNodeView: React.FC<ReceiverNodeViewProps> = ({
  alerts = [],
  onDismissAlert,
  onDeleteAlert,
  onClearAlerts,
  currentUser,
  isAdmin: isAdminProp,
  onOpenVoiceSOS,
  onOpenFcmModal,
  onOpenSoundModal,
  onOpenSmsModal,
}) => {
  const { t } = useTranslation();
  const isAdmin = isAdminProp ?? isAppAdmin(currentUser);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(new Set());

  const toggleEmergencySiren = () => {
    if (isSirenActive) {
      sirenService.stopAllAlarms();
      setIsSirenActive(false);
    } else {
      sirenService.startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  const handleItemDelete = (alertId: string) => {
    if (onDeleteAlert) {
      onDeleteAlert(alertId);
    } else {
      onDismissAlert(alertId);
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const getResidentFriendlyAlert = (alert: FloodAlert) => {
    const isRed = alert.severity === 'red';
    const isYellow = alert.severity === 'yellow';
    const isResolved = alert.status === 'dismissed' || alert.status === 'resolved';
    const isUpdated = Boolean(
      alert.notes?.toLowerCase().includes('update') ||
        alert.notes?.toLowerCase().includes('acknowledged')
    );

    let displayTitle = alert.title || '';
    let displayMessage = alert.message || '';

    const titleLower = (alert.title || '').toLowerCase();
    if (
      titleLower.includes('clear') ||
      titleLower.includes('safe') ||
      titleLower.includes('resolved') ||
      titleLower.includes('monitoring')
    ) {
      displayTitle = t.alertTitleRiverClear;
    } else if (isRed) {
      displayTitle = t.alertTitleCriticalMove;
    } else if (isYellow) {
      displayTitle = t.alertTitleHighRisk;
    } else {
      displayTitle = t.alertTitleMonitoring;
    }

    const msgLower = (alert.message || '').toLowerCase();
    if (
      msgLower.includes('clear') ||
      msgLower.includes('normal') ||
      msgLower.includes('no action') ||
      isResolved
    ) {
      displayMessage = t.alertMsgRiverClear;
    } else if (isRed) {
      displayMessage = t.alertMsgCriticalMove;
    } else if (isYellow) {
      displayMessage = t.alertMsgHighRisk;
    } else {
      displayMessage = t.alertMsgMonitoring;
    }

    let stateLabel = t.stateActiveWarning;
    if (isResolved) {
      stateLabel = t.stateResolved;
    } else if (isUpdated) {
      stateLabel = t.stateUpdated;
    } else if (isRed) {
      stateLabel = t.stateCriticalWarning;
    } else if (isYellow) {
      stateLabel = t.stateHighFloodRisk;
    } else {
      stateLabel = t.stateMonitoring;
    }

    return { displayTitle, displayMessage, stateLabel, isRed, isYellow, isResolved };
  };

  const filteredAlerts = useMemo(() => {
    if (statusFilter === 'active') {
      return alerts.filter((a) => a.status === 'active');
    }
    if (statusFilter === 'resolved') {
      return alerts.filter((a) => a.status === 'dismissed' || a.status === 'resolved');
    }
    return alerts;
  }, [alerts, statusFilter]);

  type AlertGroup = {
    id: string;
    locationLabel: string;
    riverName: string;
    village: string;
    highestSeverity: 'red' | 'yellow' | 'green';
    hasActive: boolean;
    latestAlert: FloodAlert;
    allAlerts: FloodAlert[];
  };

  const groupedAlerts = useMemo(() => {
    const groups = new Map<string, AlertGroup>();
    for (const alert of filteredAlerts) {
      const locKey = `${alert.riverName || 'Ruo River'}-${alert.village || 'Dzenje'}`.toLowerCase();
      if (!groups.has(locKey)) {
        groups.set(locKey, {
          id: locKey,
          locationLabel:
            alert.locationLabel ||
            `${alert.riverName || 'Ruo River'}, ${alert.village || 'Dzenje'}`,
          riverName: alert.riverName || 'Ruo River',
          village: alert.village || 'Dzenje',
          hasActive: alert.status === 'active',
          highestSeverity:
            alert.severity === 'red' ? 'red' : alert.severity === 'yellow' ? 'yellow' : 'green',
          latestAlert: alert,
          allAlerts: [alert],
        });
      } else {
        const group = groups.get(locKey)!;
        group.allAlerts.push(alert);
        if (alert.status === 'active') {
          group.hasActive = true;
        }
        if (alert.severity === 'red') {
          group.highestSeverity = 'red';
        } else if (alert.severity === 'yellow' && group.highestSeverity !== 'red') {
          group.highestSeverity = 'yellow';
        }
        if (alert.timestamp > group.latestAlert.timestamp) {
          group.latestAlert = alert;
        }
      }
    }
    return Array.from(groups.values()).sort(
      (a, b) => b.latestAlert.timestamp - a.latestAlert.timestamp
    );
  }, [filteredAlerts]);

  const activeCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-4 pb-20 select-none">
      <NotificationEnableCard isDarkMode={false} />
      <BatteryOptimizationCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Left column: Siren + quick actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 leading-tight">{t.villageSirenBroadcast}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.manuallySoundSilenceSirens}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-sound-emergency-siren"
                onClick={toggleEmergencySiren}
                className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px] active:scale-98 ${
                  isSirenActive
                    ? 'bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSirenActive ? (
                  <>
                    <VolumeX className="w-4 h-4 shrink-0" />
                    <span>{t.stopEmergencySiren}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span>{t.soundEmergencySiren}</span>
                  </>
                )}
              </button>

              {onOpenVoiceSOS && (
                <button
                  type="button"
                  id="btn-alerts-voice-sos"
                  onClick={onOpenVoiceSOS}
                  className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px] active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>{t.sendEmergencyVoiceSos}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenSoundModal?.()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px]"
                title="Change Alert Sound"
              >
                <Music className="w-4 h-4 text-blue-600" />
                <span className="text-center leading-tight">{t.soundLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenFcmModal?.()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px]"
                title="Push Alerts Settings"
              >
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-center leading-tight">{t.pushLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenSmsModal?.()}
                className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex flex-col items-center gap-1 transition cursor-pointer min-h-[52px]"
                title="SMS Gateway Broadcast"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-center leading-tight">{t.smsLabel}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.alertsTotal}</span>
              <span className="text-sm font-extrabold text-slate-900">{alerts.length}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-800 font-bold border border-red-200">
                {activeCount} {t.activeOnly}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onClearAlerts}
                  className="ml-auto text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  {t.clearDatabaseAdmin}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Alerts feed */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">{t.riverFloodAlerts}</h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{t.villageFloodWarningNetwork}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(['all', 'active', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      statusFilter === f
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' ? t.filterAll : f === 'active' ? t.activeOnly : t.filterResolved}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {groupedAlerts.length > 0 ? (
                groupedAlerts.map((group) => {
                  const friendly = getResidentFriendlyAlert(group.latestAlert);
                  const isExpanded = expandedGroupIds.has(group.id);
                  const severityBorder =
                    group.highestSeverity === 'red'
                      ? 'border-red-200 bg-red-50/40'
                      : group.highestSeverity === 'yellow'
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-emerald-200 bg-emerald-50/30';

                  return (
                    <div
                      key={group.id}
                      className={`rounded-xl border p-3.5 space-y-2.5 ${severityBorder}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              group.highestSeverity === 'red'
                                ? 'bg-red-100 text-red-700'
                                : group.highestSeverity === 'yellow'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {group.highestSeverity === 'red' ? (
                              <ShieldAlert className="w-4.5 h-4.5" />
                            ) : group.highestSeverity === 'yellow' ? (
                              <AlertTriangle className="w-4.5 h-4.5" />
                            ) : (
                              <CheckCircle2 className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">{friendly.displayTitle}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-600 font-medium">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate">{group.locationLabel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            {friendly.stateLabel}
                          </span>
                          {group.allAlerts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleGroupExpand(group.id)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{friendly.displayMessage}</p>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>
                            {group.latestAlert.formattedTime ||
                              new Date(group.latestAlert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {group.hasActive && (
                            <button
                              type="button"
                              onClick={() => onDismissAlert(group.latestAlert.id)}
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
                            >
                              {t.clearMyView}
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleItemDelete(group.latestAlert.id)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && group.allAlerts.length > 1 && (
                        <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {t.recentUpdatesAtStation}:
                          </span>
                          {group.allAlerts.map((subAlert, idx) => {
                            const subFriendly = getResidentFriendlyAlert(subAlert);
                            return (
                              <div
                                key={subAlert.id || idx}
                                className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      subAlert.severity === 'red'
                                        ? 'bg-red-600'
                                        : subAlert.severity === 'yellow'
                                        ? 'bg-amber-600'
                                        : 'bg-emerald-600'
                                    }`}
                                  />
                                  <span className="font-semibold text-slate-800 truncate">
                                    {subFriendly.stateLabel}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium shrink-0 ml-2">
                                  {subAlert.formattedTime ||
                                    new Date(subAlert.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-center space-y-2 border border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">{t.riverChannelsClear}</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {t.alertMsgMonitoring}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
