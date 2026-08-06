import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Chess } from "chess.js";
import { GameSettings } from "../types/chess";
import { PuzzleRecord } from "../types/learning";
import { learningRepository, getLocalDateString } from "../repositories/LearningRepository";
import { soundManager } from "../services/sound";
import { ChessBoard } from "./ChessBoard";
import {
  Puzzle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RotateCcw,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react-native";

interface DailyPuzzleCardProps {
  settings: GameSettings;
  onOpenFullPuzzles?: () => void;
}

const PUZZLE_STORAGE_KEY_PREFIX = "chess_in_daily_puzzle_";

export const DailyPuzzleCard: React.FC<DailyPuzzleCardProps> = ({
  settings,
  onOpenFullPuzzles,
}) => {
  const [puzzle, setPuzzle] = useState<PuzzleRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chess, setChess] = useState<Chess | null>(null);
  const [fen, setFen] = useState<string>("");
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);

  // Get current local date key (YYYY-MM-DD)
  const [todayKey, setTodayKey] = useState<string>(getLocalDateString());

  // Check for local date change every 15 seconds (midnight rollover check)
  useEffect(() => {
    const interval = setInterval(() => {
      const nowKey = getLocalDateString();
      if (nowKey !== todayKey) {
        setTodayKey(nowKey);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [todayKey]);

  // Load daily puzzle and streak progress on mount or date change
  useEffect(() => {
    let isMounted = true;

    async function loadDaily() {
      try {
        setLoading(true);
        setSolved(false);
        setFailed(false);
        setMoveIndex(0);
        setShowHint(false);

        const p = await learningRepository.getDailyPuzzle();
        if (!isMounted) return;

        setPuzzle(p);
        const game = new Chess(p.fen);
        setChess(game);
        setFen(game.fen());

        // Check if already completed today
        let savedStatus = null;
        try {
          if (typeof localStorage !== "undefined") {
            savedStatus = localStorage.getItem(`${PUZZLE_STORAGE_KEY_PREFIX}${todayKey}`);
          }
        } catch (e) {}

        if (savedStatus === "solved") {
          setSolved(true);
          setStatusText("Completed Today! Great job.");
        } else {
          setStatusText(
            game.turn() === "w" ? "White to Move & Find Best Line" : "Black to Move & Find Best Line"
          );
        }

        // Load streak count
        try {
          if (typeof localStorage !== "undefined") {
            const savedStreak = localStorage.getItem("chess_in_puzzle_streak");
            if (savedStreak) {
              const parsed = parseInt(savedStreak, 10);
              if (!isNaN(parsed)) setStreak(parsed);
            } else {
              setStreak(1);
            }
          } else {
            setStreak(1);
          }
        } catch (e) {
          setStreak(1);
        }
      } catch (err) {
        console.error("Error loading daily puzzle:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDaily();

    return () => {
      isMounted = false;
    };
  }, [todayKey]);

  // Handle user board move
  const handleMove = (from: string, to: string, promotion?: string) => {
    if (!chess || !puzzle || solved) return;

    try {
      const currentExpectedMove = puzzle.moves[moveIndex];
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });

      if (!moveObj) return;

      const userSan = moveObj.san;
      const userUci = moveObj.from + moveObj.to + (moveObj.promotion || "");

      // Check if move matches solution (UCI or SAN format)
      const isCorrect =
        userUci === currentExpectedMove ||
        userSan === currentExpectedMove ||
        userUci.startsWith(currentExpectedMove) ||
        userSan.toLowerCase() === currentExpectedMove.toLowerCase();

      if (isCorrect) {
        setFen(chess.fen());
        setShowHint(false);

        const nextIndex = moveIndex + 1;

        if (nextIndex >= puzzle.moves.length) {
          // Puzzle completed!
          soundManager.playVictory();
          setSolved(true);
          setFailed(false);
          setStatusText("Puzzle Solved! Excellent tactic.");

          // Persist progress to local storage
          try {
            if (typeof localStorage !== "undefined") {
              localStorage.setItem(`${PUZZLE_STORAGE_KEY_PREFIX}${todayKey}`, "solved");
              const newStreak = streak + 1;
              setStreak(newStreak);
              localStorage.setItem("chess_in_puzzle_streak", String(newStreak));
            }
          } catch (e) {}
        } else {
          // Play opponent response automatically if available
          soundManager.playMove();
          setMoveIndex(nextIndex);
          setStatusText("Correct move! Keep going...");

          // Opponent response in solution
          const opponentMove = puzzle.moves[nextIndex];
          setTimeout(() => {
            if (chess && !chess.isGameOver()) {
              try {
                // Try playing as UCI move
                let opRes = null;
                if (opponentMove.length >= 4) {
                  const oFrom = opponentMove.substring(0, 2);
                  const oTo = opponentMove.substring(2, 4);
                  const oProm = opponentMove.substring(4, 5);
                  opRes = chess.move({ from: oFrom, to: oTo, promotion: oProm || "q" });
                }
                if (!opRes) {
                  chess.move(opponentMove);
                }
                setFen(chess.fen());
                soundManager.playMove();
                setMoveIndex(nextIndex + 1);
              } catch (e) {
                console.log("Auto move error", e);
              }
            }
          }, 500);
        }
      } else {
        // Incorrect move
        soundManager.playDefeat();
        chess.undo();
        setFen(chess.fen());
        setFailed(true);
        setStatusText("Incorrect move. Try again!");

        setTimeout(() => {
          setFailed(false);
        }, 1200);
      }
    } catch (err) {
      console.log("Invalid move attempt", err);
    }
  };

  // Reset/Retry puzzle state
  const handleReset = () => {
    if (!puzzle) return;
    const game = new Chess(puzzle.fen);
    setChess(game);
    setFen(game.fen());
    setMoveIndex(0);
    setSolved(false);
    setFailed(false);
    setShowHint(false);
    setStatusText(
      game.turn() === "w" ? "White to Move & Find Best Line" : "Black to Move & Find Best Line"
    );
  };

  if (loading || !puzzle || !chess) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading Daily Puzzle...</Text>
        </View>
      </View>
    );
  }

  const turnColor = chess.turn();
  const sideToMoveText = turnColor === "w" ? "White to Move" : "Black to Move";

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.iconBox}>
            <Puzzle size={20} color="#D4AF37" />
          </View>
          <View>
            <Text style={styles.cardTitle}>DAILY PUZZLE</Text>
            <Text style={styles.cardSubtitle}>
              {puzzle.theme ? puzzle.theme.replace("_", " ").toUpperCase() : "TACTICAL LESSON"} • Rating {puzzle.rating || 1200}
            </Text>
          </View>
        </View>

        {/* Streak Counter */}
        <View style={styles.streakBadge}>
          <Flame size={14} color="#F97316" fill="#F97316" />
          <Text style={styles.streakText}>{streak} Day Streak</Text>
        </View>
      </View>

      {/* Description / Status Box */}
      <View
        style={[
          styles.statusBox,
          solved && styles.statusBoxSolved,
          failed && styles.statusBoxFailed,
        ]}
      >
        <View style={styles.statusLeft}>
          {solved ? (
            <CheckCircle2 size={18} color="#22C55E" />
          ) : failed ? (
            <XCircle size={18} color="#EF4444" />
          ) : (
            <Award size={18} color="#D4AF37" />
          )}
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        <Text style={styles.turnBadge}>{sideToMoveText}</Text>
      </View>

      {/* Interactive Chessboard */}
      <View style={styles.boardWrapper}>
        <ChessBoard
          chess={chess}
          fen={fen}
          orientation={turnColor}
          boardTheme={settings.boardTheme}
          pieceTheme={settings.pieceTheme}
          onMove={handleMove}
          disabled={solved}
          isCardView={true}
        />
      </View>

      {/* Hint Banner if toggled */}
      {showHint && !solved && (
        <View style={styles.hintBanner}>
          <Lightbulb size={16} color="#F59E0B" />
          <Text style={styles.hintText}>
            Hint: Look for {puzzle.description || "a tactical combination!"}
          </Text>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {!solved ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
              onPress={() => setShowHint(!showHint)}
            >
              <Lightbulb size={16} color="#F59E0B" />
              <Text style={styles.actionBtnText}>
                {showHint ? "Hide Hint" : "Hint"}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
              onPress={handleReset}
            >
              <RotateCcw size={16} color="#A1A1AA" />
              <Text style={styles.actionBtnText}>Reset</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.solvedBadgeContainer}>
            <CheckCircle2 size={18} color="#22C55E" />
            <Text style={styles.solvedBadgeText}>Puzzle Solved for Today!</Text>
          </View>
        )}

        {onOpenFullPuzzles && (
          <Pressable
            style={({ pressed }) => [
              styles.viewAllBtn,
              pressed && styles.actionBtnPressed,
            ]}
            onPress={onOpenFullPuzzles}
          >
            <Text style={styles.viewAllBtnText}>More Puzzles</Text>
            <ChevronRight size={16} color="#D4AF37" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(18, 20, 29, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
    marginVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  cardSubtitle: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  streakText: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "700",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  statusBoxSolved: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.4)",
  },
  statusBoxFailed: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "600",
  },
  turnBadge: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  boardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    overflow: "hidden",
  },
  hintBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  hintText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  actionBtnPressed: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "600",
  },
  solvedBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  solvedBadgeText: {
    color: "#22C55E",
    fontSize: 13,
    fontWeight: "700",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  viewAllBtnText: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "700",
  },
});
