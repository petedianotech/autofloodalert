/**
 * Location Service for Flood Sensor Nodes & Community Receivers
 * - Real hardware GPS coordinates via navigator.geolocation API
 * - Reverse-geocoding support (OpenStreetMap Nominatim + smart offline fallback)
 * - Multi-sensor river station metadata management
 * - Custom preset river stations in Malawi (Ruo River, Dzenje Village, T/A Mabuka, Mulanje)
 * - Mobile browser / PWA: only call getCurrentPosition from a direct user tap (no blocked popup)
 */

import { GeoLocationCoordinates, SensorLocation } from '../types';
import { Capacitor } from '@capacitor/core';
import { Geolocation as CapGeolocation } from '@capacitor/geolocation';

export const DEFAULT_MALAWI_SENSOR_LOCATION: SensorLocation = {
  riverName: 'Ruo River',
  village: 'Dzenje Village',
  traditionalAuthority: 'T/A Mabuka',
  district: 'Mulanje',
  region: 'Southern Region, Malawi',
  fullAddress: 'Ruo River, Dzenje Village, T/A Mabuka, Mulanje District, Southern Region, Malawi',
  coordinates: {
    latitude: -16.0315,
    longitude: 35.5000,
    accuracy: 8,
    altitude: 640,
    timestamp: Date.now(),
  },
  isGpsLive: false,
  gpsAccuracy: 8,
  mapsUrl: 'https://www.google.com/maps?q=-16.0315,35.5000',
};

export const MALAWI_RIVER_STATION_PRESETS: Array<{
  id: string;
  name: string;
  riverName: string;
  village: string;
  traditionalAuthority: string;
  district: string;
  region: string;
  defaultCoords: { lat: number; lng: number };
}> = [
  {
    id: 'station_ruo_dzenje',
    name: 'Sensor #1: Ruo River (Dzenje Village, T/A Mabuka)',
    riverName: 'Ruo River',
    village: 'Dzenje Village',
    traditionalAuthority: 'T/A Mabuka',
    district: 'Mulanje',
    region: 'Southern Region, Malawi',
    defaultCoords: { lat: -16.0315, lng: 35.5000 },
  },
  {
    id: 'station_machokola_upper',
    name: 'Sensor #2: Machokola Village Upper River Watch Post',
    riverName: 'Upper River Basin',
    village: 'Machokola Village',
    traditionalAuthority: 'T/A Mabuka',
    district: 'Mulanje',
    region: 'Southern Region, Malawi',
    defaultCoords: { lat: -16.0122, lng: 35.5140 },
  },
];

class LocationService {
  private cachedLocation: SensorLocation | null = null;
  private watchId: number | null = null;

  constructor() {
    this.loadSavedLocation();
  }

