import { MatchAudioEvent, ProjectileVisualStyle } from "../types";
import { loadAudioEnabledPreference, saveAudioEnabledPreference } from "./preferences";

type AudioEnabledListener = (enabled: boolean) => void;
type OscillatorKind = OscillatorType;

interface ToneConfig {
  startAt: number;
  duration: number;
  frequency: number;
  endFrequency?: number;
  type: OscillatorKind;
  volume: number;
  filterType?: BiquadFilterType;
  filterFrequency: number;
  attack?: number;
  decayPoint?: number;
}

interface NoiseConfig {
  startAt: number;
  duration: number;
  volume: number;
  filterType: BiquadFilterType;
  filterFrequency: number;
  q?: number;
}

interface MusicBar {
  chord: readonly number[];
  bass: readonly number[];
  melody: readonly number[];
}

const MASTER_GAIN_LEVEL = 0.82;
const MUSIC_GAIN_LEVEL = 0.18;
const SFX_GAIN_LEVEL = 0.16;
const BATTLE_TEMPO = 84;
const BEAT_DURATION = 60 / BATTLE_TEMPO;
const BAR_DURATION = BEAT_DURATION * 4;
const BATTLE_LOOP_DURATION = BAR_DURATION * 4;

// D minor -> Bb -> F -> C. Kept intentionally diatonic and simple so the
// loop reads heroic instead of clever.
const BATTLE_SCORE: MusicBar[] = [
  {
    chord: [50, 57, 62, 65],
    bass: [38, 45, 50, 45],
    melody: [74, 77, 79, 77],
  },
  {
    chord: [46, 53, 58, 62],
    bass: [34, 41, 46, 41],
    melody: [74, 77, 74, 72],
  },
  {
    chord: [53, 60, 65, 69],
    bass: [41, 48, 53, 48],
    melody: [77, 79, 81, 79],
  },
  {
    chord: [48, 55, 60, 64],
    bass: [36, 43, 48, 43],
    melody: [76, 74, 72, 74],
  },
];

class AudioController {
  private enabled = loadAudioEnabledPreference();
  private unlocked = false;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private battleMusicRequested = false;
  private battleLoopTimer: number | null = null;
  private nextBattleLoopAt = 0;
  private listeners = new Set<AudioEnabledListener>();

  isEnabled(): boolean {
    return this.enabled;
  }

