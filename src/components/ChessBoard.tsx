import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Chess, Square } from "chess.js";
import { BoardTheme, PieceTheme } from "../types/chess";
import { ChessPiece } from "./ChessPieces";

interface ChessBoardProps {
  chess: Chess;
  boardTheme?: BoardTheme;
  pieceTheme?: PieceTheme;
  orientation?: "w" | "b";
  highlightLegalMoves?: boolean;
  onMove?: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
  fen?: string;
  maxBoardWidth?: number;
  isCardView?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  boardTheme = "slate",
  pieceTheme = "neo_staunton",
  orientation = "w",
  highlightLegalMoves = true,
  onMove,
  disabled = false,
  lastMove = null,
  maxBoardWidth,
  isCardView = false,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);

  // Dynamic width calculation considering container padding (card vs full screen)
  // Card views (e.g. Daily Puzzle) need ~84px inset for screen margins (32px) + card padding (32px) + wood border (20px)
  // Standard views need ~48px inset for screen margins + wood border
  const defaultInset = isCardView ? 84 : 48;
  const targetWidth = maxBoardWidth
    ? Math.min(windowWidth - defaultInset, maxBoardWidth)
    : windowWidth - defaultInset;

  const maxAllowedWidth = Math.min(targetWidth, 540);
  const squareSize = Math.max(26, Math.floor(maxAllowedWidth / 8));
  const boardSize = squareSize * 8;
  const tableWidth = boardSize + 20;

  const getThemeColors = () => {
    switch (boardTheme) {
      case "emerald":
        return {
          light: "#EEEED2",
          dark: "#769656",
          border: "#D4AF37",
          selectGlow: "#F59E0B",
          lastMoveHighlight: "rgba(245, 158, 11, 0.42)",
          coordLight: "#769656",
          coordDark: "#EEEED2",
        };
      case "gold":
        return {
          light: "#E2D1A3",
          dark: "#2B2D3A",
          border: "#D4AF37",
          selectGlow: "#D4AF37",
          lastMoveHighlight: "rgba(212, 175, 55, 0.45)",
          coordLight: "#2B2D3A",
          coordDark: "#E2D1A3",
        };
      case "marble":
        return {
          light: "#F0D9B5",
          dark: "#B58863",
          border: "#D4AF37",
          selectGlow: "#D4AF37",
          lastMoveHighlight: "rgba(212, 175, 55, 0.45)",
          coordLight: "#B58863",
          coordDark: "#F0D9B5",
        };
      case "cyber":
        return {
          light: "#70A0AF",
          dark: "#192A38",
          border: "#00F0FF",
          selectGlow: "#00F0FF",
          lastMoveHighlight: "rgba(0, 240, 255, 0.4)",
          coordLight: "#192A38",
          coordDark: "#70A0AF",
        };
      case "slate":
      default:
        // Original Slate / Wood Theme
        return {
          light: "#E8D3A5",
          dark: "#B98E66",
          border: "#D4AF37",
          selectGlow: "#D4AF37",
          lastMoveHighlight: "rgba(212, 175, 55, 0.45)",
          coordLight: "#B98E66",
          coordDark: "#E8D3A5",
        };
    }
  };

  const themeColors = getThemeColors();
  const isChecked = chess.inCheck();
  const currentTurn = chess.turn();

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  const displayRanks = orientation === "w" ? ranks : [...ranks].reverse();
  const displayFiles = orientation === "w" ? files : [...files].reverse();

  const handleSquarePress = (squareStr: Square) => {
    if (disabled) return;

    if (selectedSquare === squareStr) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    if (selectedSquare && possibleMoves.includes(squareStr)) {
      const piece = chess.get(selectedSquare);

      if (
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && squareStr.endsWith("8")) ||
          (piece.color === "b" && squareStr.endsWith("1")))
      ) {
        setPromotionMove({ from: selectedSquare, to: squareStr });
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (onMove) {
        onMove(selectedSquare, squareStr);
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const clickedPiece = chess.get(squareStr);
    if (clickedPiece && clickedPiece.color === currentTurn) {
      setSelectedSquare(squareStr);
      const moves = chess.moves({ square: squareStr, verbose: true });
      setPossibleMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotionSelect = (promotionPiece: "q" | "r" | "b" | "n") => {
    if (promotionMove && onMove) {
      onMove(promotionMove.from, promotionMove.to, promotionPiece);
    }
    setPromotionMove(null);
  };

  return (
    <View style={[styles.floatingTable, { width: tableWidth }]}>
      {/* Dark Walnut Wood / Luxury Marble Outer Floating Frame */}
      <View style={styles.woodBorderMat}>
        <View
          style={[
            styles.boardFrame,
            {
              borderColor: themeColors.border,
              width: boardSize,
              height: boardSize,
            },
          ]}
        >
          {displayRanks.map((rank, rIdx) => (
            <View key={rank} style={styles.row}>
              {displayFiles.map((file, cIdx) => {
                const squareStr = `${file}${rank}` as Square;
                const isLight = (rIdx + cIdx) % 2 === 0;
                const piece = chess.get(squareStr);

                const isSelected = selectedSquare === squareStr;
                const isPossibleMove = possibleMoves.includes(squareStr);
                const isLastMoveFrom = lastMove?.from === squareStr;
                const isLastMoveTo = lastMove?.to === squareStr;

                const isKingInCheck =
                  isChecked &&
                  piece &&
                  piece.type === "k" &&
                  piece.color === currentTurn;

                return (
                  <Pressable
                    key={squareStr}
                    onPress={() => handleSquarePress(squareStr)}
                    style={[
                      styles.square,
                      {
                        width: squareSize,
                        height: squareSize,
                        backgroundColor: isLight ? themeColors.light : themeColors.dark,
                      },
                      (isLastMoveFrom || isLastMoveTo) && {
                        backgroundColor: themeColors.lastMoveHighlight,
                      },
                      isSelected && {
                        backgroundColor: "rgba(212, 175, 55, 0.5)",
                        borderColor: themeColors.selectGlow,
                        borderWidth: 2,
                      },
                      isKingInCheck && styles.checkSquare,
                    ]}
                  >
                    {/* Rank Label (shown on left column) */}
                    {cIdx === 0 && (
                      <Text
                        style={[
                          styles.coordRank,
                          { color: isLight ? themeColors.coordLight : themeColors.coordDark },
                        ]}
                      >
                        {rank}
                      </Text>
                    )}

                    {/* File Label (shown on bottom row) */}
                    {rIdx === 7 && (
                      <Text
                        style={[
                          styles.coordFile,
                          { color: isLight ? themeColors.coordLight : themeColors.coordDark },
                        ]}
                      >
                        {file}
                      </Text>
                    )}

                    {/* Move Highlight Overlay */}
                    {highlightLegalMoves && isPossibleMove && (
                      <View style={styles.possibleDotOverlay} pointerEvents="none">
                        {piece ? (
                          <View style={[styles.captureRing, { borderColor: themeColors.selectGlow }]} />
                        ) : (
                          <View style={[styles.moveDot, { backgroundColor: themeColors.selectGlow }]} />
                        )}
                      </View>
                    )}

                    {/* Piece Rendering - Always upright standard orientation */}
                    {piece && (
                      <ChessPiece
                        type={piece.type}
                        color={piece.color}
                        theme={pieceTheme}
                        size={squareSize * 0.88}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Pawn Promotion Modal */}
      <Modal visible={Boolean(promotionMove)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>PROMOTION</Text>
            <Text style={styles.modalSub}>Choose grandmaster piece rank:</Text>

            <View style={styles.promoRow}>
              {[
                { type: "q", label: "Queen" },
                { type: "r", label: "Rook" },
                { type: "b", label: "Bishop" },
                { type: "n", label: "Knight" },
              ].map((item) => (
                <Pressable
                  key={item.type}
                  onPress={() => handlePromotionSelect(item.type as any)}
                  style={styles.promoBtn}
                >
                  <ChessPiece
                    type={item.type as any}
                    color={chess.turn()}
                    theme={pieceTheme}
                    size={42}
                  />
                  <Text style={styles.promoLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingTable: {
    alignSelf: "center",
    marginVertical: 4,
    // Realistic floating shadow over luxury background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
  },
  woodBorderMat: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: "#161822",
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  boardFrame: {
    borderWidth: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  square: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  checkSquare: {
    backgroundColor: "rgba(225, 29, 72, 0.85)",
  },
  coordRank: {
    position: "absolute",
    top: 2,
    left: 3,
    fontSize: 10,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coordFile: {
    position: "absolute",
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  possibleDotOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  moveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  captureRing: {
    width: "100%",
    height: "100%",
    borderWidth: 3.5,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#0D0E15",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    padding: 24,
    alignItems: "center",
    width: 310,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  modalSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  promoRow: {
    flexDirection: "row",
    gap: 10,
  },
  promoBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  promoLabel: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 6,
  },
});

