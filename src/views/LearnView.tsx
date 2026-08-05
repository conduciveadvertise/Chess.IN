import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { soundManager } from "../services/sound";
import { ChessBoard } from "../components/ChessBoard";
import { GameSettings, UserProfile } from "../types/chess";
import { learningRepository } from "../repositories/LearningRepository";
import { LessonRecord, OpeningInfoExtended, MissionRecord, AchievementRecord } from "../types/learning";
import {
  BookOpen,
  ChevronLeft,
  Compass,
  Award,
  Trophy,
  Zap,
  CheckCircle,
} from "lucide-react-native";

interface LearnViewProps {
  user?: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ user, settings, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<"academy" | "explorer" | "missions">("academy");

  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "intermediate" | "advanced" | "grandmaster">("beginner");
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [chess] = useState<Chess>(() => new Chess());
  const [completedLesson, setCompletedLesson] = useState<boolean>(false);

  const [openings, setOpenings] = useState<OpeningInfoExtended[]>([]);
  const [selectedOpening, setSelectedOpening] = useState<OpeningInfoExtended | null>(null);

  const [missions, setMissions] = useState<MissionRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);

  useEffect(() => {
    learningRepository.getLessons(selectedLevel).then((data) => {
      setLessons(data);
      if (data.length > 0) {
        setActiveLessonIndex(0);
        chess.load(data[0].fen);
        setCompletedLesson(false);
      }
    });

    learningRepository.getOpeningExplorer().then((data) => {
      setOpenings(data);
      if (data.length > 0) setSelectedOpening(data[0]);
    });

    learningRepository.getMissions().then(setMissions);
    learningRepository.getAchievements().then(setAchievements);
  }, [selectedLevel, chess]);

  const handleLessonMove = (from: string, to: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: "q" });
      if (moveObj) {
        setCompletedLesson(true);
        soundManager.playVictory();
      }
    } catch (e) {
      console.log("Lesson move error", e);
    }
  };

  const activeLesson = lessons[activeLessonIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Academy</Text>
        </Pressable>

        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab("academy")}
            style={[styles.tabBtn, activeTab === "academy" && styles.activeTabBtn]}
          >
            <Text style={[styles.tabBtnText, activeTab === "academy" && styles.activeTabBtnText]}>
              Lessons
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("explorer")}
            style={[styles.tabBtn, activeTab === "explorer" && styles.activeTabBtn]}
          >
            <Text style={[styles.tabBtnText, activeTab === "explorer" && styles.activeTabBtnText]}>
              Openings
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("missions")}
            style={[styles.tabBtn, activeTab === "missions" && styles.activeTabBtn]}
          >
            <Text style={[styles.tabBtnText, activeTab === "missions" && styles.activeTabBtnText]}>
              Missions
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ACADEMY LESSONS */}
      {activeTab === "academy" && (
        <View style={styles.layout}>
          {/* Level selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.levelScroll}>
            {(["beginner", "intermediate", "advanced", "grandmaster"] as const).map((lvl) => (
              <Pressable
                key={lvl}
                onPress={() => setSelectedLevel(lvl)}
                style={[styles.levelChip, selectedLevel === lvl && styles.activeLevelChip]}
              >
                <Text style={[styles.levelText, selectedLevel === lvl && styles.activeLevelText]}>
                  {lvl}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeLesson && (
            <View style={styles.lessonCard}>
              <Text style={styles.lessonTitle}>{activeLesson.title}</Text>
              <Text style={styles.lessonBody}>{activeLesson.explanation}</Text>

              {completedLesson && (
                <View style={styles.successBox}>
                  <CheckCircle size={16} color="#34D399" />
                  <Text style={styles.successText}>Lesson Completed! +{activeLesson.xpReward} XP</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.boardWrap}>
            <ChessBoard
              chess={chess}
              boardTheme={settings.boardTheme}
              pieceTheme={settings.pieceTheme}
              orientation="w"
              highlightLegalMoves={settings.highlightLegalMoves}
              onMove={handleLessonMove}
            />
          </View>
        </View>
      )}

      {/* OPENING EXPLORER */}
      {activeTab === "explorer" && (
        <View style={styles.layout}>
          {openings.map((op) => (
            <Pressable
              key={op.id}
              onPress={() => setSelectedOpening(op)}
              style={[
                styles.openingCard,
                selectedOpening?.id === op.id && styles.activeOpeningCard,
              ]}
            >
              <Text style={styles.openingEco}>{op.eco}</Text>
              <Text style={styles.openingName}>{op.name}</Text>
              <Text style={styles.openingPgn}>{op.pgnMoves}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* MISSIONS */}
      {activeTab === "missions" && (
        <View style={styles.layout}>
          <Text style={styles.sectionTitle}>Daily Missions</Text>
          {missions.map((m) => (
            <View key={m.id} style={styles.missionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.missionTitle}>{m.title}</Text>
                <Text style={styles.missionBody}>{m.description}</Text>
              </View>
              <Text style={styles.missionXp}>+{m.xpReward} XP</Text>
            </View>
          ))}
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
  layout: {
    gap: 14,
  },
  levelScroll: {
    marginBottom: 4,
  },
  levelChip: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  activeLevelChip: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  levelText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  activeLevelText: {
    color: "#000",
  },
  lessonCard: {
    backgroundColor: "rgba(13, 14, 21, 0.95)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 18,
    gap: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  lessonTitle: {
    color: "#D4AF37",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  lessonBody: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(6, 78, 59, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  successText: {
    color: "#6EE7B7",
    fontSize: 12,
    fontWeight: "bold",
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  openingCard: {
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    gap: 4,
  },
  activeOpeningCard: {
    borderColor: "#D4AF37",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  openingEco: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
  },
  openingName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  openingPgn: {
    color: "#71717A",
    fontSize: 12,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    borderRadius: 16,
  },
  missionTitle: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  missionBody: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
  missionXp: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
});
