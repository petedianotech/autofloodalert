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
    decibels: 30, rms: 0.01, peakRms: 0.01, resonanceScore: 0,
    frequencyData: new Array(32).fill(0), isWaterRoarDetected: false,
    sustainedDurationSec: 0, triggerProgress: 0, timestamp: Date.now(),
    bellDetectionScore: 0, isBellRingingDetected: false, soundClassification: 'quiet',
    voiceRejectionActive: false, whistleRejectionActive: false, motorCadenceHz: 0,
    bellBandDb: 30, speechBandDb: 30,
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

  public setConfig(thresholdYellowDb: number = 58, thresholdRedDb: number = 72, sensitivity: number = 1.2) {
    this.thresholdYellowDb = thresholdYellowDb;
    this.thresholdRedDb = thresholdRedDb;
    this.sensitivityMultiplier = Math.max(0.5, Math.min(3.0, sensitivity));
    this.notifyStateChange();
  }

  public async requestPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      stream.getTracks().forEach((track) => track.stop());
      return 'granted';
    } catch (err) {
      console.warn('[AcousticSensor] Permission request error:', err);
      return 'denied';
    }
  }

  public async startListening(): Promise<boolean> {
    if (this.isListening) return true;
    this.isPaused = false;
    if (!this.isSupported()) {
      this.notifyStateChange({
        isSupported: false, isListening: false, permissionStatus: 'unsupported', isPaused: false,
        error: 'Microphone is not supported on this browser.',
        thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      return false;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') await this.audioContext.resume();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
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
        isSupported: true, isListening: true, permissionStatus: 'granted', isPaused: false,
        thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      this.startProcessingLoop();
      return true;
    } catch (err) {
      console.warn('[AcousticSensor] Microphone access denied or unavailable:', err);
      this.stopListening();
      this.notifyStateChange({
        isSupported: true, isListening: false, permissionStatus: 'denied', isPaused: false,
        error: 'Microphone access denied. Please allow microphone access to use sound sensor.',
        thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
        resonanceThreshold: this.resonanceThreshold,
      });
      return false;
    }
  }

  public stopListening() {
    if (this.animationFrameId !== null) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
    if (this.mediaStream) { this.mediaStream.getTracks().forEach((t) => t.stop()); this.mediaStream = null; }
    if (this.sourceNode) { try { this.sourceNode.disconnect(); } catch { /* ignore */ } this.sourceNode = null; }
    if (this.audioContext) { try { this.audioContext.close(); } catch { /* ignore */ } this.audioContext = null; }
    this.isListening = false;
    this.isPaused = false;
    this.sessionAlertFired = false;
    this.soundStartTime = null;
    this.currentPeakDb = 0;
    this.stopSimulation();
    this.bellEnergyHistory = new Array(this.historyMaxLength).fill(0);
    this.latestData = {
      ...this.latestData, decibels: 0, rms: 0, peakRms: 0, resonanceScore: 0, bellDetectionScore: 0,
      isBellRingingDetected: false, isWaterRoarDetected: false, sustainedDurationSec: 0, triggerProgress: 0,
      motorCadenceHz: 0, soundClassification: 'quiet', voiceRejectionActive: false, whistleRejectionActive: false,
      frequencyData: new Array(32).fill(0), timestamp: Date.now(),
    };
    this.callbacks.forEach((cb) => cb(this.latestData));
    this.notifyStateChange({
      isSupported: this.isSupported(), isListening: false, permissionStatus: 'granted', isPaused: false,
      thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
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
      isSupported: this.isSupported(), isListening: this.isListening, permissionStatus: 'granted', isPaused: true,
      thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold,
    });
  }

  public resume() {
    this.isPaused = false;
    this.sessionAlertFired = false;
    this.soundStartTime = null;
    if (!this.isListening) this.startListening();
    else this.notifyStateChange({
      isSupported: this.isSupported(), isListening: true, permissionStatus: 'granted', isPaused: false,
      thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold,
    });
  }

  public togglePause(): boolean {
    if (this.isPaused) { this.resume(); return false; }
    this.pause(); return true;
  }

  public getIsListening(): boolean { return this.isListening; }
  public getIsPaused(): boolean { return this.isPaused; }
  public getLatestData(): AcousticData { return this.latestData; }

  private startProcessingLoop() {
    const bufferLength = this.analyser?.frequencyBinCount || 512;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const processFrame = () => {
      if (!this.isListening || !this.analyser) return;
      if (this.isPaused) {
        this.animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      this.analyser.getByteTimeDomainData(timeData);
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const n = (timeData[i] - 128) / 128;
        sumSquares += n * n;
      }
      const rawRms = Math.sqrt(sumSquares / bufferLength);
      const rms = Math.min(1.0, rawRms * this.sensitivityMultiplier);
      let decibels = 30;
      if (rms > 0.001) {
        const dbfs = 20 * Math.log10(rms);
        decibels = Math.max(30, Math.min(105, Math.round(96 + dbfs * 1.12)));
      }

      this.analyser.getByteFrequencyData(freqData);
      const sampleRate = this.audioContext?.sampleRate || 44100;
      const binWidth = sampleRate / (bufferLength * 2);

      let speechEnergy = 0, speechBinCount = 0;
      let whistleEnergy = 0, whistleBinCount = 0;
      let bellPrimaryEnergy = 0, bellPrimaryBinCount = 0;

      for (let i = 0; i < bufferLength; i++) {
        const freq = i * binWidth;
        const val = freqData[i];
        if (freq >= 85 && freq <= 1200) { speechEnergy += val; speechBinCount++; }
        else if (freq > 1200 && freq <= 1900) { whistleEnergy += val; whistleBinCount++; }
        else if (freq >= 1600 && freq <= 5500) { bellPrimaryEnergy += val; bellPrimaryBinCount++; }
      }

      const avgSpeech = speechBinCount > 0 ? speechEnergy / speechBinCount : 0;
      const avgWhistle = whistleBinCount > 0 ? whistleEnergy / whistleBinCount : 0;
      const avgBellPrimary = bellPrimaryBinCount > 0 ? bellPrimaryEnergy / bellPrimaryBinCount : 0;
      const speechBandDb = Math.round(30 + (avgSpeech / 255) * 65);
      const bellBandDb = Math.round(30 + (avgBellPrimary / 255) * 75);

      this.bellEnergyHistory.push(avgBellPrimary);
      if (this.bellEnergyHistory.length > this.historyMaxLength) this.bellEnergyHistory.shift();

      let motorCadenceHz = 0;
      let strikePeakCount = 0;
      const histLen = this.bellEnergyHistory.length;
      if (histLen >= 15) {
        let mean = 0;
        for (let j = 0; j < histLen; j++) mean += this.bellEnergyHistory[j];
        mean /= histLen;
        for (let j = 1; j < histLen - 1; j++) {
          const prev = this.bellEnergyHistory[j - 1];
          const curr = this.bellEnergyHistory[j];
          const next = this.bellEnergyHistory[j + 1];
          if (curr > 20 && curr > prev && curr > next && curr > mean * 1.1) strikePeakCount++;
        }
        motorCadenceHz = Math.round((strikePeakCount / (histLen / 60)) * 10) / 10;
      }

      let soundClassification: AcousticData['soundClassification'] = 'quiet';
      let voiceRejectionActive = false;
      let whistleRejectionActive = false;
      let bellDetectionScore = 0;

      const cadenceInMotorRange = motorCadenceHz >= this.minCadenceHz && motorCadenceHz <= this.maxCadenceHz;
      const hasStrikeRhythm = strikePeakCount >= 3 && cadenceInMotorRange;

      if (decibels < 42 && avgBellPrimary < 12 && avgSpeech < 12) {
        soundClassification = 'quiet';
        bellDetectionScore = 0;
      } else if (avgSpeech > 32 && avgSpeech > avgBellPrimary * 1.6) {
        soundClassification = 'human_voice';
        voiceRejectionActive = true;
        bellDetectionScore = Math.max(0, Math.round((avgBellPrimary / (avgSpeech + 1)) * 25));
      } else if (avgWhistle > 48 && avgWhistle > avgBellPrimary * 2.0) {
        soundClassification = 'whistle';
        whistleRejectionActive = true;
        bellDetectionScore = 0;
      } else if (avgBellPrimary >= 22 && hasStrikeRhythm) {
        const ratio = avgBellPrimary / (avgSpeech + 1);
        const cadenceBoost = Math.min(1.35, 0.85 + motorCadenceHz / 30);
        const baseScore = Math.min(100, Math.round((avgBellPrimary / 255) * 90 * Math.min(2.2, Math.max(0.9, ratio)) * cadenceBoost));
        bellDetectionScore = Math.min(100, Math.max(40, baseScore));
        soundClassification = 'bell_ringing';
      } else if (avgBellPrimary >= 28 && decibels >= 50) {
        bellDetectionScore = Math.min(55, Math.round((avgBellPrimary / 255) * 60));
        soundClassification = decibels > 55 ? 'ambient_noise' : 'quiet';
      } else {
        soundClassification = decibels > 48 ? 'ambient_noise' : 'quiet';
        bellDetectionScore = Math.max(0, Math.round((avgBellPrimary / 255) * 35));
      }

      const visualBarsCount = 32;
      const step = Math.floor(bufferLength / visualBarsCount);
      const visualBins: number[] = [];
      for (let b = 0; b < visualBarsCount; b++) {
        let barSum = 0;
        for (let s = 0; s < step; s++) barSum += freqData[b * step + s] || 0;
        visualBins.push(Math.round(barSum / step));
      }

      const isBellRingingDetected =
        bellDetectionScore >= this.resonanceThreshold &&
        hasStrikeRhythm &&
        !voiceRejectionActive &&
        !whistleRejectionActive &&
        (bellBandDb >= this.thresholdYellowDb - 8 || decibels >= this.thresholdYellowDb - 5);

      const now = Date.now();
      let sustainedSec = 0;
      let triggerProgress = 0;

      const yellowCandidate =
        isBellRingingDetected &&
        (decibels >= this.thresholdYellowDb || bellBandDb >= this.thresholdYellowDb - 5) &&
        bellDetectionScore >= this.resonanceThreshold;
      const redCandidate =
        isBellRingingDetected &&
        (decibels >= this.thresholdRedDb || bellBandDb >= this.thresholdRedDb - 5) &&
        bellDetectionScore >= this.resonanceThreshold + 10;

      if (yellowCandidate || redCandidate) {
        if (this.soundStartTime === null) {
          this.soundStartTime = now;
          this.currentPeakDb = decibels;
        } else {
          this.currentPeakDb = Math.max(this.currentPeakDb, decibels);
        }
        sustainedSec = (now - this.soundStartTime) / 1000;
        triggerProgress = Math.min(1.0, sustainedSec / (redCandidate ? this.minSustainedRedSec : this.minSustainedYellowSec));
      } else if (this.soundStartTime !== null) {
        if ((now - this.soundStartTime) / 1000 >= 0.35) {
          this.soundStartTime = null;
          this.currentPeakDb = 0;
        }
      }

      const isAboveYellow = yellowCandidate && sustainedSec >= this.minSustainedYellowSec;
      const isAboveRed = redCandidate && sustainedSec >= this.minSustainedRedSec;

      if (isAboveRed && !voiceRejectionActive) {
        if (!this.sessionAlertFired) {
          this.sessionAlertFired = true;
          this.lastRedTriggerTime = now;
          this.lastYellowTriggerTime = now;
          this.notifyFloodTrigger(decibels, 'red', Math.max(0.2, sustainedSec), 'acoustic_sound_sensor');
          this.notifyStateChange({ sessionAlertFired: true });
        }
      } else if (isAboveYellow && !voiceRejectionActive) {
        if (!this.sessionAlertFired) {
          this.sessionAlertFired = true;
          this.lastYellowTriggerTime = now;
          this.notifyFloodTrigger(decibels, 'yellow', Math.max(0.2, sustainedSec), 'acoustic_sound_sensor');
          this.notifyStateChange({ sessionAlertFired: true });
        }
      }

      this.latestData = {
        decibels, rms, peakRms: rms, resonanceScore: bellDetectionScore, frequencyData: visualBins,
        isWaterRoarDetected: isBellRingingDetected, sustainedDurationSec: sustainedSec, triggerProgress,
        timestamp: now, bellDetectionScore, isBellRingingDetected, soundClassification,
        voiceRejectionActive, whistleRejectionActive, motorCadenceHz, bellBandDb, speechBandDb,
      };
      this.callbacks.forEach((cb) => cb(this.latestData));
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
      if (tick > 15) { this.stopSimulation(); return; }
      this.latestData = {
        ...this.latestData, decibels: targetDb, bellDetectionScore: isRed ? 88 : 65,
        isBellRingingDetected: true, soundClassification: 'bell_ringing', motorCadenceHz: 8, timestamp: Date.now(),
      };
      this.callbacks.forEach((cb) => cb(this.latestData));
      if (tick === 8 && !this.sessionAlertFired) {
        this.sessionAlertFired = true;
        this.notifyFloodTrigger(targetDb, severity, 1.0, 'simulated');
      }
    }, 100);
  }

  public stopSimulation() {
    if (this.simIntervalId !== null) { clearInterval(this.simIntervalId); this.simIntervalId = null; }
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
    peakDecibels: number, severity: FloodSeverity, durationSec: number,
    source: 'acoustic_sound_sensor' | 'manual_test' | 'simulated'
  ) {
    this.triggerCallbacks.forEach((cb) => cb(peakDecibels, severity, durationSec, source));
  }

  private notifyStateChange(partial?: Partial<AcousticSensorState>) {
    const state: AcousticSensorState = {
      isSupported: this.isSupported(), isListening: this.isListening, permissionStatus: 'granted',
      isPaused: this.isPaused, thresholdYellowDb: this.thresholdYellowDb, thresholdRedDb: this.thresholdRedDb,
      resonanceThreshold: this.resonanceThreshold, sessionAlertFired: this.sessionAlertFired, ...partial,
    };
    this.stateCallbacks.forEach((cb) => cb(state));
  }
}

export const acousticSensorService = new AcousticSensorService();
