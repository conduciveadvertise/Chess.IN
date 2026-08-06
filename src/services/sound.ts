import { Platform } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { SoundPack } from "../types/chess";

const isHapticsAvailable = Platform.OS !== "web";

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
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(
          this.soundPack === "metallic"
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light
        );
      } catch (e) {
        // Haptics fallback
      }
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

    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {}
    }

    this.playWebSynthMove(true);
  }

  private playWebSynthMove(isCapture: boolean = false) {
    // WebAudio is not supported in React Native environment.
    // Audio is handled natively via sound assets and haptics.
  }

  playCheck() {
    if (!this.enabled) return;
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (e) {}
    }
    this.playMove();
  }

  playVictory() {
    if (!this.enabled) return;
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
  }

  playDefeat() {
    if (!this.enabled) return;
    if (isHapticsAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {}
    }
  }

  playGameStart() {
    if (!this.enabled) return;
    if (isHapticsAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {}
    }
  }

  playTimerTick() {
    if (!this.enabled) return;
    if (isHapticsAvailable) {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    }
  }
}

export const soundManager = new ChessSoundManager();

