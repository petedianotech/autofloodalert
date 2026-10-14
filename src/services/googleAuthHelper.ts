/**
 * Recommended Google Sign-In for Capacitor + Firebase Auth
 *
 * - Web: signInWithPopup (smooth UX)
 * - Android/iOS APK (Capacitor WebView): signInWithRedirect + getRedirectResult
 *   Popups are unreliable in Android WebViews and often show
 *   "The requested action is invalid".
 *
 * Still requires:
 * - SHA-1 / SHA-256 of the signing key in Firebase
 * - Web client ID (type 3) in Firebase Google provider
 * - Authorized domains include automatic-flood-alert.firebaseapp.com + localhost
 */

import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
provider.addScope('profile');
provider.addScope('email');

export function isNativeCapacitor(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Completes a pending redirect result if the user just returned from Google.
 * Call once after Auth is initialized.
 */
export async function completePendingGoogleRedirect(auth: Auth): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (err) {
    console.warn('[GoogleAuth] getRedirectResult:', err);
    return null;
  }
}

/**
 * Starts Google Sign-In using the best method for the current platform.
 * On native, may navigate away (redirect); caller should handle null return.
 */
export async function signInWithGoogleBestEffort(auth: Auth): Promise<UserCredential | null> {
  if (isNativeCapacitor()) {
    const pending = await completePendingGoogleRedirect(auth);
    if (pending) return pending;
    await signInWithRedirect(auth, provider);
    // Navigation away — no credential yet
    return null;
  }
  return signInWithPopup(auth, provider);
}
