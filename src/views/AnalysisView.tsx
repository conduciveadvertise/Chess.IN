import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { Chess } from "chess.js";
import { StockfishEngine } from "../services/engine";
import { ChessBoard } from "../components/ChessBoard";
import { EvalBar } from "../components/EvalBar";
import { MoveHistory } from "../components/MoveHistory";
import { AiCoachPanel } from "../components/AiCoachPanel";
import { GameSettings } from "../types/chess";
import { BarChart3, ChevronLeft, Copy, Check, RefreshCw } from "lucide-react-native";

interface AnalysisViewProps {
  settings: GameSettings;
  onBackToHome: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ settings, onBackToHome }) => {
  const [chess] = useState<Chess>(() => new Chess());
  const [fenInput, setFenInput] = useState<string>(chess.fen());
  const [fen, setFen] = useState<string>(chess.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [evalScore, setEvalScore] = useState<number>(0.0);
  const [orientation, setOrientation] = useState<"w" | "b">("w");

  const updatePositionEval = async (c: Chess) => {
    // Immediate static PST/material score for instant UI response
    const staticScore = StockfishEngine.evaluatePosition(c);
    setEvalScore(staticScore);

    // Deep async calculation using bundled Stockfish WebWorker
    try {
      const res = await StockfishEngine.getBestMoveAsync(c, 10);
      if (res && typeof res.evalAfter === "number") {
        setEvalScore(res.evalAfter);
      }
    } catch (e) {
      // Fallback to static score
    }
  };

  const handleMove = (from: string, to: string, promotion?: string) => {
    try {
      const moveObj = chess.move({ from, to, promotion: promotion || "q" });
      if (moveObj) {
        const newFen = chess.fen();
        setFen(newFen);
        setFenInput(newFen);
        setHistory(chess.history());
        setLastMove({ from: moveObj.from, to: moveObj.to });
        updatePositionEval(chess);
      }
    } catch (e) {
      console.log("Invalid move", e);
    }
  };

  const handleApplyFen = () => {
    try {
      chess.load(fenInput.trim());
      setFen(chess.fen());
      setHistory([]);
      setLastMove(null);
      updatePositionEval(chess);
    } catch (e) {
      // invalid fen
    }
  };

  const handleReset = () => {
    chess.reset();
    const startFen = chess.fen();
    setFen(startFen);
    setFenInput(startFen);
    setHistory([]);
    setLastMove(null);
    updatePositionEval(chess);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topHeader}>
        <Pressable onPress={onBackToHome} style={styles.exitBtn}>
          <ChevronLeft size={16} color="#E4E4E7" />
          <Text style={styles.exitBtnText}>Exit Analysis</Text>
        </Pressable>

        <View style={styles.badge}>
          <BarChart3 size={14} color="#D4AF37" />
          <Text style={styles.badgeText}>Analysis Engine</Text>
        </View>
      </View>

      <View style={styles.boardWrap}>
        <ChessBoard
          chess={chess}
          boardTheme={settings.boardTheme}
          pieceTheme={settings.pieceTheme}
          orientation={orientation}
          highlightLegalMoves={settings.highlightLegalMoves}
          onMove={handleMove}
          lastMove={lastMove}
        />
        {settings.showEvalBar && (
          <View style={{ height: 320 }}>
            <EvalBar score={evalScore} orientation={orientation} />
          </View>
        )}
      </View>

      {/* FEN Control Form */}
      <View style={styles.fenCard}>
        <Text style={styles.fenLabel}>FEN POSITION</Text>
        <View style={styles.fenRow}>
          <TextInput
            value={fenInput}
            onChangeText={setFenInput}
            style={styles.fenInput}
            placeholderTextColor="#71717A"
          />
          <Pressable onPress={handleApplyFen} style={styles.loadBtn}>
            <Text style={styles.loadBtnText}>Load</Text>
          </Pressable>
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <RefreshCw size={14} color="#D4AF37" />
          </Pressable>
        </View>
      </View>

      <MoveHistory
        history={history}
        onFlipBoard={() => setOrientation(orientation === "w" ? "b" : "w")}
      />
      <AiCoachPanel
        fen={fen}
        lastMoveSan={history[history.length - 1]}
        pgn={chess.pgn()}
        evalScore={evalScore}
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
  boardWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fenCard: {
    backgroundColor: "rgba(13, 14, 21, 0.95)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    padding: 16,
    gap: 10,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  fenLabel: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fenRow: {
    flexDirection: "row",
    gap: 8,
  },
  fenInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFF",
    fontSize: 12,
  },
  loadBtn: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  loadBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  resetBtn: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
});
