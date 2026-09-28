/**
 * Location Service for Flood Sensor Nodes & Community Receivers
 * - Real hardware GPS coordinates via navigator.geolocation API
 * - Reverse-geocoding support (OpenStreetMap Nominatim + smart offline fallback)
 * - Multi-sensor river station metadata management
 * - Custom preset river stations in Malawi (Ruo River, Dzenje Village, T/A Mabuka, Mulanje)
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
   * Acquire real GPS hardware coordinates from the mobile device
   * Supports native Capacitor Geolocation (APK) with multi-tier fallback to standard web browser API.
   */
  public async getDeviceGpsCoordinates(options?: { enableHighAccuracy?: boolean; timeout?: number }): Promise<GeoLocationCoordinates> {
    const enableHighAccuracy = options?.enableHighAccuracy ?? true;
    const timeout = options?.timeout ?? 12000;

    // 1. Check if we are running on a native Capacitor platform (Android APK)
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('[GPS] Detecting native Capacitor platform - checking permissions...');
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
        console.warn('[GPS] Native Geolocation attempt failed, falling back to Web API:', nativeErr);
        // Fall through to standard web geolocation below
      }
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err: any = new Error('Hardware GPS is not supported on this browser/device.');
      err.code = 2;
      throw err;
    }

    // Helper promise wrapper for navigator.geolocation
    const acquirePosition = (highAcc: boolean, tOut: number, maxAge: number): Promise<GeoLocationCoordinates> => {
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

    // 2. First attempt: High Accuracy GPS (Satellites + Wi-Fi)
    try {
      return await acquirePosition(enableHighAccuracy, timeout, 0);
    } catch (primaryErr: any) {
      // If user specifically denied permission (code 1), do not try fallback, report immediately
      if (primaryErr.code === 1 || primaryErr.message?.toLowerCase().includes('denied')) {
        const err: any = new Error('Location permission denied in browser. Please tap "Allow" when prompted.');
        err.code = 1;
        throw err;
      }

      console.warn('[GPS] High-accuracy lock timed out or unavailable. Trying network coarse fallback...', primaryErr);

      // 3. Second attempt: Coarse Network Location (Cell Tower + Cached Wi-Fi, 60s maxAge)
      try {
        return await acquirePosition(false, 8000, 60000);
      } catch (fallbackErr: any) {
        if (fallbackErr.code === 1) {
          const err: any = new Error('Location permission denied in browser.');
          err.code = 1;
          throw err;
        }

        const msg =
          fallbackErr.code === 2
            ? 'GPS location signal unavailable. Please ensure Phone Location / GPS is turned ON.'
            : 'GPS satellite fix timed out. Please check signal or try again outdoors.';
        const finalErr: any = new Error(msg);
        finalErr.code = fallbackErr.code || 3;
        throw finalErr;
      }
    }
  }

  /**
   * Reverse-geocode coordinates to get human-readable location
   */
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
      // Fallback
      return {};
    }
  }

  /**
   * Build complete formatted address
   */
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

  /**
   * Generate Google Maps URL
   */
  public getMapsUrl(lat?: number, lng?: number): string {
    if (lat === undefined || lng === undefined) return '';
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}

export const locationService = new LocationService();
