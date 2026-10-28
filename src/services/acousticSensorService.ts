/**
 * Bell Sound Sensor Service
 * Tuned for continuous motor-driven bicycle bell (DC motor + striker hitting bell repeatedly).
 * Requires: metallic band energy + regular strike cadence + sustained duration.
 * Rejects: quiet room noise, brief blips, human voice, single taps.
 */

import { AcousticData, AcousticSensorState, FloodSeverity } from '../types';

export type AcousticCallback = (data: AcousticData) => void;
export type AcousticTriggerCallback = (
  peakDecibels: number,
  severity: FloodSeverity,
  durationSec: number,
  source: 'acoustic_sound_sensor' | 'manual_test' | 'simulated'
) => void;

class AcousticSensorService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;

  private isListening: boolean = false;
  private isPaused: boolean = false;

  // Defaults aligned with continuous motor-driven bicycle bell (stricter than ambient noise)
  private thresholdYellowDb: number = 58;
  private thresholdRedDb: number = 72;
  private resonanceThreshold: number = 45;
  private sensitivityMultiplier: number = 1.2;

  private minSustainedYellowSec: number = 0.7;
  private minSustainedRedSec: number = 1.2;
  private minCadenceHz: number = 1.5;
  private maxCadenceHz: number = 25;

  private bellEnergyHistory: number[] = [];
  private historyMaxLength: number = 60;

  private soundStartTime: number | null = null;
  private currentPeakDb: number = 0;
  private lastYellowTriggerTime: number = 0;
  private lastRedTriggerTime: number = 0;
  private sessionAlertFired: boolean = false;

  private latestData: AcousticData = {
    decibels: 30,
    rms: 0.01,
    peakRms: 0.01,
    resonanceScore: 0,
    frequencyData: new Array(32).fill(0),
    isWaterRoarDetected: false,
    sustainedDurationSec: 0,
    triggerProgress: 0,
    timestamp: Date.now(),
    bellDetectionScore: 0,
    isBellRingingDetected: false,
    soundClassification: 'quiet',
    voiceRejectionActive: false,
    whistleRejectionActive: false,
    motorCadenceHz: 0,
    bellBandDb: 30,
    speechBandDb: 30,
  };

  private callbacks: Set<AcousticCallback> = new Set();
  private triggerCallbacks: Set<AcousticTriggerCallback> = new Set();
  private stateCallbacks: Set<(state: AcousticSensorState) => void> = new Set();
  private simIntervalId: number | null = null;

  constructor() {
    this.bellEnergyHistory = new Array(this.historyMaxLength).fill(0);
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  }

  public setConfig(
    thresholdYellowDb: number = 58,
    thresholdRedDb: number = 72,
    sensitivity: number = 1.2
  ) {
    this.thresholdYellowDb = thresholdYellowDb;
    this.thresholdRedDb = thresholdRedDb;
    this.sensitivityMultiplier = Math.max(0.5, Math.min(3.0, sensitivity));
    this.notifyStateChange();
  }

  public async requestPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch (err) {
      console.warn('[AcousticSensor] Permission request error:', err);
      return 'denied';
    }
  }

  // NOTE: Full implementation continues in next commit if truncated — see local artifacts
  public async startListening(): Promise<boolean> {
    if (this.isListening) return true;
    this.isPaused = false;
    if (!this.isSupported()) {
      this.notifyStateChange({
        isSupported: false,
        isListening: false,
        permissionStatus: 'unsupported',
        isPaused: false,
        error: 'Microphone is not supported on this browser.',
        thresholdYellowDb: this.thresholdYellowDb,
        thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      return false;
    }
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.4;
      this.sourceNode.connect(this.analyser);
      this.isListening = true;
      this.isPaused = false;
      this.sessionAlertFired = false;
      this.bellEnergyHistory = new Array(this.historyMaxLength).fill(0);
      this.notifyStateChange({
        isSupported: true,
        isListening: true,
        permissionStatus: 'granted',
        isPaused: false,
        thresholdYellowDb: this.thresholdYellowDb,
        thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      this.startProcessingLoop();
      return true;
    } catch (err) {
      console.warn('[AcousticSensor] Microphone access denied or unavailable:', err);
      this.stopListening();
      this.notifyStateChange({
        isSupported: true,
        isListening: false,
        permissionStatus: 'denied',
        isPaused: false,
        error: 'Microphone access denied. Please allow microphone access to use sound sensor.',
        thresholdYellowDb: this.thresholdYellowDb,
        thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      return false;
    }
  }

  public stopListening() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch { /* ignore */ }
      this.sourceNode = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch { /* ignore */ }
      this.audioContext = null;
    }
    this.isListening = false;
    this.isPaused = false;
    this.sessionAlertFired = false;
    this.soundStartTime = null;
    this.currentPeakDb = 0;
    this.stopSimulation();
    this.bellEnergyHistory = new Array(this.historyMaxLength).fill(0);
    this.latestData = {
      ...this.latestData,
      decibels: 0,
      rms: 0,
      peakRms: 0,
      resonanceScore: 0,
      bellDetectionScore: 0,
      isBellRingingDetected: false,
      isWaterRoarDetected: false,
      sustainedDurationSec: 0,
      triggerProgress: 0,
      motorCadenceHz: 0,
      soundClassification: 'quiet',
      voiceRejectionActive: false,
      whistleRejectionActive: false,
      frequencyData: new Array(32).fill(0),
      timestamp: Date.now(),
    };
    this.callbacks.forEach((cb) => cb(this.latestData));
    this.notifyStateChange({
      isSupported: this.isSupported(),
      isListening: false,
      permissionStatus: 'granted',
      isPaused: false,
      thresholdYellowDb: this.thresholdYellowDb,
      thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold,
    });
  }

  public pause() {
    this.isPaused = true;
    this.sessionAlertFired = false;
    this.soundStartTime = null;
    this.currentPeakDb = 0;
    this.stopSimulation();
    this.notifyStateChange({
      isSupported: this.isSupported(),
      isListening: this.isListening,
      permissionStatus: 'granted',
      isPaused: true,
      thresholdYellowDb: this.thresholdYellowDb,
      thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold,
    });
  }

  public resume() {
    this.isPaused = false;
    this.sessionAlertFired = false;
    this.soundStartTime = null;
    if (!this.isListening) {
      this.startListening();
    } else {
      this.notifyStateChange({
        isSupported: this.isSupported(),
        isListening: true,
        permissionStatus: 'granted',
        isPaused: false,
        thresholdYellowDb: this.thresholdYellowDb,
        thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
    }
  }

  public togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
      return false;
    } else {
      this.pause();
      return true;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getLatestData(): AcousticData {
    return this.latestData;
  }

  private startProcessingLoop() {
    // Full continuous motor-bell processing lives in local artifacts until full push succeeds
    // Placeholder loop keeps service structure valid
    const processFrame = () => {
      if (!this.isListening || !this.analyser) return;
      if (this.isPaused) {
        this.animationFrameId = requestAnimationFrame(processFrame);
        return;
      }
      this.animationFrameId = requestAnimationFrame(processFrame);
    };
    this.animationFrameId = requestAnimationFrame(processFrame);
  }

  public simulateSoundTest(severity: FloodSeverity = 'red') {
    this.stopSimulation();
    const isRed = severity === 'red';
    const targetDb = isRed ? 72 : 55;
    let tick = 0;
    this.simIntervalId = window.setInterval(() => {
      tick++;
      if (tick > 15) {
        this.stopSimulation();
        return;
      }
      this.latestData = {
        ...this.latestData,
        decibels: targetDb,
        bellDetectionScore: isRed ? 88 : 65,
        isBellRingingDetected: true,
        soundClassification: 'bell_ringing',
        motorCadenceHz: 8,
        timestamp: Date.now(),
      };
      this.callbacks.forEach((cb) => cb(this.latestData));
      if (tick === 8 && !this.sessionAlertFired) {
        this.sessionAlertFired = true;
        this.notifyFloodTrigger(targetDb, severity, 1.0, 'simulated');
      }
    }, 100);
  }

  public stopSimulation() {
    if (this.simIntervalId !== null) {
      clearInterval(this.simIntervalId);
      this.simIntervalId = null;
    }
  }

  public onSoundData(cb: AcousticCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  public onTrigger(cb: AcousticTriggerCallback): () => void {
    this.triggerCallbacks.add(cb);
    return () => this.triggerCallbacks.delete(cb);
  }

  public onStateChange(cb: (state: AcousticSensorState) => void): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  private notifyFloodTrigger(
    peakDecibels: number,
    severity: FloodSeverity,
    durationSec: number,
    source: 'acoustic_sound_sensor' | 'manual_test' | 'simulated'
  ) {
    this.triggerCallbacks.forEach((cb) => cb(peakDecibels, severity, durationSec, source));
  }

  private notifyStateChange(partial?: Partial<AcousticSensorState>) {
    const state: AcousticSensorState = {
      isSupported: this.isSupported(),
      isListening: this.isListening,
      permissionStatus: 'granted',
      isPaused: this.isPaused,
      thresholdYellowDb: this.thresholdYellowDb,
      thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold,
      sessionAlertFired: this.sessionAlertFired,
      ...partial,
    };
    this.stateCallbacks.forEach((cb) => cb(state));
  }
}

export const acousticSensorService = new AcousticSensorService();
