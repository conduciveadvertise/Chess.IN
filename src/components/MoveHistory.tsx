import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  RefreshCw,
} from "lucide-react-native";

interface MoveHistoryProps {
  history: string[];
  currentMoveIndex?: number;
  onNavigateMove?: (index: number) => void;
  onUndo?: () => void;
  onFlipBoard?: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex = history.length - 1,
  onNavigateMove,
  onUndo,
  onFlipBoard,
}) => {
  const pairedMoves: Array<{
    round: number;
    white: string;
    black?: string;
    whiteIdx: number;
    blackIdx?: number;
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    pairedMoves.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIdx: i,
      black: history[i + 1],
      blackIdx: i + 1 < history.length ? i + 1 : undefined,
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MOVE LOG</Text>
        <Text style={styles.headerCount}>{history.length} MOVES</Text>
      </View>

      {/* Move Rows */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pairedMoves.length === 0 ? (
          <Text style={styles.emptyText}>Match initiated... Moves will log here.</Text>
        ) : (
          pairedMoves.map((item) => (
            <View key={item.round} style={styles.moveRow}>
              <Text style={styles.roundNum}>{item.round}.</Text>

              {/* White move */}
              <Pressable
                onPress={() => onNavigateMove && onNavigateMove(item.whiteIdx)}
                style={[
                  styles.moveBtn,
                  currentMoveIndex === item.whiteIdx && styles.activeMoveBtn,
                ]}
              >
                <Text
                  style={[
                    styles.moveText,
                    currentMoveIndex === item.whiteIdx && styles.activeMoveText,
                  ]}
                >
                  {item.white}
                </Text>
              </Pressable>

              {/* Black move */}
              {item.black ? (
                <Pressable
                  onPress={() =>
                    onNavigateMove && item.blackIdx !== undefined && onNavigateMove(item.blackIdx)
                  }
                  style={[
                    styles.moveBtn,
                    currentMoveIndex === item.blackIdx && styles.activeMoveBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.moveText,
                      currentMoveIndex === item.blackIdx && styles.activeMoveText,
                    ]}
                  >
                    {item.black}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.movePlaceholder} />
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Navigation & Controls Footer */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => onNavigateMove && onNavigateMove(-1)}
          style={styles.ctrlBtn}
          disabled={history.length === 0}
        >
          <ChevronsLeft size={16} color={history.length > 0 ? "#D4AF37" : "#52525B"} />
        </Pressable>

        <Pressable
          onPress={() =>
            onNavigateMove && onNavigateMove(Math.max(-1, currentMoveIndex - 1))
          }
          style={styles.ctrlBtn}
          disabled={currentMoveIndex < 0}
        >
          <ChevronLeft size={16} color={currentMoveIndex >= 0 ? "#D4AF37" : "#52525B"} />
        </Pressable>

        <Pressable
          onPress={() =>
            onNavigateMove &&
            onNavigateMove(Math.min(history.length - 1, currentMoveIndex + 1))
          }
          style={styles.ctrlBtn}
          disabled={currentMoveIndex >= history.length - 1}
        >
          <ChevronRight
            size={16}
            color={currentMoveIndex < history.length - 1 ? "#D4AF37" : "#52525B"}
          />
        </Pressable>

        <Pressable
          onPress={() => onNavigateMove && onNavigateMove(history.length - 1)}
          style={styles.ctrlBtn}
          disabled={history.length === 0}
        >
          <ChevronsRight size={16} color={history.length > 0 ? "#D4AF37" : "#52525B"} />
        </Pressable>

        {onFlipBoard && (
          <Pressable onPress={onFlipBoard} style={styles.ctrlBtn}>
            <RefreshCw size={14} color="#D4AF37" />
          </Pressable>
        )}

        {onUndo && (
          <Pressable onPress={onUndo} style={styles.ctrlBtn} disabled={history.length === 0}>
            <RotateCcw size={14} color={history.length > 0 ? "#F43F5E" : "#52525B"} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(13, 14, 21, 0.95)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 12,
    height: 180,
    justifyContent: "space-between",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerCount: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollList: {
    flex: 1,
    marginVertical: 6,
  },
  scrollContent: {
    gap: 4,
  },
  emptyText: {
    color: "#71717A",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
  moveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roundNum: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "bold",
    width: 28,
  },
  moveBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  activeMoveBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.25)",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  moveText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "600",
  },
  activeMoveText: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  movePlaceholder: {
    flex: 1,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  ctrlBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});
