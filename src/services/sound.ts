import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { SoundPack } from "../types/chess";

class ChessSoundManager {
  public enabled: boolean = true;
  public soundPack: SoundPack = "classic";
  private moveSound: Audio.Sound | null = null;
  private soundLoaded: boolean = false;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/move.mp3")
      );
      this.moveSound = sound;
      this.soundLoaded = true;
    } catch (e) {
      console.log("Audio init info:", e);
    }
  }

  async playMove() {
    if (!this.enabled) return;

    // Trigger haptic feedback
    try {
      Haptics.impactAsync(
        this.soundPack === "metallic"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    } catch (e) {
      // Haptics fallback
    }

    // Always synthesize or play according to soundPack
    if (this.soundPack === "classic" && this.moveSound && this.soundLoaded) {
      try {
        await this.moveSound.replayAsync();
        return;
      } catch (e) {
        // Fall back to synth
      }
    }

    this.playWebSynthMove(false);
  }

  playCapture() {
    if (!this.enabled) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    this.playWebSynthMove(true);
  }

  private playWebSynthMove(isCapture: boolean = false) {
    try {
      if (typeof window !== "undefined" && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        if (this.soundPack === "modern") {
          // Crisp, high-tech digital click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";

          const startFreq = isCapture ? 1200 : 960;
          const endFreq = isCapture ? 480 : 420;
          const duration = isCapture ? 0.07 : 0.05;

          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + duration);
        } else if (this.soundPack === "metallic") {
          // Heavy, resonant metallic clack
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "square";
          osc2.type = "sawtooth";

          const startFreq1 = isCapture ? 1100 : 800;
          const startFreq2 = isCapture ? 1650 : 1200;
          const duration = isCapture ? 0.11 : 0.08;

          osc1.frequency.setValueAtTime(startFreq1, now);
          osc1.frequency.exponentialRampToValueAtTime(200, now + duration);

          osc2.frequency.setValueAtTime(startFreq2, now);
          osc2.frequency.exponentialRampToValueAtTime(350, now + duration);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + duration);
          osc2.stop(now + duration);
        } else {
          // Classic warm wooden acoustic click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";

          const startFreq = isCapture ? 520 : 650;
          const endFreq = isCapture ? 140 : 180;
          const duration = isCapture ? 0.09 : 0.08;

          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + duration);
        }
      }
    } catch (e) {
      // Audio fallback
    }
  }

  playCheck() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {}
    this.playMove();
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
  }

  playDefeat() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}
  }

  playGameStart() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
  }

  playTimerTick() {
    if (!this.enabled) return;
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  }
}

export const soundManager = new ChessSoundManager();

