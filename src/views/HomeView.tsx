import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { PuzzleRushCard } from "../components/PuzzleRushCard";
import { GameSettings } from "../types/chess";
import {
  Bot,
  Users,
  Crown,
  ChevronRight,
  Play,
  Lock,
} from "lucide-react-native";

export interface BotLevelConfig {
  level: number;
  title: string;
  difficulty: string;
  description: string;
}

export const BOT_LEVELS: BotLevelConfig[] = [
  { level: 1, title: "Level 1", difficulty: "Beginner", description: "Novice AI • Instant moves" },
  { level: 2, title: "Level 2", difficulty: "Easy", description: "Casual play • Gentle challenge" },
  { level: 3, title: "Level 3", difficulty: "Easy+", description: "Basic tactics • Low depth" },
  { level: 4, title: "Level 4", difficulty: "Casual", description: "Developing piece play" },
  { level: 5, title: "Level 5", difficulty: "Normal", description: "Solid fundamentals" },
  { level: 6, title: "Level 6", difficulty: "Normal+", description: "Pawn structure awareness" },
  { level: 7, title: "Level 7", difficulty: "Club", description: "Basic tactical patterns" },
  { level: 8, title: "Level 8", difficulty: "Club+", description: "Calculates short combinations" },
  { level: 9, title: "Level 9", difficulty: "Intermediate", description: "Positional play" },
  { level: 10, title: "Level 10", difficulty: "Strong Club", description: "Solid club player" },
  { level: 11, title: "Level 11", difficulty: "Advanced", description: "Sharper tactical depth" },
  { level: 12, title: "Level 12", difficulty: "Advanced+", description: "Endgame proficiency" },
  { level: 13, title: "Level 13", difficulty: "Expert", description: "Complex calculation" },
  { level: 14, title: "Level 14", difficulty: "Expert+", description: "Candidate Master level" },
  { level: 15, title: "Level 15", difficulty: "Master", description: "Near-flawless tactical sight" },
  { level: 16, title: "Level 16", difficulty: "Master+", description: "Deep positional engine" },
  { level: 17, title: "Level 17", difficulty: "Grandmaster", description: "Relentless engine sight" },
  { level: 18, title: "Level 18", difficulty: "Grandmaster+", description: "Grandmaster strength" },
  { level: 19, title: "Level 19", difficulty: "Super GM", description: "Elite Stockfish power" },
  { level: 20, title: "Level 20", difficulty: "Maximum Engine", description: "Maximum Engine Depth" },
];

interface HomeViewProps {
  settings: GameSettings;
  onSelectMode: (mode: string, level?: number) => void;
  onOpenSettings?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  onSelectMode,
  onOpenSettings,
}) => {
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chess_in_max_unlocked_level");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          setMaxUnlockedLevel(parsed);
        }
      }
    } catch (e) {
      // fallback to 1
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* App Logo & Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Crown size={28} color="#D4AF37" />
        </View>
        <View style={styles.brandTextGroup}>
          <Text style={styles.brandName}>
            CHESS<Text style={styles.brandNameIn}>.IN</Text>
          </Text>
          <Text style={styles.brandTagline}>Play. Learn. Master.</Text>
        </View>
      </View>

      {/* SECTION 1: BOT LEVELS (Horizontal Swipe Carousel) */}
      <View style={styles.sectionHeader}>
        <Bot size={16} color="#D4AF37" />
        <Text style={styles.sectionTitle}>BOT LEVELS</Text>
      </View>

      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          snapToInterval={212}
          snapToAlignment="start"
        >
          {BOT_LEVELS.map((bot, index) => {
            const isLocked = bot.level > maxUnlockedLevel;
            const isLast = index === BOT_LEVELS.length - 1;

            return (
              <View
                key={bot.level}
                style={[
                  styles.botCard,
                  isLocked && styles.botCardLocked,
                  { marginRight: isLast ? 16 : 12 },
                ]}
              >
                <View style={styles.botCardHeader}>
                  <View
                    style={[
                      styles.botIconBox,
                      isLocked && styles.botIconBoxLocked,
                    ]}
                  >
                    <Bot size={22} color={isLocked ? "#71717A" : "#D4AF37"} />
                  </View>
                  {isLocked && (
                    <View style={styles.lockBadge}>
                      <Lock size={12} color="#71717A" />
                    </View>
                  )}
                </View>

                <Text style={[styles.botLevelTitle, isLocked && styles.textLocked]}>
                  {bot.title}
                </Text>
                <Text style={[styles.botDifficulty, isLocked && styles.textLockedSub]}>
                  {bot.difficulty}
                </Text>
                <Text style={[styles.botDesc, isLocked && styles.textLockedSub]} numberOfLines={2}>
                  {isLocked ? "Locked • Beat Level " + (bot.level - 1) + " to unlock" : bot.description}
                </Text>

                <Pressable
                  disabled={isLocked}
                  style={({ pressed }) => [
                    styles.playBtn,
                    isLocked && styles.playBtnLocked,
                    pressed && !isLocked && styles.playBtnPressed,
                  ]}
                  onPress={() => !isLocked && onSelectMode("vs_ai", bot.level)}
                >
                  {isLocked ? (
                    <>
                      <Lock size={14} color="#71717A" />
                      <Text style={styles.playBtnTextLocked}>Locked</Text>
                    </>
                  ) : (
                    <>
                      <Play size={14} color="#06070B" fill="#06070B" />
                      <Text style={styles.playBtnText}>Play</Text>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* SECTION 2: PLAY FRIEND (Pass & Play) */}
      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <Users size={16} color="#38BDF8" />
        <Text style={styles.sectionTitle}>LOCAL MULTIPLAYER</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.friendCard,
          pressed && styles.friendCardPressed,
        ]}
        onPress={() => onSelectMode("pass_and_play")}
      >
        <View style={styles.friendLeft}>
          <View style={styles.friendIconBox}>
            <Users size={22} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.friendTitle}>Play Friend</Text>
            <Text style={styles.friendSub}>Pass & Play on 1 Device</Text>
          </View>
        </View>
        <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
      </Pressable>

      {/* Puzzle Rush Section */}
      <PuzzleRushCard
        settings={settings}
        onStartRush={() => onSelectMode("puzzle_rush")}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06070B",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextGroup: {
    flex: 1,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  brandNameIn: {
    color: "#D4AF37",
  },
  brandTagline: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  carouselWrapper: {
    marginHorizontal: -16,
  },
  carouselContent: {
    paddingLeft: 16,
    paddingRight: 0,
    flexDirection: "row",
  },
  botCard: {
    width: 200,
    backgroundColor: "rgba(18, 20, 29, 0.85)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    padding: 16,
    gap: 6,
  },
  botCardLocked: {
    backgroundColor: "rgba(18, 20, 29, 0.45)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  botCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  botIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  botIconBoxLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  lockBadge: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  botLevelTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  textLocked: {
    color: "#71717A",
  },
  botDifficulty: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "600",
  },
  textLockedSub: {
    color: "#52525B",
  },
  botDesc: {
    color: "#A1A1AA",
    fontSize: 11,
    height: 32,
    marginTop: 2,
  },
  playBtn: {
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  playBtnLocked: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  playBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  playBtnText: {
    color: "#06070B",
    fontWeight: "bold",
    fontSize: 13,
  },
  playBtnTextLocked: {
    color: "#71717A",
    fontWeight: "bold",
    fontSize: 13,
  },
  friendCard: {
    backgroundColor: "rgba(18, 20, 29, 0.85)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendCardPressed: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "#38BDF8",
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  friendIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  friendTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  friendSub: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
});
