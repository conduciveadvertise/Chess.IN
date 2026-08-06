import offlinePuzzlesData from "../data/puzzles.json";
import { PuzzleRecord } from "../types/learning";

const STORAGE_KEYS = {
  BEST_SCORE: "chess_in_puzzle_rush_best_score",
  BEST_STREAK: "chess_in_puzzle_rush_best_streak",
  LIVES: "chess_in_puzzle_rush_lives",
  LAST_REGEN: "chess_in_puzzle_rush_last_regen",
  TOTAL_SOLVED: "chess_in_puzzle_rush_total_solved",
  TOTAL_PLAYED: "chess_in_puzzle_rush_total_played",
};

export const MAX_LIVES = 3;
export const REFILL_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes in ms = 900,000ms

export interface LivesInfo {
  lives: number;
  maxLives: number;
  nextRefillSeconds: number; // Seconds remaining until next life restores
  timeUntilFullSeconds: number; // Seconds remaining until all 3 lives restore
}

export interface PuzzleRushStats {
  bestScore: number;
  bestStreak: number;
  totalSolved: number;
  totalPlayed: number;
}

/**
 * Service to manage offline Puzzle Rush data, stamina lives, and difficulty-tiered puzzle selection
 */
export class PuzzleRushService {
  /**
   * Get current lives state and calculate automatic regeneration based on local timestamp
   */
  static getLivesInfo(): LivesInfo {
    const now = Date.now();
    let lives = MAX_LIVES;
    let lastRegen = now;

    try {
      if (typeof localStorage !== "undefined") {
        const storedLives = localStorage.getItem(STORAGE_KEYS.LIVES);
        const storedLastRegen = localStorage.getItem(STORAGE_KEYS.LAST_REGEN);

        if (storedLives !== null) {
          lives = parseInt(storedLives, 10);
          if (isNaN(lives)) lives = MAX_LIVES;
        }

        if (storedLastRegen !== null) {
          lastRegen = parseInt(storedLastRegen, 10);
          if (isNaN(lastRegen)) lastRegen = now;
        } else {
          lastRegen = now;
        }
      }
    } catch (e) {
      console.error("Storage read error", e);
    }

    // If lives < MAX_LIVES, check how many 15-minute intervals passed
    if (lives < MAX_LIVES) {
      const elapsed = now - lastRegen;
      const livesGained = Math.floor(elapsed / REFILL_INTERVAL_MS);

      if (livesGained > 0) {
        lives = Math.min(MAX_LIVES, lives + livesGained);
        // Advance lastRegen timestamp by the time corresponding to lives restored
        lastRegen = lastRegen + livesGained * REFILL_INTERVAL_MS;
        if (lives >= MAX_LIVES) {
          lastRegen = now;
        }
        this.saveLives(lives, lastRegen);
      }
    } else {
      lastRegen = now;
    }

    // Calculate countdowns
    let nextRefillSeconds = 0;
    let timeUntilFullSeconds = 0;

    if (lives < MAX_LIVES) {
      const elapsedInCurrentInterval = (now - lastRegen) % REFILL_INTERVAL_MS;
      const msToNext = REFILL_INTERVAL_MS - elapsedInCurrentInterval;
      nextRefillSeconds = Math.max(1, Math.ceil(msToNext / 1000));

      const livesNeeded = MAX_LIVES - lives;
      timeUntilFullSeconds = Math.max(
        1,
        Math.ceil((msToNext + (livesNeeded - 1) * REFILL_INTERVAL_MS) / 1000)
      );
    }

    return {
      lives,
      maxLives: MAX_LIVES,
      nextRefillSeconds,
      timeUntilFullSeconds,
    };
  }

  /**
   * Consume 1 stamina life when starting a run
   */
  static consumeLife(): boolean {
    const info = this.getLivesInfo();
    if (info.lives <= 0) {
      return false;
    }

    const newLives = info.lives - 1;
    const now = Date.now();
    // If we were at max lives, start the regen timer now
    let lastRegen = now;
    try {
      if (typeof localStorage !== "undefined") {
        const storedLastRegen = localStorage.getItem(STORAGE_KEYS.LAST_REGEN);
        if (info.lives < MAX_LIVES && storedLastRegen) {
          lastRegen = parseInt(storedLastRegen, 10) || now;
        }
      }
    } catch (e) {}

    this.saveLives(newLives, lastRegen);
    return true;
  }

