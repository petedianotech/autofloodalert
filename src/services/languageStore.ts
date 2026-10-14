/**
 * Shared language state so every screen updates the moment the user switches language.
 */
export type SupportedLanguage = 'en' | 'ny';

const STORAGE_KEY_LANGUAGE = 'flood_app_selected_language_v1';

type LangListener = (lang: SupportedLanguage) => void;

function readStored(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE);
    if (stored === 'ny' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

let currentLanguage: SupportedLanguage = readStored();
const listeners = new Set<LangListener>();

function persist(lang: SupportedLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
  } catch {
    // ignore
  }
}

function notify(lang: SupportedLanguage) {
  currentLanguage = lang;
  persist(lang);
  listeners.forEach((fn) => {
    try {
      fn(lang);
    } catch {
      // ignore
    }
  });
}

export function getStoredLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function setAppLanguage(lang: SupportedLanguage) {
  if (lang !== 'en' && lang !== 'ny') return;
  if (lang === currentLanguage) return;
  notify(lang);
}

export function toggleAppLanguage(): SupportedLanguage {
  const next: SupportedLanguage = currentLanguage === 'en' ? 'ny' : 'en';
  notify(next);
  return next;
}

export function subscribeLanguage(fn: LangListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
