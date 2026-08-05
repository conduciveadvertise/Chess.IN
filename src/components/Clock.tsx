import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

interface ClockProps {
  player?: any;
  playerName?: string;
  playerTitle?: string;
  playerRating?: number;
  timeLeftSeconds?: number;
  initialTime?: number;
  isActive: boolean;
  playerColor?: string;
  avatar?: string;
  capturedPieces?: string[];
  scoreDiff?: number;
  onTimeOut?: () => void;
}

export const Clock: React.FC<ClockProps> = ({
  player,
  playerName,
  playerTitle,
  playerRating,
  timeLeftSeconds,
  initialTime = 600,
  isActive,
  scoreDiff = 0,
  onTimeOut,
}) => {
  const [secLeft, setSecLeft] = useState<number>(
    timeLeftSeconds !== undefined ? timeLeftSeconds : initialTime
  );

  useEffect(() => {
    if (timeLeftSeconds !== undefined) {
      setSecLeft(timeLeftSeconds);
    } else {
      setSecLeft(initialTime);
    }
  }, [timeLeftSeconds, initialTime]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && secLeft > 0) {
      timer = setInterval(() => {
        setSecLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onTimeOut) onTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, secLeft, onTimeOut]);

  const nameToDisplay =
    playerName ||
    player?.username ||
    player?.displayName ||
    "Player";

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.floor(Math.max(0, totalSeconds) % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isLowTime = secLeft <= 30 && secLeft > 0;

  return (
    <View
      style={[
        styles.container,
        isActive ? styles.activeContainer : styles.inactiveContainer,
        isLowTime && isActive && styles.lowTimeContainer,
      ]}
    >
      <View style={styles.playerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {nameToDisplay[0].toUpperCase()}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <View style={styles.titleRow}>
            {Boolean(playerTitle) && <Text style={styles.titleBadge}>{playerTitle}</Text>}
            <Text style={styles.playerName} numberOfLines={1}>
              {nameToDisplay}
            </Text>
          </View>
          {Boolean(playerRating) && (
            <Text style={styles.playerRating}>{playerRating}</Text>
          )}
        </View>
      </View>

      <View style={styles.timeWrap}>
        {scoreDiff > 0 && <Text style={styles.scoreText}>+{scoreDiff}</Text>}
        <Text
          style={[
            styles.timeText,
            isActive && styles.activeTimeText,
            isLowTime && styles.lowTimeText,
          ]}
        >
          {formatTime(secLeft)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 4,
  },
  activeContainer: {
    backgroundColor: "rgba(13, 14, 21, 0.96)",
    borderColor: "rgba(212, 175, 55, 0.6)",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  inactiveContainer: {
    backgroundColor: "rgba(18, 20, 29, 0.65)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    opacity: 0.85,
  },
  lowTimeContainer: {
    borderColor: "#E11D48",
    shadowColor: "#E11D48",
    shadowOpacity: 0.3,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "bold",
  },
  playerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    color: "#D4AF37",
    fontSize: 9,
    fontWeight: "bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  playerName: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "bold",
    flex: 1,
  },
  playerRating: {
    color: "#A1A1AA",
    fontSize: 10,
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreText: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },
  timeText: {
    color: "#A1A1AA",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  activeTimeText: {
    color: "#D4AF37",
  },
  lowTimeText: {
    color: "#F43F5E",
  },
});
