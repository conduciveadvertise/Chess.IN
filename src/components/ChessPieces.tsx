import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { PieceTheme } from "../types/chess";
import { MERIDA_SVGS } from "../assets/meridaSvgs";

interface ChessPieceProps {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
  theme?: PieceTheme;
  size?: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  theme = "merida",
  size = 38,
}) => {
  const isWhite = color === "w";
  const pieceKey = `${color}${type.toUpperCase()}`;

  // Minimalist text fallback if requested
  if (theme === "minimalist") {
    const symbolsWhite: Record<string, string> = {
      p: "♙",
      n: "♘",
      b: "♗",
      r: "♖",
      q: "♕",
      k: "♔",
    };
    const symbolsBlack: Record<string, string> = {
      p: "♟",
      n: "♞",
      b: "♝",
      r: "♜",
      q: "♛",
      k: "♚",
    };
    return (
      <View style={styles.center}>
        <Text
          style={[
            styles.minimalistText,
            {
              fontSize: size * 0.85,
              color: isWhite ? "#F5E080" : "#E2E8F0",
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            },
          ]}
        >
          {isWhite ? symbolsWhite[type] : symbolsBlack[type]}
        </Text>
      </View>
    );
  }

  // Official Lichess Merida SVG rendering
  const xml = MERIDA_SVGS[pieceKey];

  if (xml) {
    return (
      <View style={styles.center}>
        <SvgXml xml={xml} width={size} height={size} />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  minimalistText: {
    fontWeight: "bold",
  },
});
