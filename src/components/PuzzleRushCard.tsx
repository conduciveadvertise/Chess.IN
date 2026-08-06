import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { GameSettings } from "../types/chess";
import { ChessBoard } from "./ChessBoard";
import { PuzzleRushService } from "../services/puzzleRushService";
import offlinePuzzlesData from "../data/puzzles.json";
import {
  Zap,
  Trophy,
  Flame,
  Clock,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";

interface PuzzleRushCardProps {
  settings: GameSettings;
  onStartRush: () => void;
}

export const PuzzleRushCard: React.FC<PuzzleRushCardProps> = ({
  settings,
  onStartRush,
}) => {
  const [stats, setStats] = useState({ bestScore: 0, bestStreak: 0 });
  const [livesInfo, setLivesInfo] = useState({
    lives: 3,
    maxLives: 3,
    nextRefillSeconds: 0,
  });

  // Setup preview board with an offline puzzle FEN
  const [chess] = useState<Chess>(() => {
    const sample = offlinePuzzlesData[0];
    return new Chess(sample ? sample.fen : undefined);
  });

  // Load stats and lives info on mount and set interval for live countdown if needed
  useEffect(() => {
    const loadData = () => {
      setStats(PuzzleRushService.getStats());
      setLivesInfo(PuzzleRushService.getLivesInfo());
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={onStartRush}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Zap size={22} color="#000000" fill="#000000" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>PUZZLE RUSH</Text>
              <View style={styles.offlinePill}>
                <Sparkles size={10} color="#D4AF37" />
                <Text style={styles.offlineText}>OFFLINE</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              Unlimited Offline Tactical Challenges
            </Text>
          </View>
        </View>

        {/* Lives Counter Pill */}
        <View
          style={[
            styles.livesBadge,
            livesInfo.lives === 0 && styles.livesBadgeEmpty,
          ]}
        >
          <Heart
            size={14}
            color={livesInfo.lives > 0 ? "#EF4444" : "#A1A1AA"}
            fill={livesInfo.lives > 0 ? "#EF4444" : "transparent"}
          />
          <Text
            style={[
              styles.livesText,
              livesInfo.lives === 0 && styles.livesTextEmpty,
            ]}
          >
            {livesInfo.lives > 0
              ? `${livesInfo.lives}/3`
              : formatCountdown(livesInfo.nextRefillSeconds)}
          </Text>
        </View>
      </View>

      {/* Stats Badges Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Clock size={13} color="#38BDF8" />
          <Text style={styles.statLabel}>Timer</Text>
          <Text style={styles.statValue}>3:00</Text>
        </View>

        <View style={styles.statBox}>
          <Trophy size={13} color="#D4AF37" />
          <Text style={styles.statLabel}>Best Score</Text>
          <Text style={styles.statValue}>{stats.bestScore}</Text>
        </View>

        <View style={styles.statBox}>
          <Flame size={13} color="#F97316" fill="#F97316" />
          <Text style={styles.statLabel}>Best Streak</Text>
          <Text style={styles.statValue}>{stats.bestStreak}</Text>
        </View>

        <View style={styles.statBox}>
          <Zap size={13} color="#A855F7" />
          <Text style={styles.statLabel}>Difficulty</Text>
          <Text style={styles.statValue}>Auto</Text>
        </View>
      </View>

      {/* Centered Preview Board (Fully visible, non-cropped) */}
      <View style={styles.boardWrapper}>
        <ChessBoard
          chess={chess}
          fen={chess.fen()}
          orientation="w"
          boardTheme={settings.boardTheme}
          pieceTheme={settings.pieceTheme}
          disabled={true}
          isCardView={true}
          maxBoardWidth={320}
        />
      </View>

      {/* Bottom Start Action Button */}
      <Pressable style={styles.startBtn} onPress={onStartRush}>
        <View style={styles.btnContent}>
          <Zap size={16} color="#000000" fill="#000000" />
          <Text style={styles.startBtnText}>START RUSH</Text>
        </View>
        <ChevronRight size={18} color="#000000" />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 20,
    backgroundColor: "#0D0E15",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 16,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  cardPressed: {
    opacity: 0.95,
    borderColor: "#D4AF37",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  offlineText: {
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  livesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  livesBadgeEmpty: {
    backgroundColor: "rgba(113, 113, 122, 0.12)",
    borderColor: "rgba(113, 113, 122, 0.3)",
  },
  livesText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "bold",
  },
  livesTextEmpty: {
    color: "#A1A1AA",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
  },
  statLabel: {
    color: "#71717A",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 1,
  },
  boardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    width: "100%",
  },
  startBtn: {
    marginTop: 14,
    backgroundColor: "#D4AF37",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  startBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
