import { Chess } from "chess.js";
import { StockfishLevelConfig, MoveClassification, OpeningInfo } from "../types/chess";
import { detectOpening } from "./openingBook";
import { STOCKFISH_JS_SOURCE } from "../assets/stockfishSource";

// Piece Values in Centipawns for fallback evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// PST tables for positional evaluation fallback
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

export class StockfishEngine {
  private static worker: Worker | null = null;
  private static activeSearchId = 0;

  /**
   * Generates exact configuration specs for Stockfish levels 1 through 20
   */
  static getLevelConfig(level: number): StockfishLevelConfig & {
    skillLevel: number;
    useLimitStrength: boolean;
    thinkingTimeMs: number;
  } {
    const clamped = Math.max(1, Math.min(20, Math.round(level)));
    
    // Exact Elo and Skill progression mapping according to user requirements:
    // Level 1: Elo 400, Skill 0, Thinking 350ms
    // Level 20: Maximum Elo 3100+, Skill 20, Thinking 3000ms
    const elos = [
      400, 550, 700, 850, 1000,
      1150, 1300, 1450, 1600, 1750,
      1900, 2050, 2200, 2350, 2500,
      2650, 2800, 2950, 3100, 3300
    ];
    
    const skillLevels = [
      0, 1, 2, 3, 4,
      6, 8, 10, 12, 14,
      16, 17, 18, 19, 20,
      20, 20, 20, 20, 20
    ];

    const thinkingTimes = [
      350, 400, 450, 500, 600,
      700, 800, 850, 900, 1000,
      1200, 1400, 1600, 1800, 2000,
      2200, 2400, 2600, 2800, 3000
    ];

    const idx = clamped - 1;
    const elo = elos[idx];
    const skillLevel = skillLevels[idx];
    const thinkingTimeMs = thinkingTimes[idx];
    const useLimitStrength = clamped < 20;

    return {
      level: clamped,
      elo,
      depth: Math.min(22, Math.max(1, clamped + 2)),
      blunderRate: 0,
      skillLevel,
      useLimitStrength,
      thinkingTimeMs,
    };
  }

  /**
   * Initializes official Stockfish Web Worker instance (100% offline bundled)
   */
  private static getWorker(): Worker | null {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return null;
    }
    if (!this.worker) {
      try {
        const blob = new Blob([STOCKFISH_JS_SOURCE], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        this.worker = new Worker(workerUrl);
        this.worker.postMessage("uci");
        this.worker.postMessage("isready");
      } catch (e) {
        console.warn("Could not instantiate Web Worker for Stockfish:", e);
        this.worker = null;
      }
    }
    return this.worker;
  }

  /**
   * Aborts any running AI search calculation
   */
  static cancelSearch() {
    this.activeSearchId++;
    if (this.worker) {
      try {
        this.worker.postMessage("stop");
      } catch (e) {}
    }
  }

