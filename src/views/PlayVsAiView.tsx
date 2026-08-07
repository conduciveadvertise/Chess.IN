import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { StockfishEngine } from "../services/engine";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { Clock } from "../components/Clock";
import { CapturedPieces } from "../components/CapturedPieces";
import { MoveHistory } from "../components/MoveHistory";
import { GameSettings } from "../types/chess";
import { useGameStore } from "../services/gameStore";
import {
  Bot,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  Trophy,
} from "lucide-react-native";

import { appStorage } from "../utils/storage";

interface PlayVsAiViewProps {
  initialLevel?: number;
  settings: GameSettings;
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const PlayVsAiView: React.FC<PlayVsAiViewProps> = ({
  initialLevel = 1,
  settings,
  onBackToHome,
}) => {
  const {
    chess,
    fen,
    history,
    evalScore,
    aiLevel,
    playerColor,
    isFlipped,
    capturedPieces,
    isGameOver,
    winner,
    gameId,
    initGame,
    makeMove,
    undoMove,
    flipBoard,
  } = useGameStore();

  const getTimeSecFromSettings = (tcMode?: string) => {
    if (tcMode === "blitz") return 180;
    if (tcMode === "unlimited") return 0;
    return 600;
  };

  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevel);
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w");
  const [selectedTimeSec, setSelectedTimeSec] = useState<number>(() =>
    getTimeSecFromSettings(settings.defaultTimeControl)
  );

