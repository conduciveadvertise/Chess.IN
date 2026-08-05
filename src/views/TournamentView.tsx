import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { tournamentRepository } from "../repositories/TournamentRepository";
import { Tournament, TournamentPlayer } from "../types/tournament";
import { UserProfile, GameSettings } from "../types/chess";
import { Trophy, ChevronLeft, Users, Clock } from "lucide-react-native";

interface TournamentViewProps {
  user: UserProfile;
  settings: GameSettings;
  onBackToHome: () => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  user,
  settings,
  onBackToHome,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTourn, setSelectedTourn] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);

  useEffect(() => {
    tournamentRepository.getTournaments().then(setTournaments);
  }, []);

  useEffect(() => {
    if (selectedTourn) {
      tournamentRepository.getTournamentPlayers(selectedTourn.id).then(setPlayers);
    }
  }, [selectedTourn]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Home</Text>
        </Pressable>

        <View style={styles.badge}>
          <Trophy size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Tournaments</Text>
        </View>
      </View>

      {!selectedTourn ? (
        <View style={styles.layout}>
          <Text style={styles.title}>Tournament Arena</Text>
          {tournaments.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setSelectedTourn(t)}
              style={styles.tournCard}
            >
              <View style={styles.tournHeader}>
                <Text style={styles.tournType}>{t.type.toUpperCase()}</Text>
                <Text style={styles.tournPrize}>₹{t.prizePool} INR</Text>
              </View>
              <Text style={styles.tournTitle}>{t.title}</Text>
              <View style={styles.tournMeta}>
                <View style={styles.metaItem}>
                  <Users size={12} color="#D4AF37" />
                  <Text style={styles.metaText}>{t.playerCount} / {t.maxPlayers}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color="#D4AF37" />
                  <Text style={styles.metaText}>{t.durationMins}m</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.layout}>
          <Pressable onPress={() => setSelectedTourn(null)} style={styles.backLink}>
            <ChevronLeft size={14} color="#D4AF37" />
            <Text style={styles.backLinkText}>Back to Arena</Text>
          </Pressable>

          <Text style={styles.tournTitle}>{selectedTourn.title}</Text>
          <Text style={styles.sectionTitle}>Standings</Text>

          {players.map((p, idx) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerRank}>#{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{p.userName}</Text>
                <Text style={styles.playerRating}>{p.userRating} ELO</Text>
              </View>
              <Text style={styles.playerScore}>{p.score} pts</Text>
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
  },
  layout: {
    gap: 14,
  },
  title: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  tournCard: {
    backgroundColor: "rgba(13, 14, 21, 0.95)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 16,
    gap: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tournHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tournType: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tournPrize: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "bold",
  },
  tournTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  tournMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backLinkText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 20, 29, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  playerRank: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "bold",
    width: 24,
  },
  playerName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerRating: {
    color: "#A1A1AA",
    fontSize: 11,
  },
  playerScore: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "bold",
  },
});