  /**
   * Save current lives and last regen timestamp to localStorage
   */
  private static saveLives(lives: number, lastRegen: number) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.LIVES, String(lives));
        localStorage.setItem(STORAGE_KEYS.LAST_REGEN, String(lastRegen));
      }
    } catch (e) {
      console.error("Storage write error", e);
    }
  }

  /**
   * Get all persistent Puzzle Rush statistics
   */
  static getStats(): PuzzleRushStats {
    let bestScore = 0;
    let bestStreak = 0;
    let totalSolved = 0;
    let totalPlayed = 0;

    try {
      if (typeof localStorage !== "undefined") {
        bestScore = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || "0", 10);
        bestStreak = parseInt(localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || "0", 10);
        totalSolved = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_SOLVED) || "0", 10);
        totalPlayed = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_PLAYED) || "0", 10);
      }
    } catch (e) {}

    return {
      bestScore: isNaN(bestScore) ? 0 : bestScore,
      bestStreak: isNaN(bestStreak) ? 0 : bestStreak,
      totalSolved: isNaN(totalSolved) ? 0 : totalSolved,
      totalPlayed: isNaN(totalPlayed) ? 0 : totalPlayed,
    };
  }

  /**
   * Record completed run statistics
   */
  static saveRunStats(score: number, maxStreakInRun: number) {
    const stats = this.getStats();
    const newBestScore = Math.max(stats.bestScore, score);
    const newBestStreak = Math.max(stats.bestStreak, maxStreakInRun);
    const newTotalSolved = stats.totalSolved + score;
    const newTotalPlayed = stats.totalPlayed + 1;

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(newBestScore));
        localStorage.setItem(STORAGE_KEYS.BEST_STREAK, String(newBestStreak));
        localStorage.setItem(STORAGE_KEYS.TOTAL_SOLVED, String(newTotalSolved));
        localStorage.setItem(STORAGE_KEYS.TOTAL_PLAYED, String(newTotalPlayed));
      }
    } catch (e) {}

    return {
      isNewBestScore: score > stats.bestScore,
      newBestScore,
      newBestStreak,
    };
  }

  /**
   * Get puzzles matching current score / difficulty tier
   * 0-3: Rating < 1000 (Beginner)
   * 4-8: Rating 1000-1300 (Easy)
   * 9-15: Rating 1300-1600 (Intermediate)
   * 16-24: Rating 1600-1850 (Advanced)
   * 25-35: Rating 1850-2100 (Expert)
   * 36+: Rating 2100+ (Master)
   */
  static getPuzzlesForScore(score: number): PuzzleRecord[] {
    const all = offlinePuzzlesData as PuzzleRecord[];
    let minRating = 700;
    let maxRating = 1000;

    if (score >= 36) {
      minRating = 2100;
      maxRating = 2800;
    } else if (score >= 25) {
      minRating = 1850;
      maxRating = 2100;
    } else if (score >= 16) {
      minRating = 1600;
      maxRating = 1850;
    } else if (score >= 9) {
      minRating = 1300;
      maxRating = 1600;
    } else if (score >= 4) {
      minRating = 1000;
      maxRating = 1300;
    }

    const filtered = all.filter((p) => p.rating >= minRating && p.rating <= maxRating);
    const candidates = filtered.length >= 5 ? filtered : all;

    // Return shuffled copy
    return [...candidates].sort(() => Math.random() - 0.5);
  }

  /**
   * Get difficulty label string based on current score
   */
  static getDifficultyLabel(score: number): string {
    if (score >= 36) return "Master";
    if (score >= 25) return "Expert";
    if (score >= 16) return "Advanced";
    if (score >= 9) return "Intermediate";
    if (score >= 4) return "Easy";
    return "Beginner";
  }
}