  useEffect(() => {
    if (settings.defaultTimeControl) {
      setSelectedTimeSec(getTimeSecFromSettings(settings.defaultTimeControl));
    }
  }, [settings.defaultTimeControl]);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(true);
  const [showNewGameModal, setShowNewGameModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialLevel) {
      setSelectedLevel(initialLevel);
    }
    // Auto initialize game on view mount
    handleStartGame(initialLevel || selectedLevel);
  }, [initialLevel]);

  // Handle Level Unlocking on Victory
  useEffect(() => {
    if (isGameOver && winner === playerColor) {
      try {
        const nextLevel = Math.min(20, aiLevel + 1);
        const currentMax = parseInt(appStorage.getItem("chess_in_max_unlocked_level") || "1", 10);
        if (nextLevel > currentMax) {
          appStorage.setItem("chess_in_max_unlocked_level", String(nextLevel));
        }
      } catch (e) {
        // ignore storage error
      }
    }
  }, [isGameOver, winner, playerColor, aiLevel]);

  const handleStartGame = (lvl: number = selectedLevel) => {
    initGame({
      mode: "vs_ai",
      aiLevel: lvl,
      playerColor: selectedColor,
      timeControl: {
        name: `${selectedTimeSec / 60}m`,
        initial: selectedTimeSec,
        increment: 0,
        category: "rapid",
      },
    });
    setIsGameStarted(true);
    soundManager.playGameStart();
  };

  const handleUserMove = (from: string, to: string, promotion?: string) => {
    if (isGameOver) return;
    const success = makeMove(from, to, promotion);
    if (success) {
      soundManager.playMove();
    }
  };

  const handleContinueNextLevel = () => {
    const nextLvl = Math.min(20, aiLevel + 1);
    setSelectedLevel(nextLvl);
    handleStartGame(nextLvl);
  };

  const handleRetryCurrentLevel = () => {
    handleStartGame(aiLevel);
  };

  const isPlayerWinner = isGameOver && winner === playerColor;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.headerBtn}>
          <ChevronLeft size={18} color="#E4E4E7" />
          <Text style={styles.headerBtnText}>Home</Text>
        </Pressable>

        <View style={styles.headerTitleBox}>
          <Bot size={16} color="#D4AF37" />
          <Text style={styles.headerTitleText}>
            Stockfish Level {aiLevel}
          </Text>
        </View>

        <View style={{ width: 60 }} />
      </View>

      {!isGameStarted ? (
        /* Setup Screen */
        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Play Computer</Text>
          <Text style={styles.setupSub}>Select match parameters</Text>

          {/* Level Selector */}
          <View style={styles.setupSection}>
            <Text style={styles.label}>
              DIFFICULTY: Level {selectedLevel}
            </Text>
            <View style={styles.chipRow}>
              {[1, 5, 10, 15, 20].map((lvl) => (
                <Pressable
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
                  style={[styles.chip, selectedLevel === lvl && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selectedLevel === lvl && styles.chipTextActive]}
                  >
                    Lvl {lvl}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Side Selector */}
          <View style={styles.setupSection}>
            <Text style={styles.label}>SIDE</Text>
            <View style={styles.chipRow}>
              {[
                { id: "w", label: "White" },
                { id: "b", label: "Black" },
              ].map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedColor(s.id as any)}
                  style={[styles.chipFlex, selectedColor === s.id && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selectedColor === s.id && styles.chipTextActive]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Time Control */}
          <View style={styles.setupSection}>
            <Text style={styles.label}>TIME CONTROL</Text>
            <View style={styles.chipRow}>
              {[
                { label: "Blitz (3m)", val: 180 },
                { label: "Rapid (10m)", val: 600 },
                { label: "Unlimited", val: 0 },
              ].map((tc) => (
                <Pressable
                  key={tc.val}
                  onPress={() => setSelectedTimeSec(tc.val)}
                  style={[styles.chipFlex, selectedTimeSec === tc.val && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, selectedTimeSec === tc.val && styles.chipTextActive]}
                  >
                    {tc.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={() => handleStartGame(selectedLevel)} style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Match</Text>
          </Pressable>
        </View>
      ) : (
        /* Active Game Screen */
        <View style={styles.gameLayout} key={`game_layout_${gameId}`}>
          {/* Top Opponent Clock */}
          <Clock
            key={`opp_clock_${gameId}`}
            initialTime={selectedTimeSec}
            isActive={chess.turn() !== playerColor && !isGameOver}
            onTimeOut={() => {}}
            playerColor={playerColor === "w" ? "b" : "w"}
            playerName={`Stockfish Lvl ${aiLevel}`}
            playerTitle="BOT"
          />

          <CapturedPieces
            key={`captured_${gameId}`}
            captured={[
              ...capturedPieces.w.map((p) => ({ type: p as any, color: "w" as const })),
              ...capturedPieces.b.map((p) => ({ type: p as any, color: "b" as const })),
            ]}
            pieceTheme={settings.pieceTheme}
          />

          {/* Large Centered Chessboard with Luxury Atmosphere Background */}
          <View style={styles.boardWrap}>
            <ChessBoard
              key={`board_${gameId}`}
              chess={chess}
              fen={fen}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation={isFlipped ? "b" : "w"}
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleUserMove}
              disabled={isGameOver}
              lastMove={
                history.length > 0
                  ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
                  : null
              }
            />
          </View>

          {/* Player Clock */}
          <Clock
            key={`player_clock_${gameId}`}
            initialTime={selectedTimeSec}
            isActive={chess.turn() === playerColor && !isGameOver}
            onTimeOut={() => {}}
            playerColor={playerColor}
            playerName="Player"
          />

          {/* Action Bar: Keep ONLY Undo and New Game */}
          <View style={styles.actionBar}>
            <Pressable
              onPress={undoMove}
              disabled={history.length === 0}
              style={[styles.actionBtn, history.length === 0 && styles.actionBtnDisabled]}
            >
              <RotateCcw size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Undo</Text>
            </Pressable>

            <Pressable onPress={() => setShowNewGameModal(true)} style={styles.actionBtn}>
              <RefreshCw size={18} color="#D4AF37" />
              <Text style={styles.actionBtnText}>New Game</Text>
            </Pressable>
          </View>

          {/* Move History */}
          <MoveHistory history={history.map((m) => m.san)} onUndo={undoMove} onFlipBoard={flipBoard} />
        </View>
      )}

      {/* New Game Confirmation Modal */}
      <Modal visible={showNewGameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Start a new game?</Text>
            <Text style={styles.modalSub}>Current progress will be lost.</Text>

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowNewGameModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmBtn}
                onPress={() => {
                  setShowNewGameModal(false);
                  handleStartGame(selectedLevel);
                }}
              >
                <Text style={styles.confirmBtnText}>Start New Game</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Campaign Result Modal (Win / Lose) */}
      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            {isPlayerWinner ? (
              <>
                <View style={styles.trophyCircle}>
                  <Trophy size={36} color="#D4AF37" />
                </View>
                <Text style={styles.victoryTitle}>🏆 Victory!</Text>
                <Text style={styles.victorySubtitle}>Level Completed!</Text>
                <Text style={styles.unlockText}>Next Level Unlocked</Text>

                <View style={styles.resultBtnRow}>
                  <Pressable
                    style={styles.exitBtn}
                    onPress={onBackToHome}
                  >
                    <Text style={styles.exitBtnText}>Exit</Text>
                  </Pressable>

                  <Pressable
                    style={styles.continueBtn}
                    onPress={handleContinueNextLevel}
                  >
                    <Text style={styles.continueBtnText}>Continue</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.lossTitle}>Game Over</Text>
                <Text style={styles.lossSub}>
                  {winner === "draw" ? "Match ended in a draw." : `Defeated by Stockfish Level ${aiLevel}`}
                </Text>

                <View style={styles.resultBtnRow}>
                  <Pressable
                    style={styles.exitBtn}
                    onPress={onBackToHome}
                  >
                    <Text style={styles.exitBtnText}>Exit</Text>
                  </Pressable>

                  <Pressable
                    style={styles.retryBtn}
                    onPress={handleRetryCurrentLevel}
                  >
                    <RotateCcw size={18} color="#06070B" />
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
    gap: 16,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBtnText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerTitleText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  setupCard: {
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    gap: 18,
  },
  setupTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  setupSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: -12,
  },
  setupSection: {
    gap: 8,
  },
  label: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  chipFlex: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  chipText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "bold",
  },
  chipTextActive: {
    color: "#D4AF37",
  },
  startBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  startBtnText: {
    color: "#06070B",
    fontWeight: "bold",
    fontSize: 14,
  },
  gameLayout: {
    gap: 12,
  },
  boardWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  evalBarBox: {
    height: 320,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#0D0E15",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 22,
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSub: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#E4E4E7",
    fontWeight: "bold",
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#06070B",
    fontWeight: "bold",
    fontSize: 13,
  },
  resultCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#0D0E15",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  victoryTitle: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "900",
  },
  victorySubtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  unlockText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  exitBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exitBtnText: {
    color: "#E4E4E7",
    fontWeight: "bold",
    fontSize: 15,
  },
  continueBtn: {
    flex: 1,
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    color: "#06070B",
    fontWeight: "bold",
    fontSize: 15,
  },
  lossTitle: {
    color: "#EF4444",
    fontSize: 22,
    fontWeight: "bold",
  },
  lossSub: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  retryBtn: {
    flex: 1,
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retryBtnText: {
    color: "#06070B",
    fontWeight: "bold",
    fontSize: 15,
  },
});
