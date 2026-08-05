import React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { PieceTheme } from "../types/chess";
import { PIECE_THEMES } from "../assets/pieceThemes";

interface ChessPieceProps {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
  theme?: PieceTheme;
  size?: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  theme = "neo_staunton",
  size = 38,
}) => {
  const pieceKey = `${color}${type.toUpperCase()}`;
  const themeDict = PIECE_THEMES[theme] || PIECE_THEMES["neo_staunton"];
  const xml = themeDict ? themeDict[pieceKey] : undefined;

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
});