  subscribe(listener: AudioEnabledListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async unlock(): Promise<void> {
    const context = this.ensureContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    this.unlocked = context.state === "running";
    this.syncGainTargets();
    if (this.enabled && this.battleMusicRequested) {
      this.ensureBattleMusicScheduler();
    }
  }

  toggleEnabled(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    saveAudioEnabledPreference(enabled);
    this.syncGainTargets();

    if (enabled && this.unlocked && this.battleMusicRequested) {
      this.ensureBattleMusicScheduler();
    }

    if (!enabled) {
      this.stopBattleMusicScheduler();
    }

    for (const listener of this.listeners) {
      listener(this.enabled);
    }
  }

  startBattleMusic(): void {
    this.battleMusicRequested = true;
    this.syncGainTargets();

    if (this.enabled && this.unlocked) {
      this.ensureBattleMusicScheduler();
    }
  }

  stopBattleMusic(): void {
    this.battleMusicRequested = false;
    this.stopBattleMusicScheduler();
    this.syncGainTargets();
  }

  playUiClick(): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      this.playTone(context, output, {
        startAt,
        duration: 0.09,
        frequency: midiToFrequency(84),
        type: "triangle",
        volume: 0.012,
        filterFrequency: 2100,
        attack: 0.005,
        decayPoint: 0.3,
      });
      this.playTone(context, output, {
        startAt: startAt + 0.012,
        duration: 0.06,
        frequency: midiToFrequency(91),
        type: "sine",
        volume: 0.008,
        filterFrequency: 2600,
        attack: 0.004,
        decayPoint: 0.25,
      });
    });
  }

  playResultSting(victory: boolean): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      const notes = victory ? [74, 77, 81] : [69, 65, 62];

      notes.forEach((note, index) => {
        this.playTone(context, output, {
          startAt: startAt + index * 0.11,
          duration: 0.42,
          frequency: midiToFrequency(note),
          type: victory ? "triangle" : "sine",
          volume: victory ? 0.018 : 0.015,
          filterFrequency: victory ? 1700 : 1200,
          attack: 0.02,
          decayPoint: 0.4,
        });
      });
    });
  }

  playMatchAudioEvent(event: MatchAudioEvent): void {
    switch (event.type) {
      case "projectile-launch":
        this.playProjectileLaunch(event.visualStyle ?? "stone");
        return;
      case "projectile-impact":
        this.playProjectileImpact(event.visualStyle ?? "stone");
        return;
      case "entity-hit":
        this.playMeleeHit();
        return;
      case "entity-death":
        this.playEntityDeath();
        return;
      case "super-cast":
        this.playSuperCast(event.visualStyle ?? "meteor");
        return;
      case "base-hit":
        this.playBaseHit();
        return;
      case "base-destroyed":
        this.playBaseDestroyed();
        return;
    }
  }

  private playProjectileLaunch(style: ProjectileVisualStyle): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;

      if (style === "arrow" || style === "bolt") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.08,
          volume: 0.006,
          filterType: "bandpass",
          filterFrequency: 1800,
          q: 2.5,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.08,
          frequency: midiToFrequency(81),
          type: "triangle",
          volume: 0.007,
          filterFrequency: 1900,
          attack: 0.003,
          decayPoint: 0.25,
        });
        return;
      }

      if (style === "bullet") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.04,
          volume: 0.008,
          filterType: "highpass",
          filterFrequency: 2800,
          q: 1.5,
        });
        return;
      }

      if (style === "plasma" || style === "laser") {
        this.playTone(context, output, {
          startAt,
          duration: 0.11,
          frequency: midiToFrequency(88),
          type: "sine",
          volume: 0.01,
          filterFrequency: 2200,
          attack: 0.01,
          decayPoint: 0.35,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.08,
          frequency: midiToFrequency(95),
          type: "triangle",
          volume: 0.005,
          filterFrequency: 2600,
          attack: 0.008,
          decayPoint: 0.25,
        });
        return;
      }

      if (style === "rocket" || style === "bomb" || style === "meteor") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.1,
          volume: 0.009,
          filterType: "bandpass",
          filterFrequency: 900,
          q: 1.2,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.12,
          frequency: midiToFrequency(52),
          endFrequency: midiToFrequency(57),
          type: "sine",
          volume: 0.008,
          filterFrequency: 900,
          attack: 0.008,
          decayPoint: 0.35,
        });
        return;
      }

      if (style === "ember" || style === "flask") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.08,
          volume: 0.007,
          filterType: "bandpass",
          filterFrequency: 1400,
          q: 1.8,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.08,
          frequency: midiToFrequency(72),
          type: "triangle",
          volume: 0.005,
          filterFrequency: 1300,
          attack: 0.006,
          decayPoint: 0.3,
        });
        return;
      }

      this.playTone(context, output, {
        startAt,
        duration: 0.1,
        frequency: midiToFrequency(57),
        type: "triangle",
        volume: 0.008,
        filterFrequency: 950,
        attack: 0.01,
        decayPoint: 0.35,
      });
    });
  }

  private playProjectileImpact(style: ProjectileVisualStyle): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;

      if (style === "arrow" || style === "bolt" || style === "bullet") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.05,
          volume: 0.009,
          filterType: "highpass",
          filterFrequency: 2300,
          q: 2,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.05,
          frequency: midiToFrequency(79),
          type: "triangle",
          volume: 0.005,
          filterFrequency: 1800,
          attack: 0.003,
          decayPoint: 0.2,
        });
        return;
      }

      if (style === "plasma" || style === "laser") {
        this.playTone(context, output, {
          startAt,
          duration: 0.13,
          frequency: midiToFrequency(83),
          type: "sine",
          volume: 0.011,
          filterFrequency: 2100,
          attack: 0.01,
          decayPoint: 0.35,
        });
        this.playNoise(context, output, {
          startAt,
          duration: 0.05,
          volume: 0.004,
          filterType: "highpass",
          filterFrequency: 3000,
          q: 1.6,
        });
        return;
      }

      if (style === "rocket" || style === "bomb" || style === "meteor") {
        this.playTone(context, output, {
          startAt,
          duration: 0.18,
          frequency: midiToFrequency(45),
          endFrequency: midiToFrequency(33),
          type: "sine",
          volume: 0.013,
          filterFrequency: 750,
          attack: 0.004,
          decayPoint: 0.28,
        });
        this.playNoise(context, output, {
          startAt,
          duration: 0.16,
          volume: 0.009,
          filterType: "bandpass",
          filterFrequency: 850,
          q: 1.1,
        });
        return;
      }

      if (style === "ember" || style === "flask") {
        this.playNoise(context, output, {
          startAt,
          duration: 0.08,
          volume: 0.008,
          filterType: "bandpass",
          filterFrequency: 1350,
          q: 1.5,
        });
        this.playTone(context, output, {
          startAt,
          duration: 0.08,
          frequency: midiToFrequency(67),
          type: "sine",
          volume: 0.006,
          filterFrequency: 1200,
          attack: 0.004,
          decayPoint: 0.25,
        });
        return;
      }

      this.playTone(context, output, {
        startAt,
        duration: 0.12,
        frequency: midiToFrequency(52),
        endFrequency: midiToFrequency(43),
        type: "triangle",
        volume: 0.011,
        filterFrequency: 850,
        attack: 0.006,
        decayPoint: 0.3,
      });
      this.playNoise(context, output, {
        startAt,
        duration: 0.06,
        volume: 0.005,
        filterType: "bandpass",
        filterFrequency: 1000,
        q: 1.3,
      });
    });
  }

  private playMeleeHit(): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      this.playTone(context, output, {
        startAt,
        duration: 0.08,
        frequency: midiToFrequency(55),
        endFrequency: midiToFrequency(48),
        type: "triangle",
        volume: 0.012,
        filterFrequency: 900,
        attack: 0.004,
        decayPoint: 0.25,
      });
      this.playNoise(context, output, {
        startAt,
        duration: 0.05,
        volume: 0.005,
        filterType: "bandpass",
        filterFrequency: 1100,
        q: 1.4,
      });
    });
  }

  private playEntityDeath(): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      this.playTone(context, output, {
        startAt,
        duration: 0.22,
        frequency: midiToFrequency(60),
        endFrequency: midiToFrequency(41),
        type: "sine",
        volume: 0.011,
        filterFrequency: 900,
        attack: 0.01,
        decayPoint: 0.35,
      });
      this.playNoise(context, output, {
        startAt,
        duration: 0.14,
        volume: 0.005,
        filterType: "bandpass",
        filterFrequency: 850,
        q: 1.2,
      });
    });
  }

  private playSuperCast(style: ProjectileVisualStyle): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      const notes =
        style === "plasma" || style === "laser"
          ? [79, 83]
          : style === "bomb" || style === "rocket"
            ? [67, 71]
            : [72, 76];

      notes.forEach((note, index) => {
        this.playTone(context, output, {
          startAt: startAt + index * 0.09,
          duration: 0.24,
          frequency: midiToFrequency(note),
          type: style === "plasma" || style === "laser" ? "triangle" : "sine",
          volume: 0.013,
          filterFrequency: style === "plasma" || style === "laser" ? 1900 : 1300,
          attack: 0.02,
          decayPoint: 0.4,
        });
      });

      this.playTone(context, output, {
        startAt,
        duration: 0.18,
        frequency: midiToFrequency(style === "bomb" || style === "rocket" ? 48 : 55),
        endFrequency: midiToFrequency(style === "bomb" || style === "rocket" ? 43 : 52),
        type: "sine",
        volume: 0.008,
        filterFrequency: 900,
        attack: 0.015,
        decayPoint: 0.35,
      });
    });
  }

  private playBaseHit(): void {
    this.withSfx((context, output) => {
      this.playTone(context, output, {
        startAt: context.currentTime,
        duration: 0.14,
        frequency: midiToFrequency(43),
        endFrequency: midiToFrequency(36),
        type: "sine",
        volume: 0.012,
        filterFrequency: 700,
        attack: 0.006,
        decayPoint: 0.25,
      });
    });
  }

  private playBaseDestroyed(): void {
    this.withSfx((context, output) => {
      const startAt = context.currentTime;
      this.playTone(context, output, {
        startAt,
        duration: 0.26,
        frequency: midiToFrequency(40),
        endFrequency: midiToFrequency(31),
        type: "sine",
        volume: 0.016,
        filterFrequency: 650,
        attack: 0.008,
        decayPoint: 0.28,
      });
      this.playNoise(context, output, {
        startAt,
        duration: 0.18,
        volume: 0.006,
        filterType: "bandpass",
        filterFrequency: 780,
        q: 1,
      });
    });
  }

  private withSfx(callback: (context: AudioContext, output: GainNode) => void): void {
    const context = this.ensureContext();
    const output = this.sfxGain;
    if (!context || !output || !this.unlocked || !this.enabled) {
      return;
    }

    callback(context, output);
  }

  private ensureBattleMusicScheduler(): void {
    const context = this.ensureContext();
    if (!context || !this.musicGain || !this.unlocked || !this.enabled || !this.battleMusicRequested) {
      return;
    }

    if (this.nextBattleLoopAt < context.currentTime + 0.1) {
      this.nextBattleLoopAt = context.currentTime + 0.12;
    }

    while (this.nextBattleLoopAt < context.currentTime + BATTLE_LOOP_DURATION * 0.7) {
      this.scheduleBattleLoop(this.nextBattleLoopAt);
      this.nextBattleLoopAt += BATTLE_LOOP_DURATION;
    }

    if (this.battleLoopTimer !== null) {
      return;
    }

    this.battleLoopTimer = window.setInterval(() => {
      if (!this.enabled || !this.unlocked || !this.battleMusicRequested) {
        return;
      }

      const liveContext = this.ensureContext();
      if (!liveContext) {
        return;
      }

      while (this.nextBattleLoopAt < liveContext.currentTime + BATTLE_LOOP_DURATION * 0.7) {
        this.scheduleBattleLoop(this.nextBattleLoopAt);
        this.nextBattleLoopAt += BATTLE_LOOP_DURATION;
      }
    }, 1000);
  }

  private stopBattleMusicScheduler(): void {
    if (this.battleLoopTimer !== null) {
      window.clearInterval(this.battleLoopTimer);
      this.battleLoopTimer = null;
    }

    this.nextBattleLoopAt = 0;
  }

  private scheduleBattleLoop(startAt: number): void {
    const context = this.audioContext;
    const output = this.musicGain;
    if (!context || !output) {
      return;
    }

    BATTLE_SCORE.forEach((bar, barIndex) => {
      const barStart = startAt + barIndex * BAR_DURATION;
      this.playPadChord(context, output, barStart, bar.chord, BAR_DURATION * 0.98);

      bar.bass.forEach((note, beatIndex) => {
        this.playBassPulse(context, output, barStart + beatIndex * BEAT_DURATION, note);
      });

      this.playDrumPulse(context, output, barStart, 42, 0.008);
      this.playDrumPulse(context, output, barStart + BEAT_DURATION * 2, 45, 0.007);
      this.playBrush(context, output, barStart + BEAT_DURATION, 0.003);
      this.playBrush(context, output, barStart + BEAT_DURATION * 3, 0.003);

      bar.melody.forEach((note, beatIndex) => {
        this.playLeadNote(context, output, barStart + beatIndex * BEAT_DURATION + 0.08, note);
      });
    });
  }

  private playPadChord(
    context: AudioContext,
    output: GainNode,
    startAt: number,
    notes: readonly number[],
    duration: number,
  ): void {
    notes.forEach((note, index) => {
      this.playTone(context, output, {
        startAt,
        duration,
        frequency: midiToFrequency(note),
        type: index < 2 ? "sine" : "triangle",
        volume: index === 0 ? 0.005 : index === 1 ? 0.0055 : 0.0065,
        filterFrequency: 900 + index * 140,
        attack: 0.09,
        decayPoint: 0.55,
      });
    });
  }

  private playBassPulse(context: AudioContext, output: GainNode, startAt: number, midi: number): void {
    this.playTone(context, output, {
      startAt,
      duration: BEAT_DURATION * 0.9,
      frequency: midiToFrequency(midi),
      endFrequency: midiToFrequency(midi - 1),
      type: "triangle",
      volume: 0.011,
      filterFrequency: 450,
      attack: 0.02,
      decayPoint: 0.35,
    });
  }

  private playLeadNote(context: AudioContext, output: GainNode, startAt: number, midi: number): void {
    this.playTone(context, output, {
      startAt,
      duration: BEAT_DURATION * 0.62,
      frequency: midiToFrequency(midi),
      type: "triangle",
      volume: 0.009,
      filterFrequency: 1500,
      attack: 0.02,
      decayPoint: 0.35,
    });
  }

  private playDrumPulse(
    context: AudioContext,
    output: GainNode,
    startAt: number,
    midi: number,
    volume: number,
  ): void {
    this.playTone(context, output, {
      startAt,
      duration: 0.18,
      frequency: midiToFrequency(midi),
      endFrequency: midiToFrequency(midi - 12),
      type: "sine",
      volume,
      filterFrequency: 380,
      attack: 0.004,
      decayPoint: 0.25,
    });
  }

  private playBrush(context: AudioContext, output: GainNode, startAt: number, volume: number): void {
    this.playNoise(context, output, {
      startAt,
      duration: 0.07,
      volume,
      filterType: "highpass",
      filterFrequency: 2200,
      q: 1.4,
    });
  }

  private playTone(context: AudioContext, output: GainNode, config: ToneConfig): void {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const attack = config.attack ?? 0.006;
    const decayPoint = config.decayPoint ?? 0.35;

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, config.startAt);
    if (config.endFrequency && config.endFrequency > 0) {
      oscillator.frequency.exponentialRampToValueAtTime(config.endFrequency, config.startAt + config.duration);
    }

    filter.type = config.filterType ?? "lowpass";
    filter.frequency.setValueAtTime(config.filterFrequency, config.startAt);
    filter.Q.setValueAtTime(0.8, config.startAt);

    gain.gain.setValueAtTime(0.0001, config.startAt);
    gain.gain.exponentialRampToValueAtTime(config.volume, config.startAt + attack);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, config.volume * 0.45),
      config.startAt + config.duration * decayPoint,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, config.startAt + config.duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    oscillator.start(config.startAt);
    oscillator.stop(config.startAt + config.duration + 0.04);
  }

  private playNoise(context: AudioContext, output: GainNode, config: NoiseConfig): void {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.ensureNoiseBuffer(context);
    filter.type = config.filterType;
    filter.frequency.setValueAtTime(config.filterFrequency, config.startAt);
    filter.Q.setValueAtTime(config.q ?? 0.8, config.startAt);

    gain.gain.setValueAtTime(0.0001, config.startAt);
    gain.gain.exponentialRampToValueAtTime(config.volume, config.startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, config.startAt + config.duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    source.start(config.startAt);
    source.stop(config.startAt + config.duration + 0.04);
  }

  private ensureNoiseBuffer(context: AudioContext): AudioBuffer {
    if (this.noiseBuffer) {
      return this.noiseBuffer;
    }

    const frameCount = Math.floor(context.sampleRate * 0.8);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);

    let previous = 0;
    for (let index = 0; index < frameCount; index += 1) {
      previous = (previous + (Math.random() * 2 - 1)) * 0.55;
      channel[index] = previous * (1 - index / frameCount);
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  private ensureContext(): AudioContext | null {
    if (this.audioContext) {
      return this.audioContext;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext
      || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    const context = new AudioContextCtor();
    const masterGain = context.createGain();
    const musicGain = context.createGain();
    const sfxGain = context.createGain();
    const compressor = context.createDynamicsCompressor();

    masterGain.gain.value = this.enabled ? MASTER_GAIN_LEVEL : 0.0001;
    musicGain.gain.value = 0.0001;
    sfxGain.gain.value = this.enabled ? SFX_GAIN_LEVEL : 0.0001;

    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    compressor.threshold.setValueAtTime(-22, context.currentTime);
    compressor.knee.setValueAtTime(18, context.currentTime);
    compressor.ratio.setValueAtTime(4, context.currentTime);
    compressor.attack.setValueAtTime(0.01, context.currentTime);
    compressor.release.setValueAtTime(0.18, context.currentTime);

    this.audioContext = context;
    this.masterGain = masterGain;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;
    this.syncGainTargets();
    return context;
  }

  private syncGainTargets(): void {
    const context = this.audioContext;
    const masterGain = this.masterGain;
    const musicGain = this.musicGain;
    const sfxGain = this.sfxGain;
    if (!context || !masterGain || !musicGain || !sfxGain) {
      return;
    }

    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    musicGain.gain.cancelScheduledValues(now);
    sfxGain.gain.cancelScheduledValues(now);

    masterGain.gain.setTargetAtTime(this.enabled ? MASTER_GAIN_LEVEL : 0.0001, now, 0.04);
    sfxGain.gain.setTargetAtTime(this.enabled ? SFX_GAIN_LEVEL : 0.0001, now, 0.04);
    musicGain.gain.setTargetAtTime(
      this.enabled && this.battleMusicRequested ? MUSIC_GAIN_LEVEL : 0.0001,
      now,
      this.battleMusicRequested ? 0.22 : 0.06,
    );
  }
}

function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export const audioController = new AudioController();
