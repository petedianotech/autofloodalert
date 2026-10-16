import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Smartphone,
  Send,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Check,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  smsGatewayService,
  SmsGatewayConfig,
} from '../services/smsGatewayService';
import { firebaseFloodService } from '../services/firebaseService';

interface SmsGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsGatewayModal: React.FC<SmsGatewayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SmsGatewayConfig>(() =>
    smsGatewayService.getConfig()
  );

  useEffect(() => {
    if (!isOpen) return;
    const unsub = smsGatewayService.subscribeRecipients(() => {
      setConfig(smsGatewayService.getConfig());
    });
    return unsub;
  }, [isOpen]);

  const [activeTab, setActiveTab] = useState<'all' | 'marked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshingContacts, setIsRefreshingContacts] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRefreshContacts = async () => {
    setIsRefreshingContacts(true);
    setRefreshMsg(null);
    try {
      const res = await firebaseFloodService.manualRefreshAll();
      setConfig(smsGatewayService.getConfig());
      if (res && res.newUsersCount > 0) {
        setRefreshMsg(`Found ${res.newUsersCount} new signed-in user(s)!`);
      } else {
        setRefreshMsg(`Synced: ${res ? res.usersCount : 0} users loaded`);
      }
    } catch {
      setRefreshMsg('Sync error');
    } finally {
      setIsRefreshingContacts(false);
      setTimeout(() => setRefreshMsg(null), 3500);
    }
  };

  const handleRemoveRecipient = (id: string) => {
    smsGatewayService.removeRecipient(id);
    setConfig(smsGatewayService.getConfig());
  };

  const handleToggleRecipient = (id: string, enabled: boolean) => {
    smsGatewayService.toggleRecipient(id, enabled);
    setConfig(smsGatewayService.getConfig());
  };

  const handleMarkAll = (enabled: boolean) => {
    smsGatewayService.setAllRecipientsEnabled(enabled);
    setConfig(smsGatewayService.getConfig());
  };

  const handleSendBroadcast = async () => {
    setIsSending(true);
    setSendResult(null);

    const result = await smsGatewayService.sendLanguageAwareBroadcastSms(false); // manual trigger
    setIsSending(false);
    setSendResult(result);
  };

  const recipients = config.recipients || [];
  const activeRecipients = recipients.filter((r) => r.enabled && r.phone.trim().length >= 6);

  // Filtered recipients according to search query and active tab
  const filteredRecipients = recipients.filter((rec) => {
    if (activeTab === 'marked' && !rec.enabled) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = rec.name.toLowerCase().includes(q);
      const matchPhone = rec.phone.toLowerCase().includes(q);
      const matchVillage = rec.village.toLowerCase().includes(q);
      return matchName || matchPhone || matchVillage;
    }
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SMS Gateway Broadcast"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Professional Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                SMS Flood Alert Gateway
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Village Emergency SMS Broadcast Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-sms-refresh-recipients"
              onClick={handleRefreshContacts}
              disabled={isRefreshingContacts}
              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-[#006A4E] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh contacts from Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#006A4E] ${isRefreshingContacts ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">

        {/* Refresh feedback toast if triggered */}
        {refreshMsg && (
          <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refreshMsg}</span>
          </div>
        )}

        {/* Gateway Phone Status Only */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-[#006A4E]" />
            <div>
              <span className="text-xs font-bold text-[#1C1B1F] block">
                Gateway Phone
              </span>
              <span className="text-[11px] text-[#49454F]">
                Sends flood alerts directly to local SIMs
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Online & Ready</span>
          </span>
        </div>

        {/* Language Summary & Mark Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C1B1F]">
              Marked Numbers: {activeRecipients.length} of {recipients.length}
            </span>
            <span className="text-[11px] text-[#49454F] font-medium">
              Tap checkbox to mark
            </span>
          </div>

          {/* Active Recipients Summary Card */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-950 block">
                SMS Alert Recipients
              </span>
              <p className="text-[11px] text-blue-800 font-medium mt-0.5">
                {activeRecipients.length} of {recipients.length} phone numbers marked to receive instant flood alerts
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleMarkAll(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Mark All
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, village, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#006A4E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Numbers List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
            {filteredRecipients.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-[#49454F]">
                No registered numbers match this view.
              </div>
            ) : (
              filteredRecipients.map((rec) => {
                return (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-2xl border transition flex flex-col gap-2 ${
                      rec.enabled
                        ? 'bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-200/50'
                        : 'bg-slate-50/70 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Checkbox and Contact info */}
                      <button
                        type="button"
                        onClick={() => handleToggleRecipient(rec.id, !rec.enabled)}
                        className="flex items-center gap-2.5 text-left cursor-pointer grow min-w-0"
                      >
                        <div className="shrink-0">
                          {rec.enabled ? (
                            <div className="w-5 h-5 rounded-md bg-[#006A4E] text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-3" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#1C1B1F] truncate">
                              {rec.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                              {rec.village}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#49454F] block">
                            {rec.phone}
                          </span>
                        </div>
                      </button>

                      {/* Delete Contact */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(rec.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-600 flex items-center justify-center transition cursor-pointer shrink-0"
                        title="Remove number"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 text-[10px]">Alert Message: Emergency Flood SMS</span>
                      <div>
                        {rec.enabled ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ Ready to Receive
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                            Unmarked (No SMS)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Send Emergency Warning Action */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSendBroadcast}
            disabled={isSending || activeRecipients.length === 0}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#006A4E] hover:bg-emerald-800 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <span>Sending SMS Warning...</span>
            ) : (
              <>
                <Send className="w-4 h-4 fill-current" />
                <span>
                  Send Flood Warning to {activeRecipients.length} Marked Phone{activeRecipients.length === 1 ? '' : 's'}
                </span>
              </>
            )}
          </button>

          {/* Feedback message */}
          {sendResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                sendResult.success
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border border-red-200 text-red-950'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="leading-snug">
                {sendResult.success
                  ? `Success! Emergency text sent to ${sendResult.sentCount} marked phone${sendResult.sentCount === 1 ? '' : 's'}.`
                  : sendResult.error || 'Failed to send text message.'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-xs font-bold text-[#1C1B1F] transition cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 text-[#006A4E]" />
          <span>Done</span>
        </button>
        </div>
      </div>
    </div>
  );
};
