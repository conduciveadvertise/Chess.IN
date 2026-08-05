import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import {
  Globe,
  Users,
  Bot,
  Puzzle,
  LineChart,
  BookOpen,
  Trophy,
  Crown,
  User,
  Zap,
  Clock,
  Swords,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import { UserProfile } from "../types/chess";

interface HomeViewProps {
  onSelectMode: (mode: any, timeControl?: string) => void;
  user?: UserProfile;
}

const QUICK_PAIRINGS = [
  { label: "1+0", type: "Bullet", cat: "bullet" },
  { label: "2+1", type: "Bullet", cat: "bullet" },
  { label: "3+0", type: "Blitz", cat: "blitz" },
  { label: "3+2", type: "Blitz", cat: "blitz" },
  { label: "5+0", type: "Blitz", cat: "blitz" },
  { label: "5+3", type: "Blitz", cat: "blitz" },
  { label: "10+0", type: "Rapid", cat: "rapid" },
  { label: "10+5", type: "Rapid", cat: "rapid" },
  { label: "15+10", type: "Rapid", cat: "rapid" },
  { label: "30+0", type: "Classical", cat: "classical" },
  { label: "Custom", type: "Setup", cat: "custom" },
];

export const HomeView: React.FC<HomeViewProps> = ({ onSelectMode, user }) => {
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>("3+0");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  const navItems = [
    {
      id: "online",
      title: "Play Online",
      sub: "Live ranked matches with global players",
      icon: Globe,
      accent: "#D4AF37",
    },
    {
      id: "pass_and_play",
      title: "Play Friend",
      sub: "Pass & play on a shared screen or invite",
      icon: Users,
      accent: "#38BDF8",
    },
    {
      id: "vs_ai",
      title: "Play Computer",
      sub: "Engine bots from beginner to Stockfish 16",
      icon: Bot,
      accent: "#A855F7",
    },
    {
      id: "puzzle",
      title: "Puzzles",
      sub: "Daily tactical puzzles & rating storm",
      icon: Puzzle,
      accent: "#F59E0B",
    },
    {
      id: "analysis",
      title: "Analysis",
      sub: "Deep evaluation board & PGN inspector",
      icon: LineChart,
      accent: "#10B981",
    },
    {
      id: "learn",
      title: "Learn",
      sub: "Interactive lessons, openings & drills",
      icon: BookOpen,
      accent: "#6366F1",
    },
    {
      id: "tournaments",
      title: "Tournaments",
      sub: "Arena & Swiss championship leagues",
      icon: Trophy,
      accent: "#EC4899",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      sub: "World standings & grandmaster rankings",
      icon: Crown,
      accent: "#EAB308",
    },
    {
      id: "profile",
      title: "Profile",
      sub: "Your stats, match history & rating graph",
      icon: User,
      accent: "#94A3B8",
    },
  ];

  const handlePairingClick = (label: string) => {
    if (label === "Custom") {
      setIsCustomModalOpen(true);
    } else {
      setSelectedTimeControl(label);
      onSelectMode("online", label);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand & User Greeting Header */}
      <View style={styles.headerRow}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <Crown size={22} color="#D4AF37" />
          </View>
          <View>
            <Text style={styles.brandTitle}>CHESS<Text style={styles.brandTitleIn}>.IN</Text></Text>
            <Text style={styles.brandSubtitle}>GRANDMASTER ARENA</Text>
          </View>
        </View>

        {user && (
          <Pressable style={styles.userCard} onPress={() => onSelectMode("profile")}>
            <Text style={styles.userRating}>
              {user.rating?.rapid || 1500} <Text style={styles.userLabel}>ELO</Text>
            </Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name || "Player"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Hero PLAY CTA Button */}
      <Pressable
        style={({ pressed }) => [
          styles.mainPlayButton,
          pressed && styles.mainPlayButtonPressed,
        ]}
        onPress={() => onSelectMode("online", selectedTimeControl)}
      >
        <View style={styles.playBtnInner}>
          <View style={styles.playIconCircle}>
            <Swords size={28} color="#0D0E15" />
          </View>
          <View style={styles.playTextGroup}>
            <Text style={styles.mainPlayTitle}>PLAY CHESS</Text>
            <Text style={styles.mainPlaySub}>
              Quick Online Pairing ({selectedTimeControl})
            </Text>
          </View>
        </View>
        <ChevronRight size={26} color="#0D0E15" />
      </Pressable>

      {/* Quick Pairing Grid Section */}
      <View style={styles.sectionHeader}>
        <Zap size={16} color="#D4AF37" />
        <Text style={styles.sectionTitle}>QUICK PAIRING</Text>
      </View>

      <View style={styles.pairingGrid}>
        {QUICK_PAIRINGS.map((item) => {
          const isSelected = selectedTimeControl === item.label;
          return (
            <Pressable
              key={item.label}
              onPress={() => handlePairingClick(item.label)}
              style={[
                styles.pairingCard,
                isSelected && styles.pairingCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.pairingTimeText,
                  isSelected && styles.pairingTimeTextSelected,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.pairingCatText,
                  isSelected && styles.pairingCatTextSelected,
                ]}
              >
                {item.type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Primary Navigation / Modes List */}
      <View style={styles.sectionHeader}>
        <Sparkles size={16} color="#D4AF37" />
        <Text style={styles.sectionTitle}>ARENAS & MODES</Text>
      </View>

      <View style={styles.navList}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectMode(item.id)}
              style={({ pressed }) => [
                styles.navCard,
                pressed && styles.navCardPressed,
              ]}
            >
              <View style={[styles.navIconBox, { borderColor: `${item.accent}40` }]}>
                <IconComponent size={20} color={item.accent} />
              </View>

              <View style={styles.navTextGroup}>
                <Text style={styles.navTitle}>{item.title}</Text>
                <Text style={styles.navSub}>{item.sub}</Text>
              </View>

              <ChevronRight size={18} color="rgba(255,255,255,0.25)" />
            </Pressable>
          );
        })}
      </View>

      {/* Custom Time Control Modal */}
      <Modal visible={isCustomModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>CUSTOM TIME CONTROL</Text>
            <Text style={styles.modalSub}>Select custom match parameters</Text>

            <View style={styles.customOptions}>
              {["3+0", "5+3", "10+0", "15+10"].map((tc) => (
                <Pressable
                  key={tc}
                  style={styles.customOptBtn}
                  onPress={() => {
                    setSelectedTimeControl(tc);
                    setIsCustomModalOpen(false);
                    onSelectMode("online", tc);
                  }}
                >
                  <Clock size={16} color="#D4AF37" />
                  <Text style={styles.customOptText}>{tc} Ranked</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.closeModalBtn}
              onPress={() => setIsCustomModalOpen(false)}
            >
              <Text style={styles.closeModalText}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08090D",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  brandTitleIn: {
    color: "#D4AF37",
  },
  brandSubtitle: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  userCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "flex-end",
  },
  userRating: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
  },
  userLabel: {
    fontSize: 10,
    color: "#A1A1AA",
  },
  userName: {
    color: "#E4E4E7",
    fontSize: 11,
    maxWidth: 90,
  },
  mainPlayButton: {
    backgroundColor: "#D4AF37",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  mainPlayButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  playBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  playIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(13, 14, 21, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  playTextGroup: {
    justifyContent: "center",
  },
  mainPlayTitle: {
    color: "#0D0E15",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mainPlaySub: {
    color: "rgba(13, 14, 21, 0.75)",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  pairingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  pairingCard: {
    width: (Dimensions.get("window").width - 52) / 3,
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pairingCardSelected: {
    backgroundColor: "rgba(212, 175, 55, 0.18)",
    borderColor: "#D4AF37",
  },
  pairingTimeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  pairingTimeTextSelected: {
    color: "#D4AF37",
  },
  pairingCatText: {
    color: "#71717A",
    fontSize: 10,
    marginTop: 2,
  },
  pairingCatTextSelected: {
    color: "#FEF3C7",
  },
  navList: {
    gap: 10,
  },
  navCard: {
    backgroundColor: "rgba(18, 20, 29, 0.65)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  navCardPressed: {
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navTextGroup: {
    flex: 1,
  },
  navTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  navSub: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
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
    borderColor: "rgba(212, 175, 55, 0.5)",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modalSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  customOptions: {
    width: "100%",
    gap: 8,
    marginBottom: 16,
  },
  customOptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 12,
  },
  customOptText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  closeModalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeModalText: {
    color: "#71717A",
    fontSize: 12,
    fontWeight: "bold",
  },
});
