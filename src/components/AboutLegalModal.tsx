import React, { useState, useEffect } from 'react';
import {
  X,
  Info,
  GraduationCap,
  FileText,
  Lock,
  ShieldCheck,
  Building,
  Users,
  ExternalLink,
  Code,
  Award,
} from 'lucide-react';

interface AboutLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'thanks' | 'about' | 'privacy' | 'terms';
}

export const AboutLegalModal: React.FC<AboutLegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'thanks',
}) => {
  const [activeTab, setActiveTab] = useState<'thanks' | 'about' | 'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="System Information"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Professional Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Automatic Flood Alert
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Dzenje CDSS ADDA STEM Club &bull; Mulanje, Malawi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Navigation (Single word tabs to prevent scroll/wrap) */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('thanks')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'thanks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Thanks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body (Fixed cards inside) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: THANKS & CREDITS */}
          {activeTab === 'thanks' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Special Acknowledgments &amp; Dedication</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  We express our sincere gratitude to everyone who supported and guided our STEM innovation for community flood safety along the Ruo River.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <strong className="text-slate-900 text-xs">Mr. Palapandu (Head Teacher, Dzenje CDSS)</strong>
                  </div>
                  <p className="text-xs text-slate-600 italic pl-6 border-l-2 border-blue-500/40 my-1">
                    &ldquo;You'll never fail till you stop trying.&rdquo;
                  </p>
                  <p className="text-xs text-slate-600 pl-6">
                    Thank you for your constant motivation, mentorship, and encouragement in our STEM innovation journey.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <strong className="text-slate-900 text-xs">Mr. Skinner (Club Patron)</strong>
                  </div>
                  <p className="text-xs text-slate-600 pl-6">
                    Thank you for being with us every step of the way, providing expert guidance, technical oversight, and unwavering support for our community project.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600 shrink-0" />
                    <strong className="text-blue-950 text-xs">Developer Credits</strong>
                  </div>
                  <div className="text-xs text-blue-900 space-y-1 pl-6">
                    <p><strong>Developed by:</strong> Dzenje CDSS ADDA STEM Club</p>
                    <p><strong>Lead Developer:</strong> Peter Damiano</p>
                    <p className="flex items-center gap-1.5 pt-1">
                      <span>Portfolio:</span>
                      <a
                        href="https://peterdamiano.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center gap-1"
                      >
                        <span>peterdamiano.vercel.app</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Early Warning System for Ruo River Basin</span>
                </h3>
                <p className="text-xs text-blue-900 font-medium">
                  Developed by the Dzenje CDSS ADDA STEM Club under Traditional Authority Mabuka in Mulanje, Malawi. Designed to provide instant, automated flash flood warnings and SMS broadcasts to protect rural communities along the Ruo River.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block text-xs">Target Communities</strong>
                  <p className="text-xs text-slate-600">
                    Dzenje Village, Machokola Village, and surrounding flood-prone settlements along the Ruo River basin.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block text-xs">STEM Innovation</strong>
                  <p className="text-xs text-slate-600">
                    Integrates real-time vibration sensors, acoustic resonance detection, automated SMS dispatch, and offline PWA resilience.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block text-xs">Academic Presentation</strong>
                <p className="text-xs text-slate-600">
                  Prepared for presentation at the Malawi University of Science and Technology (MUST). Production-ready architecture built for disaster risk reduction and community resilience.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY (Fixed Card, Not Awkwardly Scrollable) */}
          {activeTab === 'privacy' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Privacy &amp; Data Protection Summary
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">1</div>
                  <p>
                    <strong>Name &amp; Village:</strong> Used exclusively for community headcounts and emergency roll-calls so village disaster committees and neighbors know households are safe.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">2</div>
                  <p>
                    <strong>Phone Number (Optional):</strong> Stored securely in Firebase Firestore to dispatch automated emergency SMS warnings when river levels rise.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">3</div>
                  <p>
                    <strong>Secure Cloud Storage:</strong> All records are protected using secure cloud authentication and strict role-based access rules. No data is shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS (Fixed Card, Not Awkwardly Scrollable) */}
          {activeTab === 'terms' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Community Terms of Use
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">1</div>
                  <p>
                    <strong>Life Safety Priority:</strong> Always prioritize physical evacuation to designated high ground when flood warning bells ring or river sensors trigger.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">2</div>
                  <p>
                    <strong>Genuine Emergency Use:</strong> The Emergency Voice SOS and high-water sighting reporting buttons must be used solely during real flood emergencies.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">3</div>
                  <p>
                    <strong>Free Public Service:</strong> This system is provided free of charge as a community service by Dzenje CDSS ADDA STEM Club for Mulanje district residents.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <footer className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-xs"
          >
            Understood, Return to App
          </button>
        </footer>

      </div>
    </div>
  );
};
