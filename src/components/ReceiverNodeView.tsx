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

  /**
   * Helper: Convert technical sensor titles or messages to simple plain English for residents.
   * Removes all raw sensor measurements (m/s², dB, vibration deltas, robotic text).
   * Communicates established severity status and practical instructions.
   */
  const getResidentFriendlyAlert = (alert: FloodAlert) => {
    const isRed = alert.severity === 'red';
    const isYellow = alert.severity === 'yellow';
    const isResolved = alert.status === 'dismissed' || alert.status === 'resolved';
    const isUpdated = Boolean(alert.notes?.toLowerCase().includes('update') || alert.notes?.toLowerCase().includes('acknowledged'));

    let displayTitle = alert.title || '';
    let displayMessage = alert.message || '';

    // If title has raw technical phrasing, vibration, decibels or default hardware text, replace with plain English
    const hasTechTitle =
      !displayTitle ||
      /m\/s|m\/s²|m\/s\^2|dB|decibel|vibration|motor|bell|node|sensor|movement|axis/i.test(displayTitle);

    if (hasTechTitle) {
      if (isResolved) {
        displayTitle = 'MONITORING — River Clear';
      } else if (isRed) {
        displayTitle = 'CRITICAL FLOOD WARNING — Move to Higher Ground Now';
      } else if (isYellow) {
        displayTitle = 'HIGH FLOOD RISK — Stay Alert';
      } else {
        displayTitle = 'MONITORING — Stay Informed';
      }
    }

    // Clean message of raw sensor measurements like "2.4 m/s²", "85 dB", or motor movement
    const hasTechMessage =
      !displayMessage ||
      /m\/s|m\/s²|m\/s\^2|dB|decibel|motor movement|vibration delta|baseline|gravity/i.test(displayMessage);

    if (hasTechMessage) {
      if (isResolved) {
        displayMessage = 'Water levels have receded. Normal monitoring in effect.';
      } else if (isRed) {
        displayMessage = 'Rapid river rise detected. Move your family and animals to designated safe high ground immediately.';
      } else if (isYellow) {
        displayMessage = 'River water is rising fast. Stay alert, keep phones charged, and prepare to move to high ground.';
      } else {
        displayMessage = 'River sensor is currently monitoring water levels. No action required.';
      }
    }

    // Determine clear, standardized severity & status labels
    let stateLabel = 'Active Warning';
    let stateBadgeClass = 'bg-red-50 text-red-800 border-red-200';

    if (isResolved) {
      stateLabel = 'Resolved';
      stateBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (isUpdated) {
      stateLabel = 'Updated';
      stateBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (isRed) {
      stateLabel = 'Critical Warning';
      stateBadgeClass = 'bg-red-100 text-red-900 border-red-300 font-bold';
    } else if (isYellow) {
      stateLabel = 'High Flood Risk';
      stateBadgeClass = 'bg-amber-50 text-amber-900 border-amber-200';
    } else {
      stateLabel = 'Monitoring';
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

  // Group repeated alerts from the same station / source / location into clean combined event cards.
  // Never hide a higher severity level, active warning, or meaningful update.
  interface AlertGroup {
    groupId: string;
    locationKey: string;
    latestAlert: FloodAlert;
    allAlerts: FloodAlert[];
    hasActive: boolean;
    highestSeverity: 'red' | 'yellow' | 'green';
  }

  const groupedAlerts = useMemo(() => {
    // Filter first by status if requested
    const filtered = alerts.filter((a) => {
      if (statusFilter === 'active') return a.status === 'active';
      if (statusFilter === 'resolved') return a.status === 'dismissed' || a.status === 'resolved';
      return true;
    });

    const groupsMap = new Map<string, AlertGroup>();

    filtered.forEach((alert) => {
      // Group key based on river and village location
      const locKey = `${alert.riverName || 'Ruo River'}-${alert.village || 'Dzenje'}`.toLowerCase();

      if (!groupsMap.has(locKey)) {
        groupsMap.set(locKey, {
          groupId: locKey,
          locationKey: locKey,
          latestAlert: alert,
          allAlerts: [alert],
          hasActive: alert.status === 'active',
          highestSeverity: alert.severity === 'red' ? 'red' : alert.severity === 'yellow' ? 'yellow' : 'green',
        });
      } else {
        const group = groupsMap.get(locKey)!;
        group.allAlerts.push(alert);

        if (alert.status === 'active') {
          group.hasActive = true;
        }

        // Maintain the highest severity so critical danger is never obscured
        if (alert.severity === 'red') {
          group.highestSeverity = 'red';
        } else if (alert.severity === 'yellow' && group.highestSeverity !== 'red') {
          group.highestSeverity = 'yellow';
        }

        // Determine which alert represents the group header:
        // Prioritize active alerts over dismissed, and higher severity over lower
        const currentPrimary = group.latestAlert;
        if (alert.status === 'active' && currentPrimary.status !== 'active') {
          group.latestAlert = alert;
        } else if (alert.status === 'active' && currentPrimary.status === 'active') {
          if (alert.severity === 'red' && currentPrimary.severity !== 'red') {
            group.latestAlert = alert;
          } else if (alert.timestamp > currentPrimary.timestamp && alert.severity === currentPrimary.severity) {
            group.latestAlert = alert;
          }
        } else if (currentPrimary.status !== 'active' && alert.timestamp > currentPrimary.timestamp) {
          group.latestAlert = alert;
        }
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => {
      // Show active groups first, then by latest timestamp
      if (a.hasActive && !b.hasActive) return -1;
      if (!a.hasActive && b.hasActive) return 1;
      return b.latestAlert.timestamp - a.latestAlert.timestamp;
    });
  }, [alerts, statusFilter]);

  return (
    <div className="space-y-4 pb-20 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Readiness, Quick Siren Station (Admin) or Fast Help Card (Resident) */}
        <div className="lg:col-span-5 space-y-4">
          <NotificationEnableCard isDarkMode={false} />
          <BatteryOptimizationCard />

          {isAdmin ? (
            /* Admin Emergency Siren Command Box */
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700 shrink-0 shadow-2xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      Village Siren Broadcast
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Dzenje CDSS STEM Station Warning
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Admin
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Manually sound or silence the evacuation sirens on connected community devices.
              </p>

              <div className="pt-1 flex flex-col sm:flex-row gap-2 flex-wrap">
                <button
                  type="button"
                  id="btn-admin-toggle-siren"
                  onClick={toggleEmergencySiren}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer min-h-[44px] ${
                    isSirenActive
                      ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSirenActive ? 'Stop Emergency Siren' : 'Sound Emergency Siren'}</span>
                </button>

                {onOpenSoundModal && (
                  <button
                    type="button"
                    onClick={onOpenSoundModal}
                    className="py-3 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-98 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
                    title="Change Alert Sound"
                  >
                    <Music className="w-4 h-4 text-blue-600" />
                    <span>Sound</span>
                  </button>
                )}

                {onOpenFcmModal && (
                  <button
                    type="button"
                    onClick={onOpenFcmModal}
                    className="py-3 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 active:scale-98 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
                    title="Push Alerts Settings"
                  >
                    <BellRing className="w-4 h-4 text-blue-600" />
                    <span>Push</span>
                  </button>
                )}

                {onOpenSmsModal && (
                  <button
                    type="button"
                    onClick={onOpenSmsModal}
                    className="py-3 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-98 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
                    title="SMS Gateway Broadcast"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>SMS</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Villager / Resident Emergency Fast Card */
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      Emergency Rescue Station
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Village Flood Warning Network
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
                  Rescue
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                If you are cut off by flood water or need emergency assistance, transmit an instant voice message with your phone's GPS location.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {onOpenVoiceSOS && (
                  <button
                    type="button"
                    id="btn-alerts-voice-sos"
                    onClick={onOpenVoiceSOS}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer min-h-[44px]"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Send Emergency Voice SOS</span>
                  </button>
                )}

                {onOpenSoundModal && (
                  <button
                    type="button"
                    onClick={onOpenSoundModal}
                    className="py-3 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-98 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[44px]"
                    title="Change Alert Sound"
                  >
                    <Music className="w-4 h-4 text-slate-600" />
                    <span>Sound</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: River Flood Alerts Feed */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3.5 shadow-xs">
            {/* Header with Counter and Clear View Action */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  River Flood Alerts
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {alerts.length} total
                </span>
              </div>

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
                  <span>{isAdmin ? 'Clear Database (Admin)' : 'Clear My View'}</span>
                </button>
              )}
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
                All ({alerts.length})
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
                <span>Active Only</span>
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
                Resolved
              </button>
            </div>

            {/* Local Clear Disclaimer: Explains that clearing view does not delete database records */}
            {!isAdmin && alerts.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-snug">
                <strong>Notice:</strong> Clearing alerts removes them from your phone screen only. Official sensor records remain safely stored in the community database.
              </div>
            )}

            {/* Alerts List / Grouped Feeds */}
            <div className="space-y-3 pt-1">
              {groupedAlerts.length > 0 ? (
                groupedAlerts.map((group) => {
                  const primaryAlert = group.latestAlert;
                  const friendly = getResidentFriendlyAlert(primaryAlert);
                  const isExpanded = expandedGroupIds.has(group.groupId);
                  const hasMultiple = group.allAlerts.length > 1;

                  return (
                    <div
                      key={group.groupId}
                      className={`rounded-2xl p-4 border transition shadow-xs space-y-3 ${
                        friendly.isRed
                          ? 'bg-red-50/60 border-red-300'
                          : friendly.isYellow
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      {/* Alert Header Row */}
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
                              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                {friendly.title}
                              </h4>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${friendly.stateBadgeClass}`}
                              >
                                {friendly.stateLabel}
                              </span>

                              {hasMultiple && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  <span>{group.allAlerts.length} updates</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                              {friendly.message}
                            </p>
                          </div>
                        </div>

                        {/* Delete / Dismiss Button */}
                        <button
                          type="button"
                          id={`btn-delete-alert-${primaryAlert.id}`}
                          onClick={() => handleItemDelete(primaryAlert.id)}
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

                      {/* Location & Time Stamp Footer */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">
                            {primaryAlert.riverName || primaryAlert.village || 'Ruo River Station'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              {primaryAlert.formattedTime ||
                                new Date(primaryAlert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          {hasMultiple && (
                            <button
                              type="button"
                              onClick={() => toggleGroupExpand(group.groupId)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer ml-1"
                            >
                              <span>{isExpanded ? 'Hide updates' : 'View history'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded History of Repeated Updates */}
                      {hasMultiple && isExpanded && (
                        <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-2 bg-white/70 p-3 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                            Recent Updates at this Station:
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
                                  {subAlert.formattedTime || new Date(subAlert.timestamp).toLocaleTimeString()}
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
                  <p className="text-xs font-bold text-slate-900">River Channels Clear &bull; No Active Warnings</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    River sensors along the Ruo River and surrounding streams are active. You will receive audible warnings and SMS alerts immediately if water levels rise.
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
