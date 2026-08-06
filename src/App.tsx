import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./views/HomeView";
import { PlayVsAiView } from "./views/PlayVsAiView";
import { PlayPassView } from "./views/PlayPassView";
import { PuzzleRushView } from "./views/PuzzleRushView";
import { SettingsModal } from "./views/SettingsModal";
import { GameSettings, PieceTheme } from "./types/chess";
import { StockfishEngine } from "./services/engine";

export default function App() {
  const [currentMode, setCurrentMode] = useState<"home" | "vs_ai" | "pass_and_play" | "puzzle_rush">("home");
  const [selectedAiLevel, setSelectedAiLevel] = useState<number>(1);

  const [settings, setSettings] = useState<GameSettings>(() => {
    let savedTheme: PieceTheme = "neo_staunton";
    try {
      const stored = localStorage.getItem("chess_in_piece_theme") as PieceTheme;
      if (stored) savedTheme = stored;
    } catch (e) {}
    return {
      boardTheme: "slate",
      pieceTheme: savedTheme,
      soundEnabled: true,
      soundPack: "classic",
      highlightLegalMoves: true,
      showEvalBar: true,
      autoFlipBoard: false,
      coachEnabled: true,
      moveAnimationSpeed: "normal",
      lowPowerMode: false,
    };
  });

  useEffect(() => {
    StockfishEngine.setLowPowerMode(settings.lowPowerMode ?? false);
  }, [settings.lowPowerMode]);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.pieceTheme) {
        try {
          localStorage.setItem("chess_in_piece_theme", newSettings.pieceTheme);
        } catch (e) {}
      }
      return updated;
    });
  };

  const handleSelectMode = (mode: string, level?: number) => {
    if (level !== undefined) {
      setSelectedAiLevel(level);
    }
    if (["vs_ai", "pass_and_play", "home", "puzzle_rush"].includes(mode)) {
      setCurrentMode(mode as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />

      {/* Header Navbar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Screen Body */}
      <View style={styles.main}>
        {currentMode === "home" && (
          <HomeView
            settings={settings}
            onSelectMode={handleSelectMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentMode === "vs_ai" && (
          <PlayVsAiView
            initialLevel={selectedAiLevel}
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentMode === "pass_and_play" && (
          <PlayPassView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
          />
        )}

        {currentMode === "puzzle_rush" && (
          <PuzzleRushView
            settings={settings}
            onBackToHome={() => setCurrentMode("home")}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </View>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08090D",
  },
  main: {
    flex: 1,
  },
});
