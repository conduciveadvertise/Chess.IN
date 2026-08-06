import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  Crown,
  Settings,
  Swords,
  Bot,
  Home,
  X,
  ChevronRight,
  Info,
  Users,
  Zap,
} from "lucide-react-native";

interface NavbarProps {
  currentMode: string;
  onSelectMode: (mode: any, level?: number) => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onOpenSettings,
}) => {
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState<boolean>(false);

  const handleNavClick = (mode: string, level?: number) => {
    onSelectMode(mode, level);
    setIsPlayMenuOpen(false);
  };

  return (
    <>
      {/* Header Navbar */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContainer}>
          {/* Brand Logo */}
          <Pressable onPress={() => handleNavClick("home")} style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Crown size={16} color="#000" />
            </View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandText}>CHESS.IN</Text>
            </View>
          </Pressable>

          {/* Action Settings */}
          <View style={styles.headerActions}>
            <Pressable onPress={onOpenSettings} style={styles.iconBtn}>
              <Settings size={18} color="#D4AF37" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* MOBILE BOTTOM NAVIGATION */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavRow}>
          {/* Tab 1: Home */}
          <Pressable
            onPress={() => handleNavClick("home")}
            style={[styles.bottomTab, currentMode === "home" && styles.activeBottomTab]}
          >
            <Home size={18} color={currentMode === "home" ? "#D4AF37" : "#A1A1AA"} />
            <Text style={[styles.bottomTabText, currentMode === "home" && styles.activeBottomText]}>
              Home
            </Text>
          </Pressable>

          {/* Tab 2: Play */}
          <Pressable
            onPress={() => setIsPlayMenuOpen(!isPlayMenuOpen)}
            style={[
              styles.bottomTab,
              (["vs_ai", "pass_and_play", "puzzle_rush"].includes(currentMode) || isPlayMenuOpen) &&
                styles.activeBottomTab,
            ]}
          >
            <Swords
              size={18}
              color={
                ["vs_ai", "pass_and_play", "puzzle_rush"].includes(currentMode) || isPlayMenuOpen
                  ? "#D4AF37"
                  : "#A1A1AA"
              }
            />
            <Text
              style={[
                styles.bottomTabText,
                (["vs_ai", "pass_and_play", "puzzle_rush"].includes(currentMode) || isPlayMenuOpen) &&
                  styles.activeBottomText,
              ]}
            >
              Play
            </Text>
          </Pressable>

          {/* Tab 3: Settings */}
          <Pressable onPress={onOpenSettings} style={styles.bottomTab}>
            <Settings size={18} color="#A1A1AA" />
            <Text style={styles.bottomTabText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* PLAY MODES MODAL POPUP */}
      <Modal visible={isPlayMenuOpen} transparent animationType="fade">
        <Pressable style={styles.playOverlay} onPress={() => setIsPlayMenuOpen(false)}>
          <View style={styles.playCard}>
            <View style={styles.playHeader}>
              <View style={styles.playHeaderTitleRow}>
                <Swords size={16} color="#D4AF37" />
                <Text style={styles.playHeaderTitle}>Select Game Mode</Text>
              </View>
              <Pressable onPress={() => setIsPlayMenuOpen(false)}>
                <X size={16} color="#A1A1AA" />
              </Pressable>
            </View>

            <Pressable onPress={() => handleNavClick("puzzle_rush")} style={styles.playOptionGold}>
              <View style={styles.playOptionIconBoxGreen}>
                <Zap size={16} color="#000" fill="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Puzzle Rush</Text>
                <Text style={styles.playOptionSub}>Unlimited Offline Tactical Challenges</Text>
              </View>
              <ChevronRight size={16} color="#D4AF37" />
            </Pressable>

            <Pressable onPress={() => handleNavClick("vs_ai")} style={styles.playOptionDark}>
              <View style={styles.playOptionIconBoxPurple}>
                <Bot size={16} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Bot Levels (VS AI)</Text>
                <Text style={styles.playOptionSub}>20 Stockfish Engine Levels</Text>
              </View>
              <ChevronRight size={16} color="#A1A1AA" />
            </Pressable>

            <Pressable onPress={() => handleNavClick("pass_and_play")} style={styles.playOptionDark}>
              <View style={styles.playOptionIconBoxPurple}>
                <Users size={16} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Pass & Play</Text>
                <Text style={styles.playOptionSub}>2 Players on 1 Local Device</Text>
              </View>
              <ChevronRight size={16} color="#A1A1AA" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: "#06070B",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(10, 11, 16, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.2)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#D4AF37",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: "rgba(13, 14, 21, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    borderRadius: 28,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    zIndex: 99,
  },
  bottomNavRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomTab: {
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  activeBottomTab: {},
  bottomTabText: {
    color: "#71717A",
    fontSize: 10,
    fontWeight: "500",
  },
  activeBottomText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  playOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
    padding: 16,
    paddingBottom: 84,
  },
  playCard: {
    backgroundColor: "#0D0E15",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 20,
    gap: 12,
  },
  playHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  playHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playHeaderTitle: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  playOptionGold: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 14,
    borderRadius: 16,
  },
  playOptionDark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    borderRadius: 16,
  },
  playOptionIconBoxGreen: {
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 12,
  },
  playOptionIconBoxPurple: {
    backgroundColor: "#38BDF8",
    padding: 10,
    borderRadius: 12,
  },
  playOptionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  playOptionSub: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
  },
});
