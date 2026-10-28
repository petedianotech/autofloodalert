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
  ExternalLink,
  Radio,
} from 'lucide-react';
import { FloodAlert, UserProfile, isAppAdmin } from '../types';
import { sirenService } from '../services/audioSiren';
import { NotificationService } from '../services/notificationService';
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
  const isAdmin = isAdminProp ?? isAppAdmin(currentUser);
  const { t, isChichewa } = useTranslation(isAdmin);
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

  /**
   * Helper: Convert technical sensor titles or messages to simple plain English or Chichewa.
   * Removes all raw sensor measurements (m/s², dB, vibration deltas, robotic text).
   * Communicates established severity status and practical instructions.
   */
  const getResidentFriendlyAlert = (alert: FloodAlert) => {
    const isRed = alert.severity === 'red';
    const isYellow = alert.severity === 'yellow';
    const isResolved = alert.status === 'dismissed' || alert.status === 'resolved';
    const isUpdated = Boolean(alert.notes?.toLowerCase().includes('update') || alert.notes?.toLowerCase().includes('acknowledged'));
    const isAcoustic = alert.source === 'acoustic_sound_sensor' || Boolean(alert.message?.toLowerCase().includes('bell') || alert.notes?.toLowerCase().includes('bell'));

    let displayTitle = alert.title || '';
    let displayMessage = alert.message || '';

    // If title has raw technical phrasing, vibration, decibels or default hardware text, replace with plain English / Chichewa
    const hasTechTitle =
      !displayTitle ||
      /m\/s|m\/s²|m\/s\^2|dB|decibel|vibration|motor|bell|node|sensor|movement|axis/i.test(displayTitle);

    if (hasTechTitle || isChichewa) {
      if (isResolved) {
        displayTitle = isChichewa ? t.monitoringRiverClearTitle : 'MONITORING — River Clear';
      } else if (isRed) {
        displayTitle = isChichewa ? t.criticalFloodWarningTitle : 'CRITICAL FLOOD WARNING — Move to Higher Ground Now';
      } else if (isYellow) {
        displayTitle = isChichewa ? 'CHIOPSEZO CHA CHIGUMULA — Khalani Maso' : 'HIGH FLOOD RISK — Stay Alert';
      } else {
        displayTitle = isChichewa ? "KUYANG'ANIRA — Khalani Maso" : 'MONITORING — Stay Informed';
      }
    }

    // Clean message of raw sensor measurements like "2.4 m/s²", "85 dB", or motor movement
    const hasTechMessage =
      !displayMessage ||
      /m\/s|m\/s²|m\/s\^2|dB|decibel|motor movement|vibration delta|baseline|gravity/i.test(displayMessage);

    if (hasTechMessage || isChichewa) {
      if (isResolved) {
        displayMessage = isAcoustic
          ? (isChichewa ? t.monitoringBellRingDesc : 'Emergency flood warning bell ringing near Dzenje Village. Prepare to move to high ground.')
          : (isChichewa ? "Madzi osefukira atsika. Kuyang'anira kuli bwino." : 'Water levels have receded. Normal monitoring in effect.');
      } else if (isRed) {
        displayMessage = isChichewa
          ? t.criticalFloodWarningDesc
          : 'Rapid flood water detected near Dzenje Village. Move your family, children, and animals to designated safe high ground immediately.';
      } else if (isYellow) {
        displayMessage = isAcoustic
          ? (isChichewa ? t.monitoringBellRingDesc : 'Emergency flood warning bell ringing near Dzenje Village. Prepare to move to high ground.')
          : (isChichewa ? 'Madzi a m’mtsinje wayamba kukwera mofulumira. Khalani maso ndi okonzeka kusamukira ku malo okwera.' : 'River water is rising fast. Stay alert, keep phones charged, and prepare to move to high ground.');
      } else {
        displayMessage = isChichewa ? "Makina akuyang'anira madzi m'mtsinje. Palibe chiopsezo." : 'River sensor is currently monitoring water levels. No action required.';
      }
    }

    // Determine clear, standardized severity & status labels
    let stateLabel = isChichewa ? 'Chenjezo la Chigumula' : 'Active Warning';
    let stateBadgeClass = 'bg-red-50 text-red-800 border-red-200';

    if (isResolved) {
      stateLabel = isChichewa ? t.resolved : 'Resolved';
      stateBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (isUpdated) {
      stateLabel = isChichewa ? 'Zasinthidwa' : 'Updated';
      stateBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (isRed) {
      stateLabel = isChichewa ? 'Chenjezo Lalikulu' : 'Critical Warning';
      stateBadgeClass = 'bg-red-100 text-red-900 border-red-300 font-bold';
    } else if (isYellow) {
      stateLabel = isChichewa ? 'Chiopsezo Chachikulu' : 'High Flood Risk';
      stateBadgeClass = 'bg-amber-50 text-amber-900 border-amber-200';
    } else {
      stateLabel = isChichewa ? "Kuyang'anira" : 'Monitoring';
      stateBadgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
    }

    return {
      title: displayTitle,
      message: displayMessage,
      stateLabel,
      stateBadgeClass,
      isRed,
      isYellow,
      isResolved,
      isUpdated,
    };
  };

  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);

  const handleToggleAlertSound = (alert: FloodAlert) => {
    if (playingAlertId === alert.id) {
      sirenService.stopAllAlarms();
      setPlayingAlertId(null);
    } else {
      setPlayingAlertId(alert.id);
      if (alert.severity === 'yellow') {
        sirenService.stopEmergencySiren();
        sirenService.startWarningChime();
      } else {
        sirenService.stopWarningChime();
        sirenService.startEmergencySiren();
      }
    }
  };

  // Every alert is displayed individually as its own distinct button/card (never grouped or stacked)
  const displayAlerts = useMemo(() => {
    const filtered = alerts.filter((a) => {
      if (statusFilter === 'active') return a.status === 'active';
      if (statusFilter === 'resolved') return a.status === 'dismissed' || a.status === 'resolved';
      return true;
    });

    // Active alerts first, then newest timestamp first
    return [...filtered].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.timestamp - a.timestamp;
    });
  }, [alerts, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 select-none">
      <div className="space-y-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            {/* Header with Counter and Clear View Action */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {t.riverFloodAlerts}
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {alerts.length} {t.total}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenSmsModal && isAdmin && (
                  <button
                    type="button"
                    id="btn-alerts-open-sms-broadcast"
                    onClick={onOpenSmsModal}
                    className="text-xs font-bold transition flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs"
                    title="Open SMS Flood Alert Gateway (Admin)"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>SMS Gateway</span>
                  </button>
                )}

                {alerts.length > 0 && (
                  <button
                    type="button"
                    id="btn-clear-alerts"
                    onClick={onClearAlerts}
                    className={`text-xs font-bold transition flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-full border ${
                      isAdmin
                        ? 'text-red-700 hover:text-red-800 bg-red-50 border-red-200'
                        : 'text-slate-700 hover:text-slate-900 bg-slate-100 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={
                      isAdmin
                        ? 'Delete all alerts from database for all village users'
                        : 'Clear alerts from your phone view only'
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAdmin ? (isChichewa ? 'Fafazani Zonse (Admin)' : 'Clear Database (Admin)') : t.clearMyView}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: All / Active / Resolved */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.all} ({alerts.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'active'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t.activeOnly}</span>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">
                  {alerts.filter((a) => a.status === 'active').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.resolved}
              </button>
            </div>

            {/* Local Clear Disclaimer: Explains that clearing view does not delete database records */}
            {!isAdmin && alerts.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-snug">
                {t.clearNotice}
              </div>
            )}

            {/* Individual Alert Buttons Feed (Each alert displayed individually on its own button, never stacked) */}
            <div className="space-y-3 pt-1">
              {displayAlerts.length > 0 ? (
                displayAlerts.map((alert) => {
                  const friendly = getResidentFriendlyAlert(alert);
                  const isPlayingThis = playingAlertId === alert.id;

                  return (
                    <div
                      key={alert.id}
                      id={`alert-card-${alert.id}`}
                      className={`rounded-2xl p-4 border transition shadow-xs space-y-3 text-left ${
                        friendly.isRed
                          ? 'bg-red-50/70 border-red-300 ring-1 ring-red-200'
                          : friendly.isYellow
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      {/* Top Row: Icon + Severity Badge + Individual Action Controls */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              friendly.isRed
                                ? 'bg-red-600 text-white'
                                : friendly.isYellow
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {friendly.isRed ? (
                              <AlertOctagon className="w-4 h-4 animate-bounce" />
                            ) : friendly.isYellow ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <Bell className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${friendly.stateBadgeClass}`}
                              >
                                {friendly.stateLabel}
                              </span>

                              <span className="text-[10px] text-slate-500 font-mono">
                                #{alert.id.slice(-6)}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 leading-tight mt-1">
                              {friendly.title}
                            </h4>

                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                              {friendly.message}
                            </p>
                          </div>
                        </div>

                        {/* Individual Alert Dismiss / Delete Button */}
                        <button
                          type="button"
                          id={`btn-delete-alert-${alert.id}`}
                          onClick={() => handleItemDelete(alert.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                            isAdmin
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-100'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                          }`}
                          title={
                            isAdmin
                              ? 'Delete alert for everyone from Firestore (Admin)'
                              : 'Hide alert from my screen'
                          }
                          aria-label={isAdmin ? 'Delete alert for everyone' : 'Hide alert'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Location & Time Stamp Details */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">
                            {isChichewa && (alert.riverName?.toLowerCase().includes('ruo') || alert.notes?.toLowerCase().includes('ruo') || (!alert.riverName && !alert.village))
                              ? t.ruoRiver
                              : (alert.riverName || alert.village || (isChichewa ? t.ruoRiver : 'Ruo River'))}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>
                            {alert.formattedTime || new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for Alert (Map & Dismiss/Delete) */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap">
                        {(alert.mapsUrl || (alert.latitude && alert.longitude)) && (
                          <a
                            href={
                              alert.mapsUrl ||
                              `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Map</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleItemDelete(alert.id)}
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAdmin ? (isChichewa ? 'Fafazani' : 'Delete') : t.dismissBtn}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-50 rounded-xl p-6 text-center space-y-2 border border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">{t.riverChannelsClearNoAlerts}</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {t.riverSensorsActiveDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
