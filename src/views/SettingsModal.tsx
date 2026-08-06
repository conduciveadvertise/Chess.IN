import React, { useState } from "react";
import { View, Text, Pressable, Switch, StyleSheet, Modal, ScrollView } from "react-native";
import { X, Volume2, SlidersHorizontal, Palette, Bot, Globe, Shield, Info, Crown, UserCheck, BarChart3, BatteryCharging } from "lucide-react-native";
import { GameSettings, BoardTheme, PieceTheme } from "../types/chess";
import { soundManager } from "../services/sound";

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"gameplay" | "about" | "privacy">("gameplay");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [playSide, setPlaySide] = useState<"w" | "b" | "random">("w");
  const [difficultyLevel, setDifficultyLevel] = useState<number>(10);

  const soundPacks: Array<{ id: "classic" | "modern" | "metallic"; name: string }> = [
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "metallic", name: "Metallic" },
  ];

  const boardThemes: Array<{ id: BoardTheme; name: string }> = [
    { id: "slate", name: "Slate" },
    { id: "gold", name: "Gold" },
    { id: "emerald", name: "Emerald" },
    { id: "cyber", name: "Dark Cyber" },
  ];

  const pieceThemes: Array<{ id: PieceTheme; name: string }> = [
    { id: "neo_staunton", name: "Neo Staunton" },
    { id: "merida", name: "Merida" },
    { id: "alpha", name: "Alpha" },
    { id: "california", name: "California" },
    { id: "leipzig", name: "Leipzig" },
    { id: "chessnut", name: "Chessnut" },
    { id: "maestro", name: "Maestro" },
    { id: "cburnett", name: "Cburnett" },
    { id: "pirouetti", name: "Pirouetti" },
    { id: "staunty", name: "Staunty" },
  ];

  const languages = ["English", "Español", "Français", "Deutsch", "हिन्दी"];

  const difficulties = [
    { lvl: 1, label: "Beginner" },
    { lvl: 5, label: "Casual" },
    { lvl: 10, label: "Club" },
    { lvl: 15, label: "Master" },
    { lvl: 20, label: "Grandmaster" },
  ];

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <SlidersHorizontal size={18} color="#D4AF37" />
              <Text style={styles.title}>Game Preferences</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#A1A1AA" />
            </Pressable>
          </View>

          {/* Modal Navigation Tabs */}
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tabItem, activeTab === "gameplay" && styles.activeTabItem]}
              onPress={() => setActiveTab("gameplay")}
            >
              <Text style={[styles.tabText, activeTab === "gameplay" && styles.activeTabText]}>
                Settings
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabItem, activeTab === "about" && styles.activeTabItem]}
              onPress={() => setActiveTab("about")}
            >
              <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>
                About
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabItem, activeTab === "privacy" && styles.activeTabItem]}
              onPress={() => setActiveTab("privacy")}
            >
              <Text style={[styles.tabText, activeTab === "privacy" && styles.activeTabText]}>
                Privacy
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {activeTab === "gameplay" && (
              <View style={styles.sectionGap}>
                {/* Sound On / Off */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabelRow}>
                    <Volume2 size={16} color="#D4AF37" />
                    <Text style={styles.toggleText}>Sound Effects</Text>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={(val) => {
                      soundManager.enabled = val;
                      onUpdateSettings({ soundEnabled: val });
                    }}
                    trackColor={{ false: "#27272A", true: "#D4AF37" }}
                  />
                </View>

                {/* Show Evaluation Bar On / Off */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabelRow}>
                    <BarChart3 size={16} color="#D4AF37" />
                    <Text style={styles.toggleText}>Show Evaluation Bar</Text>
                  </View>
                  <Switch
                    value={settings.showEvalBar}
                    onValueChange={(val) => {
                      onUpdateSettings({ showEvalBar: val });
                    }}
                    trackColor={{ false: "#27272A", true: "#D4AF37" }}
                  />
                </View>

                {/* Low Power Mode On / Off */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabelRow}>
                    <BatteryCharging size={16} color="#D4AF37" />
                    <View style={{ gap: 2 }}>
                      <Text style={styles.toggleText}>Low Power Mode</Text>
                      <Text style={{ color: "#71717A", fontSize: 10 }}>
                        Saves battery by disabling heavy move animations & limiting Stockfish depth
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={Boolean(settings.lowPowerMode)}
                    onValueChange={(val) => {
                      onUpdateSettings({ lowPowerMode: val });
                    }}
                    trackColor={{ false: "#27272A", true: "#D4AF37" }}
                  />
                </View>

                {/* Sound Pack Selector */}
                {settings.soundEnabled && (
                  <>
                    <Text style={styles.sectionLabel}>SOUND PACK</Text>
                    <View style={styles.themeGrid}>
                      {soundPacks.map((pack) => {
                        const active = (settings.soundPack || "classic") === pack.id;
                        return (
                          <Pressable
                            key={pack.id}
                            onPress={() => {
                              soundManager.soundPack = pack.id;
                              onUpdateSettings({ soundPack: pack.id });
                              soundManager.playMove();
                            }}
                            style={[styles.themeChip, active && styles.activeThemeChip]}
                          >
                            <Text style={[styles.themeText, active && styles.activeThemeText]}>
                              {pack.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Board Theme */}
                <Text style={styles.sectionLabel}>BOARD THEME</Text>
                <View style={styles.themeGrid}>
                  {boardThemes.map((theme) => (
                    <Pressable
                      key={theme.id}
                      onPress={() => onUpdateSettings({ boardTheme: theme.id })}
                      style={[
                        styles.themeChip,
                        settings.boardTheme === theme.id && styles.activeThemeChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeText,
                          settings.boardTheme === theme.id && styles.activeThemeText,
                        ]}
                      >
                        {theme.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Piece Theme */}
                <Text style={styles.sectionLabel}>PIECE THEME</Text>
                <View style={styles.themeGrid}>
                  {pieceThemes.map((piece) => (
                    <Pressable
                      key={piece.id}
                      onPress={() => onUpdateSettings({ pieceTheme: piece.id })}
                      style={[
                        styles.themeChip,
                        settings.pieceTheme === piece.id && styles.activeThemeChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeText,
                          settings.pieceTheme === piece.id && styles.activeThemeText,
                        ]}
                      >
                        {piece.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Difficulty */}
                <Text style={styles.sectionLabel}>COMPUTER DIFFICULTY</Text>
                <View style={styles.diffGrid}>
                  {difficulties.map((d) => (
                    <Pressable
                      key={d.lvl}
                      onPress={() => setDifficultyLevel(d.lvl)}
                      style={[
                        styles.diffChip,
                        difficultyLevel === d.lvl && styles.activeDiffChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffText,
                          difficultyLevel === d.lvl && styles.activeDiffText,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Play Side */}
                <Text style={styles.sectionLabel}>DEFAULT PLAY SIDE</Text>
                <View style={styles.sideGrid}>
                  {[
                    { id: "w", label: "White" },
                    { id: "b", label: "Black" },
                    { id: "random", label: "Random" },
                  ].map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => setPlaySide(s.id as any)}
                      style={[
                        styles.sideChip,
                        playSide === s.id && styles.activeSideChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sideText,
                          playSide === s.id && styles.activeSideText,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Language Selection */}
                <Text style={styles.sectionLabel}>APP LANGUAGE</Text>
                <View style={styles.langRow}>
                  {languages.map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => setSelectedLanguage(lang)}
                      style={[
                        styles.langChip,
                        selectedLanguage === lang && styles.activeLangChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.langText,
                          selectedLanguage === lang && styles.activeLangText,
                        ]}
                      >
                        {lang}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {activeTab === "about" && (
              <View style={styles.infoCard}>
                <View style={styles.infoIconRow}>
                  <Crown size={28} color="#D4AF37" />
                  <Text style={styles.infoTitle}>CHESS.IN</Text>
                </View>
                <Text style={styles.infoVersion}>Version 1.0.0 (Grandmaster Edition)</Text>
                <Text style={styles.infoDesc}>
                  CHESS.IN is a modern, responsive chess platform built for players of all skill levels.
                  Play. Learn. Master. Powered by high-quality open-source vector chess piece themes and Stockfish analysis.
                </Text>
              </View>
            )}

            {activeTab === "privacy" && (
              <View style={styles.infoCard}>
                <View style={styles.infoIconRow}>
                  <Shield size={24} color="#D4AF37" />
                  <Text style={styles.infoTitle}>Privacy Policy</Text>
                </View>
                <Text style={styles.infoDesc}>
                  Your privacy is paramount. CHESS.IN stores move histories and preference settings locally or on secure cloud databases without collecting intrusive personal identifiers or displaying third-party ads.
                </Text>
              </View>
            )}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save & Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 16,
  },
  content: {
    backgroundColor: "#0D0E15",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    padding: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 4,
    marginVertical: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  tabText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#D4AF37",
  },
  scrollBody: {
    maxHeight: 380,
  },
  sectionGap: {
    gap: 14,
  },
  sectionLabel: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeChip: {
    flex: 1,
    minWidth: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  activeThemeChip: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  themeText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "bold",
  },
  activeThemeText: {
    color: "#D4AF37",
  },
  diffGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  diffChip: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeDiffChip: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  diffText: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  activeDiffText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  sideGrid: {
    flexDirection: "row",
    gap: 8,
  },
  sideChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activeSideChip: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  sideText: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  activeSideText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  langChip: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeLangChip: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderColor: "#D4AF37",
  },
  langText: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  activeLangText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  toggleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },
  infoIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoVersion: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  infoDesc: {
    color: "#D4D4D8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  saveBtnText: {
    color: "#08090D",
    fontWeight: "bold",
    fontSize: 13,
  },
});
