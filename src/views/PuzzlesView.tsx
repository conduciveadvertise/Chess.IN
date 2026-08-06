import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { GameSettings, UserProfile } from "../types/chess";
import { PuzzleTheme, PuzzleRecord } from "../types/learning";
import { learningRepository } from "../repositories/LearningRepository";
import {
  Puzzle,
  Lightbulb,
  ChevronLeft,
  Flame,
  Zap,
  RotateCcw,
  CheckCircle2,
  Filter,
} from "lucide-react-native";

interface PuzzlesViewProps {
  user?: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
  onSolvePuzzle?: () => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  user,
  settings,
  onBackToHome,
  onSolvePuzzle,
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "rush" | "tactics">("daily");

  const [dailyPuzzle, setDailyPuzzle] = useState<PuzzleRecord | null>(null);
  const [chess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>("");
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [dailyStreak, setDailyStreak] = useState<number>(5);
  const [puzzleRating, setPuzzleRating] = useState<number>(1540);

  const [selectedTheme, setSelectedTheme] = useState<PuzzleTheme>("mate_in_1");
  const [themePuzzles, setThemePuzzles] = useState<PuzzleRecord[]>([]);

  useEffect(() => {
    learningRepository.getDailyPuzzle().then((p) => {
      setDailyPuzzle(p);
      chess.load(p.fen);
      setFen(chess.fen());
      setMoveIndex(0);
      setSolved(false);
      setFailed(false);
    });
  }, [chess]);

  useEffect(() => {
    learningRepository.getPuzzlesByTheme(selectedTheme).then((list) => {
      setThemePuzzles(list);
      if (list.length > 0) {
        chess.load(list[0].fen);
        setFen(chess.fen());
        setMoveIndex(0);
        setSolved(false);
        setFailed(false);
      }
    });
  }, [selectedTheme, chess]);

  const handleMove = (from: string, to: string, promotion?: string) => {
    if (solved) return;

    const currentPuzzle = activeTab === "daily" ? dailyPuzzle : themePuzzles[0];
    if (!currentPuzzle) return;

    try {
      const currentExpectedMove = currentPuzzle.moves[moveIndex];
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (!moveObj) return;

      const userSan = moveObj.san;
      const userUci = moveObj.from + moveObj.to + (moveObj.promotion || "");

      const isCorrect =
        userUci === currentExpectedMove ||
        userSan === currentExpectedMove ||
        userUci.startsWith(currentExpectedMove) ||
        userSan.toLowerCase() === currentExpectedMove.toLowerCase();

      if (isCorrect) {
        setFen(chess.fen());
        setShowHint(false);
        const nextIndex = moveIndex + 1;

        if (nextIndex >= currentPuzzle.moves.length) {
          soundManager.playVictory();
          setSolved(true);
          setFailed(false);
          if (activeTab === "daily") {
            setDailyStreak((s) => s + 1);
            setPuzzleRating((r) => r + 15);
          }
          if (onSolvePuzzle) onSolvePuzzle();
        } else {
          soundManager.playMove();
          setMoveIndex(nextIndex);

          // Auto-play opponent reply
          const opponentMove = currentPuzzle.moves[nextIndex];
          setTimeout(() => {
            if (chess && !chess.isGameOver()) {
              try {
                let opRes = null;
                if (opponentMove.length >= 4) {
                  const oFrom = opponentMove.substring(0, 2);
                  const oTo = opponentMove.substring(2, 4);
                  const oProm = opponentMove.substring(4, 5);
                  opRes = chess.move({ from: oFrom, to: oTo, promotion: oProm || "q" });
                }
                if (!opRes) chess.move(opponentMove);
                setFen(chess.fen());
                soundManager.playMove();
                setMoveIndex(nextIndex + 1);
              } catch (e) {}
            }
          }, 500);
        }
      } else {
        soundManager.playDefeat();
        chess.undo();
        setFen(chess.fen());
        setFailed(true);
        setTimeout(() => setFailed(false), 1200);
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleRetry = () => {
    const currentPuzzle = activeTab === "daily" ? dailyPuzzle : themePuzzles[0];
    if (currentPuzzle) {
      chess.load(currentPuzzle.fen);
      setFen(chess.fen());
      setMoveIndex(0);
      setSolved(false);
      setFailed(false);
      setShowHint(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Puzzles</Text>
        </Pressable>

        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab("daily")}
            style={[styles.tabBtn, activeTab === "daily" && styles.activeTabBtn]}
          >
            <Text style={[styles.tabBtnText, activeTab === "daily" && styles.activeTabBtnText]}>
              Daily
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("tactics")}
            style={[styles.tabBtn, activeTab === "tactics" && styles.activeTabBtn]}
          >
            <Text style={[styles.tabBtnText, activeTab === "tactics" && styles.activeTabBtnText]}>
              Themes
            </Text>
          </Pressable>
        </View>

        <View style={styles.streakBadge}>
          <Flame size={12} color="#D4AF37" />
          <Text style={styles.streakText}>{dailyStreak}d</Text>
        </View>
      </View>

      {/* Daily Puzzle */}
      {activeTab === "daily" && dailyPuzzle && (
        <View style={styles.puzzleLayout}>
          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation={dailyPuzzle.theme === "back_rank" ? "b" : "w"}
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleMove}
              disabled={solved}
              isCardView={true}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.puzzleTitle}>{dailyPuzzle.description}</Text>
            <Text style={styles.puzzleMeta}>
              Rating: {dailyPuzzle.rating} • Theme: {dailyPuzzle.theme.toUpperCase()}
            </Text>

            {failed && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>Incorrect move! Try again.</Text>
              </View>
            )}

            {solved && (
              <View style={styles.successBox}>
                <CheckCircle2 size={20} color="#34D399" />
                <Text style={styles.successText}>Puzzle Solved! (+15 Rating)</Text>
              </View>
            )}

            {showHint && !solved && (
              <View style={styles.hintBox}>
                <Lightbulb size={14} color="#FBBF24" />
                <Text style={styles.hintText}>
                  Look for tactical motifs targeting the king or hanging pieces.
                </Text>
              </View>
            )}

            <View style={styles.actionRow}>
              {!solved && (
                <Pressable onPress={() => setShowHint(true)} style={styles.hintBtn}>
                  <Lightbulb size={14} color="#D4AF37" />
                  <Text style={styles.hintBtnText}>Hint</Text>
                </Pressable>
              )}
              <Pressable onPress={handleRetry} style={styles.retryBtn}>
                <RotateCcw size={14} color="#E4E4E7" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Tactics Themes */}
      {activeTab === "tactics" && (
        <View style={styles.tacticsLayout}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
            {["mate_in_1", "mate_in_2", "fork", "pin", "skewer", "endgame"].map((t) => (
              <Pressable
                key={t}
                onPress={() => setSelectedTheme(t as PuzzleTheme)}
                style={[styles.themeChip, selectedTheme === t && styles.activeThemeChip]}
              >
                <Text style={[styles.themeText, selectedTheme === t && styles.activeThemeText]}>
                  {t.replace(/_/g, " ")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation="w"
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleMove}
              disabled={solved}
              isCardView={true}
            />
          </View>

          {solved && (
            <View style={styles.successBox}>
              <CheckCircle2 size={20} color="#34D399" />
              <Text style={styles.successText}>Tactical Motif Mastered!</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06070B",
  },
  content: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  exitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  exitBtnText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "bold",
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 3,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeTabBtn: {
    backgroundColor: "#D4AF37",
  },
  tabBtnText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeTabBtnText: {
    color: "#000",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  streakText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
  puzzleLayout: {
    gap: 16,
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    backgroundColor: "rgba(13, 14, 21, 0.95)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 18,
    gap: 10,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  puzzleTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  puzzleMeta: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: "rgba(159, 18, 57, 0.8)",
    padding: 12,
    borderRadius: 14,
  },
  errorText: {
    color: "#FDA4AF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(6, 78, 59, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    padding: 14,
    borderRadius: 14,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 13,
    fontWeight: "bold",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    padding: 12,
    borderRadius: 14,
  },
  hintText: {
    color: "#FBBF24",
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  hintBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    paddingVertical: 12,
    borderRadius: 16,
  },
  hintBtnText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "bold",
  },
  tacticsLayout: {
    gap: 16,
  },
  themeScroll: {
    marginBottom: 4,
  },
  themeChip: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  activeThemeChip: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  themeText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeThemeText: {
    color: "#000",
  },
});
