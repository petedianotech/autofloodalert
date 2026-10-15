import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Bell,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  MessageSquare,
  BellRing,
  Music,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Info,
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
    if (onDeleteAlert) onDeleteAlert(alertId);
    else onDismissAlert(alertId);
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
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
    if (msgLower.includes('clear') || msgLower.includes('normal') || msgLower.includes('no action') || isResolved) {
      displayMessage = t.alertMsgRiverClear;
    } else if (isRed) {
      displayMessage = t.alertMsgCriticalMove;
    } else if (isYellow) {
      displayMessage = t.alertMsgHighRisk;
    } else {
      displayMessage = t.alertMsgMonitoring;
    }

    let stateLabel = t.stateActiveWarning;
    if (isResolved) stateLabel = t.stateResolved;
    else if (isUpdated) stateLabel = t.stateUpdated;
    else if (isRed) stateLabel = t.stateCriticalWarning;
    else if (isYellow) stateLabel = t.stateHighFloodRisk;
    else stateLabel = t.stateMonitoring;

    return { displayTitle, displayMessage, stateLabel, isRed, isYellow, isResolved };
  };

  const filteredAlerts = useMemo(() => {
    if (statusFilter === 'active') return alerts.filter((a) => a.status === 'active');
    if (statusFilter === 'resolved')
      return alerts.filter((a) => a.status === 'dismissed' || a.status === 'resolved');
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
      const locKey = `${alert.riverName || 'River'}-${alert.village || 'Community'}`.toLowerCase();
      if (!groups.has(locKey)) {
        groups.set(locKey, {
          id: locKey,
          locationLabel:
            alert.locationLabel ||
            `${alert.riverName || 'River'}, ${alert.village || 'Community'}`,
          riverName: alert.riverName || 'River',
          village: alert.village || 'Community',
          hasActive: alert.status === 'active',
          highestSeverity:
            alert.severity === 'red' ? 'red' : alert.severity === 'yellow' ? 'yellow' : 'green',
          latestAlert: alert,
          allAlerts: [alert],
        });
      } else {
        const group = groups.get(locKey)!;
        group.allAlerts.push(alert);
        if (alert.status === 'active') group.hasActive = true;
        if (alert.severity === 'red') group.highestSeverity = 'red';
        else if (alert.severity === 'yellow' && group.highestSeverity !== 'red')
          group.highestSeverity = 'yellow';
        if (alert.timestamp > group.latestAlert.timestamp) group.latestAlert = alert;
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
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 leading-tight">{t.sendEmergencyVoiceSos}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t.cutOffByFloodVoiceHelp}</p>
              </div>
            </div>

            {onOpenVoiceSOS && (
              <button
                type="button"
                id="btn-alerts-voice-sos"
                onClick={onOpenVoiceSOS}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[48px] active:scale-98"
              >
                <MessageSquare className="w-4.5 h-4.5 shrink-0" />
                <span>{t.sendEmergencyVoiceSos}</span>
              </button>
            )}

            {!isAdmin && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Flood alerts are sent automatically by the sensor network and village admins. Residents
                  receive alerts on this screen and via push notification — you do not need to send alerts.
                </p>
              </div>
            )}
          </div>

          {isAdmin && (
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

              <button
                type="button"
                id="btn-sound-emergency-siren"
                onClick={toggleEmergencySiren}
                className={`w-full py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px] active:scale-98 ${
                  isSirenActive ? 'bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
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
          )}

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
                    <div key={group.id} className={`rounded-xl border p-3.5 space-y-2.5 ${severityBorder}`}>
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
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          )}
                          {(isAdmin || onDeleteAlert) && (
                            <button
                              type="button"
                              onClick={() => handleItemDelete(group.latestAlert.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && group.allAlerts.length > 1 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-2">
                          {group.allAlerts
                            .filter((a) => a.id !== group.latestAlert.id)
                            .map((a) => {
                              const f = getResidentFriendlyAlert(a);
                              return (
                                <div key={a.id} className="pl-2 border-l-2 border-slate-200 text-[11px] space-y-0.5">
                                  <p className="font-bold text-slate-800">{f.displayTitle}</p>
                                  <p className="text-slate-600">{f.displayMessage}</p>
                                  <p className="text-slate-400">
                                    {a.formattedTime || new Date(a.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No alerts yet</p>
                  <p className="text-xs mt-1">Flood warnings will appear here when sensors detect rising water</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