  /**
   * Evaluates position in pawns (+1.5 means White is leading by 1.5 pawns)
   */
  static evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === "w" ? -99.9 : 99.9;
    }
    if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      return 0;
    }

    let evaluation = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = PIECE_VALUES[piece.type] || 0;
          let pstBonus = 0;
          const squareIdx = piece.color === "w" ? (7 - r) * 8 + c : r * 8 + c;

          if (piece.type === "p") pstBonus = PAWN_PST[squareIdx] || 0;
          else if (piece.type === "n") pstBonus = KNIGHT_PST[squareIdx] || 0;
          else if (piece.type === "b") pstBonus = BISHOP_PST[squareIdx] || 0;

          const totalPieceValue = val + pstBonus * 0.1;

          if (piece.color === "w") {
            evaluation += totalPieceValue;
          } else {
            evaluation -= totalPieceValue;
          }
        }
      }
    }

    return parseFloat((evaluation / 100).toFixed(1));
  }

  /**
   * Asynchronous, official Stockfish engine move calculator
   */
  static async getBestMoveAsync(
    chess: Chess,
    level: number = 1
  ): Promise<{ from: string; to: string; promotion?: string; evalAfter?: number } | null> {
    const currentSearchId = ++this.activeSearchId;
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    const config = this.getLevelConfig(level);
    const worker = this.getWorker();

    if (worker) {
      return new Promise((resolve) => {
        let isResolved = false;
        let lastEval = this.evaluatePosition(chess);

        const cleanup = () => {
          if (worker) {
            worker.removeEventListener("message", onMessage);
          }
        };

        const timer = setTimeout(() => {
          if (!isResolved && this.activeSearchId === currentSearchId) {
            isResolved = true;
            cleanup();
            // Fallback move if worker timed out
            const fallback = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            resolve({
              from: fallback.from,
              to: fallback.to,
              promotion: fallback.promotion || "q",
              evalAfter: lastEval,
            });
          }
        }, config.thinkingTimeMs + 2000);

        const onMessage = (event: MessageEvent) => {
          if (this.activeSearchId !== currentSearchId) {
            cleanup();
            clearTimeout(timer);
            return;
          }

          const line = typeof event.data === "string" ? event.data : event.data?.data;
          if (typeof line !== "string") return;

          // Parse evaluation score
          if (line.includes("score cp ")) {
            const cpMatch = line.match(/score cp (-?\d+)/);
            if (cpMatch) {
              const cp = parseInt(cpMatch[1], 10);
              lastEval = parseFloat(((chess.turn() === "w" ? cp : -cp) / 100).toFixed(1));
            }
          } else if (line.includes("score mate ")) {
            const mateMatch = line.match(/score mate (-?\d+)/);
            if (mateMatch) {
              const m = parseInt(mateMatch[1], 10);
              lastEval = m > 0 ? 99.0 : -99.0;
            }
          }

          // Parse bestmove
          if (line.startsWith("bestmove ")) {
            isResolved = true;
            cleanup();
            clearTimeout(timer);

            const match = line.match(/^bestmove\s+([a-h][1-8])([a-h][1-8])([qrbn])?/);
            if (match) {
              resolve({
                from: match[1],
                to: match[2],
                promotion: match[3] || "q",
                evalAfter: lastEval,
              });
            } else {
              const fallback = legalMoves[0];
              resolve({
                from: fallback.from,
                to: fallback.to,
                promotion: fallback.promotion || "q",
                evalAfter: lastEval,
              });
            }
          }
        };

        worker.addEventListener("message", onMessage);

        // Configure Stockfish UCI parameters
        worker.postMessage("ucinewgame");
        worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
        if (config.useLimitStrength) {
          worker.postMessage("setoption name UCI_LimitStrength value true");
          worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
        } else {
          worker.postMessage("setoption name UCI_LimitStrength value false");
        }

        worker.postMessage(`position fen ${chess.fen()}`);
        worker.postMessage(`go movetime ${config.thinkingTimeMs}`);
      });
    }

    // Fallback if Web Worker is not available in environment
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.activeSearchId !== currentSearchId) {
          resolve(null);
          return;
        }
        const bestMove = this.getBestMove(chess, level, true);
        resolve(bestMove);
      }, config.thinkingTimeMs);
    });
  }

  /**
   * Computes best move synchronously (fallback)
   */
  static getBestMove(chess: Chess, level: number = 1, instant: boolean = false): { from: string; to: string; promotion?: string; evalAfter?: number } | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const config = this.getLevelConfig(level);

    let bestMove = moves[0];
    let bestValue = chess.turn() === "w" ? -Infinity : Infinity;
    const depth = Math.min(4, Math.max(1, Math.floor(config.level / 4)));

    for (const move of moves) {
      chess.move(move);
      const val = this.minimax(chess, depth - 1, -Infinity, Infinity, chess.turn() === "w");
      chess.undo();

      if (chess.turn() === "w") {
        if (val > bestValue) {
          bestValue = val;
          bestMove = move;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          bestMove = move;
        }
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion || "q",
      evalAfter: parseFloat(bestValue.toFixed(1)),
    };
  }

  /**
   * Minimax search with alpha-beta pruning (fallback)
   */
  private static minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth <= 0 || chess.isGameOver()) {
      return this.evaluatePosition(chess);
    }

    const moves = chess.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalVal = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalVal = this.minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /**
   * Classifies move quality based on evaluation delta
   */
  static classifyMove(evalBefore: number, evalAfter: number, turn: "w" | "b"): MoveClassification {
    const diff = turn === "w" ? evalAfter - evalBefore : evalBefore - evalAfter;

    if (diff >= 2.0) return "brilliant";
    if (diff >= 1.0) return "great";
    if (diff >= 0.2) return "best";
    if (diff >= -0.1) return "excellent";
    if (diff >= -0.4) return "good";
    if (diff >= -0.9) return "inaccuracy";
    if (diff >= -2.0) return "mistake";
    return "blunder";
  }

  /**
   * Recognize current opening
   */
  static identifyOpening(historySan: string[]): OpeningInfo {
    return detectOpening(historySan);
  }

  /**
   * Returns complete FIDE state summary
   */
  static getFideStatus(chess: Chess) {
    return {
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isThreefoldRepetition: chess.isThreefoldRepetition(),
      isInsufficientMaterial: chess.isInsufficientMaterial(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
    };
  }
}