  private loadSavedLocation() {
    try {
      const saved = localStorage.getItem('flood_sensor_location_config');
      if (saved) {
        this.cachedLocation = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  public saveLocation(location: SensorLocation) {
    this.cachedLocation = location;
    try {
      localStorage.setItem('flood_sensor_location_config', JSON.stringify(location));
    } catch {
      // ignore
    }
  }

  public getSavedLocation(): SensorLocation {
    if (this.cachedLocation) {
      return this.cachedLocation;
    }
    return DEFAULT_MALAWI_SENSOR_LOCATION;
  }

  /**
   * Acquire real GPS hardware coordinates from the mobile device.
   * Must be called from a direct user gesture (button click) so the browser
   * permission bubble is allowed — never from timers or background code.
   */
  public async getDeviceGpsCoordinates(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
  }): Promise<GeoLocationCoordinates> {
    const enableHighAccuracy = options?.enableHighAccuracy ?? true;
    const timeout = options?.timeout ?? 15000;

    // Secure context required for geolocation on modern mobile browsers / PWA
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const err: any = new Error(
        'GPS requires HTTPS (or localhost). Open the app from a secure link, not plain http.'
      );
      err.code = 1;
      throw err;
    }

    // 1. Native Capacitor (Android APK)
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('[GPS] Native Capacitor — checking permissions...');
        const perm = await CapGeolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          const req = await CapGeolocation.requestPermissions();
          if (req.location !== 'granted' && req.coarseLocation !== 'granted') {
            const err: any = new Error('Location permission denied on device.');
            err.code = 1;
            throw err;
          }
        }

        const pos = await CapGeolocation.getCurrentPosition({
          enableHighAccuracy,
          timeout,
          maximumAge: 5000,
        });

        return {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : null,
          timestamp: pos.timestamp || Date.now(),
        };
      } catch (nativeErr: any) {
        if (nativeErr.code === 1 || String(nativeErr.message).toLowerCase().includes('denied')) {
          const err: any = new Error('Location permission denied on device.');
          err.code = 1;
          throw err;
        }
        console.warn('[GPS] Native failed, falling back to Web API:', nativeErr);
      }
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err: any = new Error('Hardware GPS is not supported on this browser/device.');
      err.code = 2;
      throw err;
    }

    // Permissions API (when available) — does not open a popup by itself
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          const err: any = new Error(
            'Location is blocked for this site. Open browser site settings → allow Location, then try again.'
          );
          err.code = 1;
          throw err;
        }
      }
    } catch (permErr: any) {
      if (permErr?.code === 1) throw permErr;
      // Permissions API not supported — continue to getCurrentPosition (shows system bubble)
    }

    const acquirePosition = (
      highAcc: boolean,
      tOut: number,
      maxAge: number
    ): Promise<GeoLocationCoordinates> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: Number(pos.coords.latitude.toFixed(6)),
              longitude: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy),
              altitude: pos.coords.altitude ? Number(pos.coords.altitude.toFixed(1)) : null,
              timestamp: pos.timestamp || Date.now(),
            });
          },
          (err) => {
            const customErr: any = new Error(err.message || 'GPS position error');
            customErr.code = err.code;
            reject(customErr);
          },
          {
            enableHighAccuracy: highAcc,
            timeout: tOut,
            maximumAge: maxAge,
          }
        );
      });
    };

    try {
      return await acquirePosition(enableHighAccuracy, timeout, 0);
    } catch (primaryErr: any) {
      if (primaryErr.code === 1 || primaryErr.message?.toLowerCase().includes('denied')) {
        const err: any = new Error(
          'Location permission not granted. Tap Allow on the browser permission bubble, or enable Location in site settings.'
        );
        err.code = 1;
        throw err;
      }

      console.warn('[GPS] High-accuracy timed out. Trying network coarse fallback...', primaryErr);

      try {
        return await acquirePosition(false, 10000, 60000);
      } catch (fallbackErr: any) {
        if (fallbackErr.code === 1) {
          const err: any = new Error('Location permission denied in browser.');
          err.code = 1;
          throw err;
        }

        const msg =
          fallbackErr.code === 2
            ? 'GPS signal unavailable. Turn ON Location / GPS in phone settings and try outdoors.'
            : 'GPS fix timed out. Move outdoors or use village center coordinates.';
        const finalErr: any = new Error(msg);
        finalErr.code = fallbackErr.code || 3;
        throw finalErr;
      }
    }
  }

  public async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<{
    village?: string;
    district?: string;
    state?: string;
    country?: string;
    formattedAddress?: string;
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AutomaticFloodAlertSystem/2.0',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('Reverse geocoding response not ok');
      }

      const data = await res.json();
      const address = data.address || {};

      const village =
        address.village ||
        address.hamlet ||
        address.suburb ||
        address.town ||
        address.municipality ||
        address.county;
      const district = address.county || address.state_district || address.district;
      const state = address.state || address.region;
      const country = address.country || 'Malawi';

      return {
        village,
        district,
        state,
        country,
        formattedAddress: data.display_name,
      };
    } catch {
      return {};
    }
  }

  public formatFullAddress(loc: Partial<SensorLocation>): string {
    const parts = [
      loc.riverName ? `${loc.riverName}` : null,
      loc.village ? `${loc.village}` : null,
      loc.traditionalAuthority ? `${loc.traditionalAuthority}` : null,
      loc.district ? `${loc.district} District` : null,
      loc.region || 'Southern Region, Malawi',
    ].filter(Boolean);

    return parts.join(', ');
  }

  public getMapsUrl(lat?: number, lng?: number): string {
    if (lat === undefined || lng === undefined) return '';
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}

export const locationService = new LocationService();
