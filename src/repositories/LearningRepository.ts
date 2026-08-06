import offlinePuzzlesData from "../data/puzzles.json";
import { PuzzleRecord, LessonRecord, UserProgressRecord, MissionRecord, AchievementRecord, OpeningInfoExtended, EndgameLessonRecord } from "../types/learning";

/**
 * Get local date formatted as YYYY-MM-DD
 */
export function getLocalDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class LearningRepository {
  /**
   * Fetch daily puzzle from local offline database based on current local date
   */
  async getDailyPuzzle(date = new Date()): Promise<PuzzleRecord> {
    const totalPuzzles = offlinePuzzlesData.length;
    if (totalPuzzles === 0) {
      return {
        id: "daily-default-01",
        fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
        moves: ["h5f7"],
        rating: 1200,
        theme: "mate_in_1",
        description: "Scholar's Mate tactic on f7 square",
      };
    }

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    const localMidnight = new Date(y, m, d);
    const epoch = new Date(2026, 0, 1);
    const diffDays = Math.floor((localMidnight.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
    
    const index = ((diffDays % totalPuzzles) + totalPuzzles) % totalPuzzles;
    return offlinePuzzlesData[index] as PuzzleRecord;
  }

  /**
   * Fetch puzzle collection by theme or rating from offline dataset
   */
  async getPuzzlesByTheme(theme: string): Promise<PuzzleRecord[]> {
    const all = offlinePuzzlesData as PuzzleRecord[];
    const normalized = theme.toLowerCase().replace("_", "");

    const matches = all.filter((p) => {
      const pTheme = (p.theme || "").toLowerCase().replace("_", "");
      if (normalized === "matein1" || normalized === "mate") {
        return pTheme.includes("mate") || p.moves.length === 1;
      }
      return pTheme.includes(normalized) || normalized.includes(pTheme);
    });

    if (matches.length > 0) {
      return matches.slice(0, 30);
    }

    return all.slice(0, 15);
  }

  /**
   * Fetch Academy interactive lessons
   */
  async getLessons(level?: string): Promise<LessonRecord[]> {
    const defaultLessons: LessonRecord[] = [
      {
        id: "l1",
        title: "Controlling the Center",
        level: "beginner",
        category: "Opening Principles",
        description: "Occupy and control d4, d5, e4, e5 squares early in the game.",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        solutionMoves: ["e2e4"],
        explanation: "e4 stakes immediate claim on central territory while freeing lines for Bishop and Queen.",
        xpReward: 100,
        orderNum: 1,
      },
      {
        id: "l2",
        title: "King Safety & Castling",
        level: "beginner",
        category: "King Safety",
        description: "Secure your King into a safe fortress while activating your Rook.",
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
        solutionMoves: ["e1g1"],
        explanation: "Kingside castling puts the King behind a pawn wall and connects Rooks.",
        xpReward: 100,
        orderNum: 2,
      },
      {
        id: "l3",
        title: "Knight Forks",
        level: "intermediate",
        category: "Tactics",
        description: "Use the L-shaped jump to attack two valuable pieces simultaneously.",
        fen: "r1bqk2r/pppp1ppp/8/4n3/4P3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
        solutionMoves: ["c3d5"],
        explanation: "The Knight jumps to d5 threatening multi-square forks.",
        xpReward: 150,
        orderNum: 3,
      },
      {
        id: "l4",
        title: "Lucena Position Endgame",
        level: "advanced",
        category: "Endgame",
        description: "Master the bridge technique to convert Rook & Pawn endgames.",
        fen: "1K6/3P1k2/8/8/8/8/r7/8 w - - 0 1",
        solutionMoves: ["b8c7"],
        explanation: "Step the King out of the promotion square to pave the way.",
        xpReward: 250,
        orderNum: 4,
      },
    ];

    return defaultLessons;
  }

  /**
   * Fetch missions list
   */
  async getMissions(): Promise<MissionRecord[]> {
    return [
      {
        id: "m1",
        title: "Solve 3 Puzzles",
        description: "Complete 3 tactical puzzles today",
        targetCount: 3,
        currentCount: 1,
        xpReward: 100,
        missionType: "daily",
        completed: false,
      },
      {
        id: "m2",
        title: "Win 1 Rated Game",
        description: "Win a rapid or blitz game",
        targetCount: 1,
        currentCount: 1,
        xpReward: 150,
        missionType: "daily",
        completed: true,
      },
      {
        id: "m3",
        title: "Complete 2 Lessons",
        description: "Finish 2 interactive academy modules",
        targetCount: 2,
        currentCount: 0,
        xpReward: 200,
        missionType: "weekly",
        completed: false,
      },
    ];
  }

  /**
   * Fetch achievements cabinet
   */
  async getAchievements(): Promise<AchievementRecord[]> {
    return [
      {
        id: "a1",
        code: "FIRST_WIN",
        title: "First Checkmate",
        description: "Win your first chess game on CHESS.IN",
        badgeIcon: "trophy",
        xpReward: 100,
        unlocked: true,
        unlockedAt: "2026-08-01",
      },
      {
        id: "a2",
        code: "PUZZLE_MASTER",
        title: "Tactics Master",
        description: "Reach a 1800+ puzzle rating",
        badgeIcon: "target",
        xpReward: 300,
        unlocked: false,
      },
      {
        id: "a3",
        code: "STREAK_7",
        title: "Weekly Dedication",
        description: "Maintain a 7-day daily puzzle streak",
        badgeIcon: "flame",
        xpReward: 500,
        unlocked: true,
        unlockedAt: "2026-08-04",
      },
      {
        id: "a4",
        code: "GRANDMASTER_LESSON",
        title: "Scholar",
        description: "Complete all Grandmaster academy modules",
        badgeIcon: "award",
        xpReward: 1000,
        unlocked: false,
      },
    ];
  }

  /**
   * Fetch opening database entries
   */
  async getOpeningExplorer(): Promise<OpeningInfoExtended[]> {
    return [
      {
        id: "o1",
        eco: "C50",
        name: "Italian Game",
        pgnMoves: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
        winRateWhite: 48.0,
        winRateBlack: 38.0,
        drawRate: 14.0,
        popularContinuations: ["Bc5 (Giuoco Piano)", "Nf6 (Two Knights)", "Be7 (Hungarian)"],
      },
      {
        id: "o2",
        eco: "B90",
        name: "Sicilian Najdorf",
        pgnMoves: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6",
        winRateWhite: 44.0,
        winRateBlack: 42.0,
        drawRate: 14.0,
        popularContinuations: ["Be3 (English Attack)", "Bg5 (Classical)", "h3 (Adams Attack)"],
      },
      {
        id: "o3",
        eco: "D02",
        name: "London System",
        pgnMoves: "1. d4 d5 2. Nf3 Nf6 3. Bf4",
        winRateWhite: 50.0,
        winRateBlack: 36.0,
        drawRate: 14.0,
        popularContinuations: ["c5", "e6", "Bf5"],
      },
    ];
  }
}

export const learningRepository = new LearningRepository();
