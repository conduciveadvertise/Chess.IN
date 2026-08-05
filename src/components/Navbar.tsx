import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import {
  Crown,
  Flame,
  Settings,
  User,
  Trophy,
  BookOpen,
  Swords,
  Bot,
  Puzzle,
  BarChart3,
  Home,
  Users,
  Menu,
  X,
  Bell,
  Clock,
  Sparkles,
  Award,
  Shield,
  ChevronRight,
} from "lucide-react-native";
import { GameMode, UserProfile } from "../types/chess";

interface NavbarProps {
  currentMode: GameMode | "home" | "leaderboard" | "profile" | "tournaments";
  onSelectMode: (mode: any) => void;
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenAuth?: () => void;
  onOpenSocial?: () => void;
  unreadSocialCount?: number;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  user,
  onOpenSettings,
  onOpenAuth,
  onOpenSocial,
  unreadSocialCount = 0,
  isAuthenticated,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isPlayMenuOpen, setIsPlayMenuOpen] = useState<boolean>(false);

  const handleNavClick = (mode: any) => {
    onSelectMode(mode);
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleSocialClick = () => {
    if (onOpenSocial) onOpenSocial();
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      onSelectMode("profile");
    } else if (onOpenAuth) {
      onOpenAuth();
    }
    setIsDrawerOpen(false);
    setIsPlayMenuOpen(false);
  };

  return (
    <>
      {/* Mobile & Desktop Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerContainer}>
          {/* Brand Logo */}
          <Pressable onPress={() => handleNavClick("home")} style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Crown size={16} color="#000" />
            </View>
            <View>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandText}>CHESS.IN</Text>
                <View style={styles.proPill}>
                  <Text style={styles.proText}>GRANDMASTER</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* User Profile & Actions */}
          <View style={styles.headerActions}>
            {/* Streak */}
            <View style={styles.streakBadge}>
              <Flame size={12} color="#D4AF37" />
              <Text style={styles.streakText}>{user.dailyStreak || 5}d</Text>
            </View>

            {/* Profile Avatar */}
            <Pressable onPress={handleAuthClick} style={styles.profileBtn}>
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            </Pressable>

            {/* Social Hub Icon */}
            {Boolean(onOpenSocial) && (
              <Pressable onPress={handleSocialClick} style={styles.iconBtn}>
                <Users size={15} color="#E4E4E7" />
                {unreadSocialCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadSocialCount}</Text>
                  </View>
                )}
              </Pressable>
            )}

            {/* Hamburger Trigger */}
            <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.menuBtn}>
              <Menu size={16} color="#D4AF37" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* MOBILE BOTTOM 3-TAB + MORE NAVIGATION */}
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
              (["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen) &&
                styles.activeBottomTab,
            ]}
          >
            <Swords
              size={18}
              color={
                ["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen
                  ? "#D4AF37"
                  : "#A1A1AA"
              }
            />
            <Text
              style={[
                styles.bottomTabText,
                (["online", "vs_ai", "pass_and_play"].includes(currentMode) || isPlayMenuOpen) &&
                  styles.activeBottomText,
              ]}
            >
              Play
            </Text>
          </Pressable>

          {/* Tab 3: Social */}
          <Pressable onPress={handleSocialClick} style={styles.bottomTab}>
            <View style={{ position: "relative" }}>
              <Users size={18} color="#A1A1AA" />
              {unreadSocialCount > 0 && (
                <View style={styles.bottomUnreadDot}>
                  <Text style={styles.bottomUnreadText}>{unreadSocialCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.bottomTabText}>Social</Text>
          </Pressable>

          {/* Tab 4: More */}
          <Pressable onPress={() => setIsDrawerOpen(true)} style={styles.bottomTab}>
            <Menu size={18} color="#A1A1AA" />
            <Text style={styles.bottomTabText}>More</Text>
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

            <Pressable onPress={() => handleNavClick("online")} style={styles.playOptionGold}>
              <View style={styles.playOptionIconBoxGold}>
                <Swords size={16} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Play Online</Text>
                <Text style={styles.playOptionSub}>Live Matchmaking & Rated Speed Chess</Text>
              </View>
              <ChevronRight size={16} color="#D4AF37" />
            </Pressable>

            <Pressable onPress={() => handleNavClick("vs_ai")} style={styles.playOptionDark}>
              <View style={styles.playOptionIconBoxGreen}>
                <Bot size={16} color="#000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.playOptionTitle}>Play vs Stockfish AI</Text>
                <Text style={styles.playOptionSub}>Adaptive Levels & Grandmaster Bots</Text>
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

      {/* SLIDE-OUT DRAWER */}
      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerCard}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserRow}>
                <Image source={{ uri: user.avatar }} style={styles.drawerAvatar} />
                <View>
                  <Text style={styles.drawerUserName}>{user.name}</Text>
                  <Text style={styles.drawerUserMeta}>
                    {user.rating.rapid} ELO • {user.dailyStreak}d Streak
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setIsDrawerOpen(false)} style={styles.closeBtn}>
                <X size={16} color="#A1A1AA" />
              </Pressable>
            </View>

            {/* Menu Sections */}
            <ScrollView style={styles.drawerScroll}>
              <Text style={styles.sectionHeader}>PLAY & COMPETE</Text>
              <Pressable onPress={() => handleNavClick("tournaments")} style={styles.drawerItem}>
                <Trophy size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Tournaments</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("puzzle")} style={styles.drawerItem}>
                <Puzzle size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Puzzles</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("learn")} style={styles.drawerItem}>
                <BookOpen size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Learn & Academy</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("analysis")} style={styles.drawerItem}>
                <BarChart3 size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Analysis Engine</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("leaderboard")} style={styles.drawerItem}>
                <Award size={16} color="#D4AF37" />
                <Text style={styles.drawerItemText}>Rankings & Global Leaderboard</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>SOCIAL & ACCOUNT</Text>
              <Pressable onPress={handleSocialClick} style={styles.drawerItem}>
                <Bell size={16} color="#F43F5E" />
                <Text style={styles.drawerItemText}>Notifications & Invites</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={() => handleNavClick("profile")} style={styles.drawerItem}>
                <User size={16} color="#60A5FA" />
                <Text style={styles.drawerItemText}>Player Profile</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>

              <Pressable onPress={handleSettingsClick} style={styles.drawerItem}>
                <Settings size={16} color="#A1A1AA" />
                <Text style={styles.drawerItemText}>Preferences & Settings</Text>
                <ChevronRight size={14} color="#71717A" />
              </Pressable>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Pressable onPress={handleAuthClick} style={styles.authBtn}>
                <Text style={styles.authBtnText}>
                  {isAuthenticated ? "Manage Passport Profile" : "Sign In / Register"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    gap: 6,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  proPill: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proText: {
    color: "#D4AF37",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
  profileBtn: {
    borderRadius: 18,
  },
  avatarImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
  },
  iconBtn: {
    padding: 7,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    position: "relative",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#F43F5E",
    borderRadius: 6,
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  menuBtn: {
    padding: 7,
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
  },
  bottomNavRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomTab: {
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 16,
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
  bottomUnreadDot: {
    position: "absolute",
    top: -3,
    right: -6,
    backgroundColor: "#F43F5E",
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  bottomUnreadText: {
    color: "#FFF",
    fontSize: 8,
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
  playOptionIconBoxGold: {
    backgroundColor: "#D4AF37",
    padding: 10,
    borderRadius: 12,
  },
  playOptionIconBoxGreen: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 12,
  },
  playOptionIconBoxPurple: {
    backgroundColor: "#A855F7",
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
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  drawerCard: {
    backgroundColor: "#0A0B10",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.35)",
    maxHeight: "85%",
    padding: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  drawerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  drawerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  drawerUserName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  drawerUserMeta: {
    color: "#D4AF37",
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  drawerScroll: {
    marginVertical: 14,
  },
  sectionHeader: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginVertical: 4,
  },
  drawerItemText: {
    flex: 1,
    color: "#E4E4E7",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 12,
  },
  drawerFooter: {
    paddingTop: 10,
  },
  authBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
  },
  authBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
