import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Chess } from "chess.js";
import { GameSettings } from "../types/chess";
import { PuzzleRecord } from "../types/learning";
import { ChessBoard } from "../components/ChessBoard";
import {
  PuzzleRushService,
  LivesInfo,
} from "../services/puzzleRushService";
import { soundManager } from "../services/sound";
import {
  ArrowLeft,
  Pause,
  Play,
  Zap,
  Trophy,
  Flame,
  Clock,
  Heart,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Home,
  Gift,
  Crown,
  Sparkles,
} from "lucide-react-native";

interface PuzzleRushViewProps {
  settings: GameSettings;
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const PuzzleRushView: React.FC<PuzzleRushViewProps> = ({
  settings,
  onBackToHome,
}) => {
  // Game Run States
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "paused" | "results"
  >("idle");

  // Run stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [runLives, setRunLives] = useState<number>(3);
  const [mistakes, setMistakes] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes rush (180s)
  const [timePlayed, setTimePlayed] = useState<number>(0);

  // Puzzle State
  const [puzzleQueue, setPuzzleQueue] = useState<PuzzleRecord[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>("");
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"normal" | "success" | "error">(
    "normal"
  );
  const [hintText, setHintText] = useState<string | null>(null);

  // Stamina Lives State
  const [livesInfo, setLivesInfo] = useState<LivesInfo>(() =>
    PuzzleRushService.getLivesInfo()
  );
  const [isLivesModalOpen, setIsLivesModalOpen] = useState<boolean>(false);
  const [runSummary, setRunSummary] = useState<{
    score: number;
    bestScore: number;
    isNewBest: boolean;
    accuracy: number;
    highestStreak: number;
    totalSolved: number;
    timePlayed: number;
  } | null>(null);

  // Success Modal State & Stats
  const [isSolveModalOpen, setIsSolveModalOpen] = useState<boolean>(false);
  const [solveStats, setSolveStats] = useState<{
    scoreGained: number;
    totalScore: number;
    streak: number;
    timeTaken: number;
  } | null>(null);
  const [pendingNextPuzzle, setPendingNextPuzzle] = useState<PuzzleRecord | null>(null);

  const puzzleStartTimeRef = useRef<number>(Date.now());

  // Modal Animation values
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.85)).current;
  const celebrateBounceAnim = useRef(new Animated.Value(1)).current;

  // Timer Ref
  const timerRef = useRef<any>(null);

