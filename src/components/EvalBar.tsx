import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

interface EvalBarProps {
  score: number; // Positive = White advantage, Negative = Black advantage
  mate?: number | null; // Mate in N moves
  orientation?: "w" | "b";
}

export const EvalBar: React.FC<EvalBarProps> = ({
  score,
  mate = null,
  orientation = "w",
}) => {
  // Determine display text and target white advantage percentage (0 - 100)
  let scoreText = "0.0";
  let targetWhitePercent = 50;

  if (mate !== null && mate !== undefined) {
    if (mate > 0) {
      scoreText = `M${mate}`;
      targetWhitePercent = 100;
    } else if (mate < 0) {
      scoreText = `M${mate}`;
      targetWhitePercent = 0;
    } else {
      scoreText = "M0";
      targetWhitePercent = score >= 0 ? 100 : 0;
    }
  } else if (Math.abs(score) >= 90) {
    if (score > 0) {
      scoreText = "M";
      targetWhitePercent = 100;
    } else {
      scoreText = "-M";
      targetWhitePercent = 0;
    }
  } else {
    if (score > 0) {
      scoreText = `+${score.toFixed(1)}`;
    } else if (score < 0) {
      scoreText = score.toFixed(1);
    } else {
      scoreText = "0.0";
    }

    // Sigmoid mapping for smooth visual representation across score ranges (-12 to +12)
    const clampedScore = Math.max(-12, Math.min(12, score));
    const sig = 2 / (1 + Math.exp(-0.35 * clampedScore)) - 1;
    targetWhitePercent = 50 + sig * 45; // ranges between 5% and 95%
  }

  const animPercent = useRef(new Animated.Value(targetWhitePercent)).current;

  useEffect(() => {
    Animated.timing(animPercent, {
      toValue: targetWhitePercent,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [targetWhitePercent]);

  const isWhiteOrientation = orientation === "w";

  // Height interpolation based on board orientation
  // Orientation "w": White at bottom, Black at top
  // Orientation "b": Black at bottom, White at top
  const topHeight = animPercent.interpolate({
    inputRange: [0, 100],
    outputRange: isWhiteOrientation ? ["100%", "0%"] : ["0%", "100%"],
  });

  const bottomHeight = animPercent.interpolate({
    inputRange: [0, 100],
    outputRange: isWhiteOrientation ? ["0%", "100%"] : ["100%", "0%"],
  });

  const topColor = isWhiteOrientation ? "#0D0E15" : "#F5E6AD";
  const bottomColor = isWhiteOrientation ? "#F5E6AD" : "#0D0E15";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.topBar,
          { height: topHeight, backgroundColor: topColor },
        ]}
      />
      <Animated.View
        style={[
          styles.bottomBar,
          { height: bottomHeight, backgroundColor: bottomColor },
        ]}
      />

      <View style={styles.badgeOverlay} pointerEvents="none">
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{scoreText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 22,
    height: "100%",
    minHeight: 280,
    backgroundColor: "#08090D",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.65)",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  topBar: {
    width: "100%",
  },
  bottomBar: {
    width: "100%",
  },
  badgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(10, 11, 16, 0.94)",
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4AF37",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});