  // Animation values for smooth puzzle transitions
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Trigger smooth slide-out left and fade-in from right for next puzzle
  const transitionToNextPuzzle = (nextPuzzle: PuzzleRecord) => {
    if (settings?.lowPowerMode) {
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
      loadPuzzle(nextPuzzle);
      return;
    }

    // 1. Slide out to left (-60px) and fade out (120ms)
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Load next puzzle into state
      loadPuzzle(nextPuzzle);

      // 3. Reset position to right (+60px)
      slideAnim.setValue(60);

      // 4. Slide in to center (0px) and fade in (150ms)
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Update Stamina Lives Info every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLivesInfo(PuzzleRushService.getLivesInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main Rush Timer Effect
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishRun();
            return 0;
          }
          return prev - 1;
        });
        setTimePlayed((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Start a new Puzzle Rush run
  const startNewRun = () => {
    // Check stamina lives
    const currentLives = PuzzleRushService.getLivesInfo();
    if (currentLives.lives <= 0) {
      setIsLivesModalOpen(true);
      return;
    }

    // Consume 1 stamina life
    const success = PuzzleRushService.consumeLife();
    if (!success) {
      setIsLivesModalOpen(true);
      return;
    }

    setLivesInfo(PuzzleRushService.getLivesInfo());

    // Reset run state
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setRunLives(3);
    setMistakes(0);
    setTimeLeft(180);
    setTimePlayed(0);
    setRunSummary(null);

    // Fetch initial beginner puzzles
    const initialPuzzles = PuzzleRushService.getPuzzlesForScore(0);
    setPuzzleQueue(initialPuzzles);
    setCurrentPuzzleIndex(0);

    if (initialPuzzles.length > 0) {
      loadPuzzle(initialPuzzles[0]);
    }

    setGameState("playing");
  };

  // Load a puzzle into the board
  const loadPuzzle = (puzzle: PuzzleRecord) => {
    try {
      puzzleStartTimeRef.current = Date.now();
      const c = new Chess(puzzle.fen);
      setChess(c);
      setFen(c.fen());
      setMoveIndex(0);
      setHintText(null);
      setStatusType("normal");

      const turnColor = c.turn();
      const turnText = turnColor === "w" ? "White" : "Black";
      const ratingText = puzzle.rating ? ` Rating ${puzzle.rating}` : "";
      const themeText = puzzle.theme ? ` • ${puzzle.theme.replace("_", " ")}` : "";
      setStatusMessage(`${turnText} to Move${themeText}${ratingText}`);
    } catch (e) {
      console.error("Error loading puzzle FEN", e);
    }
  };

  // Close Success Modal & load next puzzle with smooth transition
  const handleNextPuzzlePress = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalScaleAnim, {
        toValue: 0.92,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSolveModalOpen(false);
      if (pendingNextPuzzle) {
        transitionToNextPuzzle(pendingNextPuzzle);
      }
    });
  };

  // Move handler
  const handleMove = (from: string, to: string, promotion?: string) => {
    if (gameState !== "playing" || !puzzleQueue[currentPuzzleIndex]) return;

    const currentPuzzle = puzzleQueue[currentPuzzleIndex];
    const expectedMove = currentPuzzle.moves[moveIndex];

    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (!moveObj) return;

      const userSan = moveObj.san;
      const userUci = moveObj.from + moveObj.to + (moveObj.promotion || "");

      const isCorrect =
        userUci === expectedMove ||
        userSan === expectedMove ||
        userUci.startsWith(expectedMove) ||
        userSan.toLowerCase() === expectedMove.toLowerCase();

      if (isCorrect) {
        soundManager.playMove();
        setFen(chess.fen());
        setHintText(null);

        const nextIndex = moveIndex + 1;

        if (nextIndex >= currentPuzzle.moves.length) {
          // Solved current puzzle!
          soundManager.playVictory();
          setStatusType("success");
          setStatusMessage("Correct! +1 Point");

          const newScore = score + 1;
          const newStreak = streak + 1;
          setScore(newScore);
          setStreak(newStreak);
          setHighestStreak((prev) => Math.max(prev, newStreak));

          const timeTaken = Math.max(
            1,
            Math.round((Date.now() - puzzleStartTimeRef.current) / 1000)
          );

          // Fetch next puzzle and prepare pending puzzle
          const nextPuzzles = PuzzleRushService.getPuzzlesForScore(newScore);
          setPuzzleQueue(nextPuzzles);
          const nextIdx = (currentPuzzleIndex + 1) % nextPuzzles.length;
          setCurrentPuzzleIndex(nextIdx);
          const nextPuzzle = nextPuzzles[nextIdx];
          setPendingNextPuzzle(nextPuzzle);

          setSolveStats({
            scoreGained: 1,
            totalScore: newScore,
            streak: newStreak,
            timeTaken,
          });

          // Show premium success dialog with fade & bounce animation
          setIsSolveModalOpen(true);
          modalFadeAnim.setValue(0);
          modalScaleAnim.setValue(0.85);
          celebrateBounceAnim.setValue(0.8);

          Animated.parallel([
            Animated.timing(modalFadeAnim, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.spring(modalScaleAnim, {
              toValue: 1,
              friction: 6,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.spring(celebrateBounceAnim, {
                toValue: 1.25,
                friction: 4,
                tension: 100,
                useNativeDriver: true,
              }),
              Animated.spring(celebrateBounceAnim, {
                toValue: 1.0,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        } else {
          // More moves in this puzzle sequence
          setMoveIndex(nextIndex);

          // Opponent auto reply
          const opponentMove = currentPuzzle.moves[nextIndex];
          setTimeout(() => {
            if (chess && !chess.isGameOver()) {
              try {
                let opRes = null;
                if (opponentMove.length >= 4) {
                  const oFrom = opponentMove.substring(0, 2);
                  const oTo = opponentMove.substring(2, 4);
                  const oProm = opponentMove.substring(4, 5);
                  opRes = chess.move({
                    from: oFrom,
                    to: oTo,
                    promotion: oProm || "q",
                  });
                }
                if (!opRes) chess.move(opponentMove);
                setFen(chess.fen());
                soundManager.playMove();
                setMoveIndex(nextIndex + 1);
              } catch (e) {
                console.error("Opponent auto move failed", e);
              }
            }
          }, 250);
        }
      } else {
        // Wrong move
        soundManager.playDefeat();
        chess.undo();
        setFen(chess.fen());
        setStatusType("error");
        setStatusMessage("Incorrect move! -1 Life");

        const newLives = runLives - 1;
        setRunLives(newLives);
        setStreak(0);
        setMistakes((m) => m + 1);

        if (newLives <= 0) {
          finishRun();
        } else {
          // Load next puzzle on wrong move so rhythm isn't lost
          setTimeout(() => {
            const nextPuzzles = PuzzleRushService.getPuzzlesForScore(score);
            const nextIdx = (currentPuzzleIndex + 1) % nextPuzzles.length;
            setCurrentPuzzleIndex(nextIdx);
            if (nextPuzzles[nextIdx]) {
              transitionToNextPuzzle(nextPuzzles[nextIdx]);
            }
          }, 450);
        }
      }
    } catch (e) {
      console.error("Move error", e);
    }
  };

  // Provide subtle hint
  const handleShowHint = () => {
    const currentPuzzle = puzzleQueue[currentPuzzleIndex];
    if (!currentPuzzle || !currentPuzzle.moves[moveIndex]) return;

    const nextMoveUci = currentPuzzle.moves[moveIndex];
    const pieceSquare = nextMoveUci.substring(0, 2).toUpperCase();
    const targetSquare = nextMoveUci.substring(2, 4).toUpperCase();

    setHintText(`💡 Move piece from ${pieceSquare} towards ${targetSquare}`);
  };

  // Finish run and compute results
  const finishRun = () => {
    setIsSolveModalOpen(false);
    setGameState("results");
    if (timerRef.current) clearInterval(timerRef.current);

    const saved = PuzzleRushService.saveRunStats(score, highestStreak);
    const totalAttempted = score + mistakes;
    const accuracy =
      totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 100;

    setRunSummary({
      score,
      bestScore: saved.newBestScore,
      isNewBest: saved.isNewBestScore,
      accuracy,
      highestStreak,
      totalSolved: score,
      timePlayed: Math.max(1, timePlayed),
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const turnColor = chess.turn();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={onBackToHome} style={styles.backBtn}>
          <ArrowLeft size={20} color="#D4AF37" />
        </Pressable>

        <View style={styles.titleBadge}>
          <Zap size={16} color="#D4AF37" fill="#D4AF37" />
          <Text style={styles.titleText}>PUZZLE RUSH</Text>
        </View>

        {gameState === "playing" ? (
          <Pressable
            onPress={() => setGameState("paused")}
            style={styles.actionIconBtn}
          >
            <Pause size={18} color="#D4AF37" />
          </Pressable>
        ) : gameState === "paused" ? (
          <Pressable
            onPress={() => setGameState("playing")}
            style={styles.actionIconBtn}
          >
            <Play size={18} color="#22C55E" />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Main Container */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {gameState === "idle" ? (
          /* IDLE START DASHBOARD SCREEN */
          <View style={styles.startDashboard}>
            <View style={styles.heroBanner}>
              <View style={styles.heroLogoCircle}>
                <Zap size={40} color="#000000" fill="#000000" />
              </View>
              <Text style={styles.heroTitle}>PUZZLE RUSH</Text>
              <Text style={styles.heroSubtitle}>
                Solve as many tactical puzzles as you can in 60 seconds!
              </Text>
            </View>

            {/* Stamina Lives Indicator */}
            <View style={styles.livesCard}>
              <View style={styles.livesLeft}>
                <Heart
                  size={20}
                  color={livesInfo.lives > 0 ? "#EF4444" : "#A1A1AA"}
                  fill={livesInfo.lives > 0 ? "#EF4444" : "transparent"}
                />
                <View>
                  <Text style={styles.livesTitle}>
                    Stamina Lives: {livesInfo.lives}/3
                  </Text>
                  {livesInfo.lives < 3 && (
                    <Text style={styles.livesSub}>
                      Next life in {formatTime(livesInfo.nextRefillSeconds)}
                    </Text>
                  )}
                </View>
              </View>

              {livesInfo.lives < 3 && (
                <View style={styles.refillPill}>
                  <Clock size={12} color="#D4AF37" />
                  <Text style={styles.refillPillText}>Auto Refill</Text>
                </View>
              )}
            </View>

            {/* Mode Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Trophy size={18} color="#D4AF37" />
                <Text style={styles.statRowLabel}>Best Score</Text>
                <Text style={styles.statRowValue}>
                  {PuzzleRushService.getStats().bestScore}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statRow}>
                <Flame size={18} color="#F97316" fill="#F97316" />
                <Text style={styles.statRowLabel}>Best Streak</Text>
                <Text style={styles.statRowValue}>
                  {PuzzleRushService.getStats().bestStreak}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statRow}>
                <Clock size={18} color="#38BDF8" />
                <Text style={styles.statRowLabel}>Timer</Text>
                <Text style={styles.statRowValue}>3:00</Text>
              </View>
            </View>

            {/* Start Button */}
            <Pressable style={styles.startRunBtn} onPress={startNewRun}>
              <Zap size={20} color="#000000" fill="#000000" />
              <Text style={styles.startRunBtnText}>START PUZZLE RUSH</Text>
            </Pressable>
          </View>
        ) : gameState === "results" && runSummary ? (
          /* RESULTS SCREEN */
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Trophy size={48} color="#D4AF37" />
              <Text style={styles.resultsTitle}>PUZZLE RUSH COMPLETE</Text>
              {runSummary.isNewBest && (
                <View style={styles.newBestBadge}>
                  <Sparkles size={14} color="#000" />
                  <Text style={styles.newBestText}>NEW HIGH SCORE!</Text>
                </View>
              )}
            </View>

            {/* Main Score Display */}
            <View style={styles.finalScoreCard}>
              <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
              <Text style={styles.finalScoreNum}>{runSummary.score}</Text>
            </View>

            {/* Stats Breakdown */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>Best Score</Text>
                <Text style={styles.summaryBoxVal}>{runSummary.bestScore}</Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>Accuracy</Text>
                <Text style={styles.summaryBoxVal}>
                  {runSummary.accuracy}%
                </Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>Best Streak</Text>
                <Text style={styles.summaryBoxVal}>
                  {runSummary.highestStreak}
                </Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>Time Played</Text>
                <Text style={styles.summaryBoxVal}>
                  {runSummary.timePlayed}s
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.resultsBtnGroup}>
              <Pressable
                style={styles.playAgainBtn}
                onPress={startNewRun}
              >
                <Play size={18} color="#000000" fill="#000000" />
                <Text style={styles.playAgainBtnText}>PLAY AGAIN</Text>
              </Pressable>

              <Pressable style={styles.homeBtn} onPress={onBackToHome}>
                <Home size={18} color="#D4AF37" />
                <Text style={styles.homeBtnText}>EXIT TO HOME</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* ACTIVE GAMEPLAY SCREEN */
          <View style={styles.gameplayContainer}>
            {/* Rush Status Header Bar */}
            <View style={styles.gameplayHeader}>
              {/* Timer */}
              <View style={styles.timerBadge}>
                <Clock size={16} color="#38BDF8" />
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>

              {/* Score */}
              <View style={styles.scoreBadge}>
                <Trophy size={16} color="#D4AF37" />
                <Text style={styles.scoreText}>Score: {score}</Text>
              </View>

              {/* Streak */}
              <View style={styles.streakBadge}>
                <Flame size={16} color="#F97316" fill="#F97316" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>

              {/* Run Hearts */}
              <View style={styles.heartsRow}>
                {[1, 2, 3].map((h) => (
                  <Heart
                    key={h}
                    size={18}
                    color={h <= runLives ? "#EF4444" : "#3F3F46"}
                    fill={h <= runLives ? "#EF4444" : "transparent"}
                  />
                ))}
              </View>
            </View>

            {/* Status Message Banner */}
            <View
              style={[
                styles.statusBanner,
                statusType === "success" && styles.statusSuccess,
                statusType === "error" && styles.statusError,
              ]}
            >
              <Text style={styles.statusBannerText}>{statusMessage}</Text>
            </View>

            {/* Responsive Chessboard Container with Slide & Fade Animation */}
            <Animated.View
              style={[
                styles.boardWrapper,
                {
                  opacity: opacityAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <ChessBoard
                chess={chess}
                fen={fen}
                orientation="w"
                boardTheme={settings.boardTheme}
                pieceTheme={settings.pieceTheme}
                onMove={handleMove}
                disabled={gameState !== "playing"}
              />
            </Animated.View>

            {/* Hint Box */}
            {hintText && (
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>{hintText}</Text>
              </View>
            )}

            {/* Gameplay Control Buttons */}
            <View style={styles.gameplayActions}>
              <Pressable
                style={styles.hintBtn}
                onPress={handleShowHint}
              >
                <Lightbulb size={16} color="#D4AF37" />
                <Text style={styles.hintBtnText}>Hint</Text>
              </Pressable>

              <View style={styles.diffBadge}>
                <Zap size={14} color="#A855F7" />
                <Text style={styles.diffText}>
                  {PuzzleRushService.getDifficultyLabel(score)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* PAUSE OVERLAY MODAL */}
      {gameState === "paused" && (
        <Modal transparent visible animationType="fade">
          <View style={styles.pauseOverlay}>
            <View style={styles.pauseCard}>
              <Pause size={40} color="#D4AF37" />
              <Text style={styles.pauseTitle}>RUSH PAUSED</Text>

              <Pressable
                style={styles.resumeBtn}
                onPress={() => setGameState("playing")}
              >
                <Play size={18} color="#000" fill="#000" />
                <Text style={styles.resumeBtnText}>RESUME</Text>
              </Pressable>

              <Pressable style={styles.quitBtn} onPress={finishRun}>
                <XCircle size={18} color="#EF4444" />
                <Text style={styles.quitBtnText}>END RUSH</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* LIVES EMPTY MODAL */}
      <Modal
        visible={isLivesModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLivesModalOpen(false)}
      >
        <View style={styles.livesModalOverlay}>
          <View style={styles.livesModalCard}>
            <View style={styles.livesModalIconBox}>
              <Heart size={36} color="#EF4444" fill="#EF4444" />
            </View>

            <Text style={styles.livesModalTitle}>Out of Stamina Lives</Text>
            <Text style={styles.livesModalSub}>
              Lives restore automatically while away.
            </Text>

            {/* Countdown Box */}
            <View style={styles.timerCard}>
              <Clock size={20} color="#D4AF37" />
              <View>
                <Text style={styles.timerCardTitle}>Next Life Restores In</Text>
                <Text style={styles.timerCardNum}>
                  {formatTime(livesInfo.nextRefillSeconds)}
                </Text>
              </View>
            </View>

            {/* Rules explanation */}
            <View style={styles.rulesBox}>
              <Text style={styles.ruleText}>
                • 1 Life restored every 15 minutes
              </Text>
              <Text style={styles.ruleText}>
                • Maximum 3 Stamina Lives capacity
              </Text>
            </View>

            {/* Disabled Offline Watch Reward Placeholder */}
            <View style={styles.rewardPlaceholder}>
              <Gift size={16} color="#71717A" />
              <Text style={styles.rewardText}>Watch Ad for Free Life</Text>
              <View style={styles.disabledTag}>
                <Text style={styles.disabledTagText}>Offline Mode</Text>
              </View>
            </View>

            <View style={styles.rewardPlaceholder}>
              <Crown size={16} color="#71717A" />
              <Text style={styles.rewardText}>Unlimited Lives Upgrade</Text>
              <View style={styles.disabledTag}>
                <Text style={styles.disabledTagText}>Coming Soon</Text>
              </View>
            </View>

            {/* Modal Buttons */}
            <Pressable
              style={styles.closeLivesBtn}
              onPress={() => setIsLivesModalOpen(false)}
            >
              <Text style={styles.closeLivesBtnText}>WAIT FOR REFILL</Text>
            </Pressable>

            <Pressable
              style={styles.goHomeBtn}
              onPress={() => {
                setIsLivesModalOpen(false);
                onBackToHome();
              }}
            >
              <Home size={16} color="#A1A1AA" />
              <Text style={styles.goHomeBtnText}>RETURN TO HOME</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* PREMIUM PUZZLE SOLVED SUCCESS MODAL */}
      <Modal
        visible={isSolveModalOpen}
        transparent
        animationType="none"
        onRequestClose={handleNextPuzzlePress}
      >
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successModalContainer,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            {/* Top Accent Gold Bar */}
            <View style={styles.successTopAccent} />

            {/* Celebration Icon with scale/bounce */}
            <Animated.View
              style={[
                styles.celebrationIconBox,
                { transform: [{ scale: celebrateBounceAnim }] },
              ]}
            >
              <Text style={styles.celebrationEmoji}>🎉</Text>
            </Animated.View>

            {/* Title & Subtitle */}
            <Text style={styles.successTitle}>Puzzle Solved!</Text>
            <Text style={styles.successSubtitle}>Excellent Move!</Text>

            {/* Stats Row */}
            {solveStats && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={styles.statLabel}>SCORE</Text>
                  <Text style={styles.statValue}>+{solveStats.scoreGained}</Text>
                </View>

                <View style={[styles.statCard, styles.statCardHighlight]}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statLabel}>STREAK</Text>
                  <Text style={styles.statValue}>{solveStats.streak}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⏱</Text>
                  <Text style={styles.statLabel}>TIME</Text>
                  <Text style={styles.statValue}>{solveStats.timeTaken}s</Text>
                </View>
              </View>
            )}

            {/* Premium Gold Button */}
            <Pressable
              style={({ pressed }) => [
                styles.nextPuzzleBtn,
                pressed && styles.nextPuzzleBtnPressed,
              ]}
              onPress={handleNextPuzzlePress}
            >
              <Text style={styles.nextPuzzleBtnText}>Next Puzzle →</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06070B",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0A0B10",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionIconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  startDashboard: {
    gap: 16,
  },
  heroBanner: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#0D0E15",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  heroLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  heroSubtitle: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  livesCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0E15",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  livesLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  livesTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  livesSub: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  refillPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refillPillText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsCard: {
    backgroundColor: "#0D0E15",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  statRowLabel: {
    color: "#A1A1AA",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  statRowValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  statDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  startRunBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  startRunBtnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  gameplayContainer: {
    gap: 12,
  },
  gameplayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0E15",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "bold",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  streakText: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "bold",
  },
  heartsRow: {
    flexDirection: "row",
    gap: 4,
  },
  statusBanner: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  statusSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.4)",
  },
  statusError: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  statusBannerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  boardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    width: "100%",
  },
  hintBox: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  hintText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  gameplayActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  hintBtnText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  diffText: {
    color: "#C084FC",
    fontSize: 12,
    fontWeight: "bold",
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  pauseCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#0D0E15",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    alignItems: "center",
    gap: 16,
  },
  pauseTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  resumeBtn: {
    width: "100%",
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resumeBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  quitBtn: {
    width: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quitBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  resultsContainer: {
    alignItems: "center",
    gap: 16,
  },
  resultsHeader: {
    alignItems: "center",
    marginVertical: 10,
  },
  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 8,
  },
  newBestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D4AF37",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  newBestText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "900",
  },
  finalScoreCard: {
    width: "100%",
    backgroundColor: "#0D0E15",
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    alignItems: "center",
  },
  finalScoreLabel: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  finalScoreNum: {
    color: "#D4AF37",
    fontSize: 48,
    fontWeight: "900",
  },
  summaryGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryBox: {
    width: "48%",
    backgroundColor: "#0D0E15",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  summaryBoxLabel: {
    color: "#71717A",
    fontSize: 11,
  },
  summaryBoxVal: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  resultsBtnGroup: {
    width: "100%",
    gap: 12,
    marginTop: 10,
  },
  playAgainBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  playAgainBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  homeBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  homeBtnText: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "bold",
  },
  livesModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  livesModalCard: {
    backgroundColor: "#0D0E15",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderColor: "#D4AF37",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  livesModalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  livesModalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  livesModalSub: {
    color: "#A1A1AA",
    fontSize: 12,
    textAlign: "center",
  },
  timerCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  timerCardTitle: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  timerCardNum: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
  },
  rulesBox: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  ruleText: {
    color: "#71717A",
    fontSize: 12,
  },
  rewardPlaceholder: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  rewardText: {
    color: "#71717A",
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  disabledTag: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  disabledTagText: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "bold",
  },
  closeLivesBtn: {
    width: "100%",
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  closeLivesBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
  goHomeBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  goHomeBtnText: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModalContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#0D0E15",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    padding: 24,
    alignItems: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: "relative",
    overflow: "hidden",
  },
  successTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#D4AF37",
  },
  celebrationIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  celebrationEmoji: {
    fontSize: 36,
  },
  successTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  successSubtitle: {
    color: "#E4E4E7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statCardHighlight: {
    borderColor: "rgba(212, 175, 55, 0.5)",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextPuzzleBtn: {
    width: "100%",
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  nextPuzzleBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  nextPuzzleBtnText: {
    color: "#08090D",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
