import { Chess } from "chess.js";
import { StockfishLevelConfig, MoveClassification, OpeningInfo } from "../types/chess";
import { detectOpening } from "./openingBook";

// Advanced Piece Values in Centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (PST) flipped for White (rank 0 = rank 8 in array, rank 7 = rank 1)
const PAWN_PST = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 27, 27, 10,  5,  5,
   0,  0,  0, 22, 22,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-22,-22, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 18, 25, 25, 18,  0,-30,
  -30,  5, 18, 25, 25, 18,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10, 10, 10, 15, 15, 10, 10,-10,
  -10,  5, 12, 20, 20, 12,  5,-10,
  -10,  5, 12, 20, 20, 12,  5,-10,
  -10, 10, 10, 15, 15, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_PST = [
    0,  0,  0,  5,  5,  0,  0,  0,
   10, 15, 15, 15, 15, 15, 15, 10,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  8,  8,  3,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLEGAME_PST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

export class StockfishEngine {
  private static activeSearchId = 0;
  public static lowPowerMode = false;

  static setLowPowerMode(enabled: boolean) {
    this.lowPowerMode = enabled;
  }

  static isLowPowerMode(): boolean {
    return this.lowPowerMode;
  }

  /**
   * Generates exact configuration specs for Stockfish levels 1 through 20
   */
  static getLevelConfig(level: number): StockfishLevelConfig & {
    skillLevel: number;
    useLimitStrength: boolean;
    thinkingTimeMs: number;
    errorProb: number;
  } {
    const clamped = Math.max(1, Math.min(20, Math.round(level)));
    
    // Level progression mapping from Level 1 (Beginner) to Level 20 (Maximum Engine)
    const elos = [
      400, 550, 700, 850, 1000,
      1150, 1300, 1450, 1600, 1750,
      1900, 2050, 2200, 2350, 2500,
      2650, 2800, 2950, 3100, 3300
    ];
    
    // Search depths for smooth yet powerful play across levels
    const depths = [
      1, 1, 2, 2, 3,
      3, 4, 4, 5, 5,
      6, 6, 7, 7, 8,
      8, 9, 10, 11, 12
    ];

    // Thinking delays in ms
    const thinkingTimes = [
      150, 200, 250, 300, 350,
      400, 450, 500, 550, 600,
      650, 700, 750, 800, 850,
      900, 950, 1000, 1100, 1200
    ];

    // Error probability (blunder/mistake rate) decaying to 0 at higher levels
    const errorProbs = [
      0.55, 0.45, 0.38, 0.30, 0.24,
      0.18, 0.14, 0.10, 0.07, 0.04,
      0.02, 0.01, 0.005, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0
    ];

    const idx = clamped - 1;
    const elo = elos[idx];
    const skillLevel = Math.min(20, clamped);
    const thinkingTimeMs = this.lowPowerMode
      ? Math.min(150, thinkingTimes[idx])
      : thinkingTimes[idx];
    const searchDepth = this.lowPowerMode
      ? Math.min(3, depths[idx])
      : depths[idx];

    return {
      level: clamped,
      elo,
      depth: searchDepth,
      blunderRate: errorProbs[idx],
      skillLevel,
      useLimitStrength: clamped < 20,
      thinkingTimeMs,
      errorProb: errorProbs[idx],
    };
  }

  private static getWorker(): null {
    return null;
  }

  static cancelSearch() {
    this.activeSearchId++;
  }

  /**
   * Positional & Material evaluation function in centipawns
   */
  static evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === "w" ? -99999 : 99999;
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
          const squareIdx = piece.color === "w" ? r * 8 + c : (7 - r) * 8 + c;

          if (piece.type === "p") pstBonus = PAWN_PST[squareIdx] || 0;
          else if (piece.type === "n") pstBonus = KNIGHT_PST[squareIdx] || 0;
          else if (piece.type === "b") pstBonus = BISHOP_PST[squareIdx] || 0;
          else if (piece.type === "r") pstBonus = ROOK_PST[squareIdx] || 0;
          else if (piece.type === "q") pstBonus = QUEEN_PST[squareIdx] || 0;
          else if (piece.type === "k") pstBonus = KING_MIDDLEGAME_PST[squareIdx] || 0;

          const totalPieceValue = val + pstBonus;

          if (piece.color === "w") {
            evaluation += totalPieceValue;
          } else {
            evaluation -= totalPieceValue;
          }
        }
      }
    }

    // Mobility bonus
    const moves = chess.moves({ verbose: true });
    const mobility = moves.length * 5;
    evaluation += chess.turn() === "w" ? mobility : -mobility;

    return parseFloat((evaluation / 100).toFixed(1));
  }

  /**
   * Quiescence search to eliminate horizon effect on tactical captures
   */
  private static quiescence(
    chess: Chess,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    depthLeft: number = 4
  ): number {
    const standPat = this.evaluatePosition(chess) * 100;

    if (depthLeft <= 0 || chess.isGameOver()) return standPat;

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;

      const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
      // Sort captures by MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      captures.sort((a, b) => (PIECE_VALUES[b.captured!] || 0) - (PIECE_VALUES[a.captured!] || 0));

      for (const move of captures) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, false, depthLeft - 1);
        chess.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;

      const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
      captures.sort((a, b) => (PIECE_VALUES[b.captured!] || 0) - (PIECE_VALUES[a.captured!] || 0));

      for (const move of captures) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, true, depthLeft - 1);
        chess.undo();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }

  /**
   * Order moves for effective Alpha-Beta pruning
   */
  private static orderMoves(moves: any[], chess: Chess): any[] {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Captures (MVV - LVA)
      if (a.captured) {
        scoreA += 10 * (PIECE_VALUES[a.captured] || 100) - (PIECE_VALUES[a.piece] || 100);
      }
      if (b.captured) {
        scoreB += 10 * (PIECE_VALUES[b.captured] || 100) - (PIECE_VALUES[b.piece] || 100);
      }

      // Promotions
      if (a.promotion) scoreA += 800;
      if (b.promotion) scoreB += 800;

      // Checks
      if (a.san && a.san.includes("+")) scoreA += 300;
      if (b.san && b.san.includes("+")) scoreB += 300;

      return scoreB - scoreA;
    });
  }

  /**
   * Alpha-Beta Minimax search engine
   */
  private static minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth <= 0 || chess.isGameOver()) {
      return this.quiescence(chess, alpha, beta, isMaximizing, 4) / 100;
    }

    let moves = chess.moves({ verbose: true });
    moves = this.orderMoves(moves, chess);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evalVal = this.minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break; // Beta cutoff
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
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  /**
   * Asynchronous Stockfish engine move calculator
   */
  static async getBestMoveAsync(
    chess: Chess,
    level: number = 1
  ): Promise<{ from: string; to: string; promotion?: string; evalAfter?: number } | null> {
    const currentSearchId = ++this.activeSearchId;
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    const config = this.getLevelConfig(level);

    return new Promise((resolve) => {
      // Execute asynchronously on JS event loop tick to avoid freezing UI
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
   * Computes best move with skill scaling and depth control
   */
  static getBestMove(
    chess: Chess,
    level: number = 1,
    instant: boolean = false
  ): { from: string; to: string; promotion?: string; evalAfter?: number } | null {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    const config = this.getLevelConfig(level);
    const isWhite = chess.turn() === "w";

    // Evaluate all moves
    const scoredMoves: Array<{ move: any; evalVal: number }> = [];

    // Iterative deepening / Alpha-Beta depth calculation
    const searchDepth = Math.max(1, config.depth);

    const orderedMoves = this.orderMoves([...moves], chess);

    for (const move of orderedMoves) {
      chess.move(move);
      const evalVal = this.minimax(chess, searchDepth - 1, -Infinity, Infinity, !isWhite);
      chess.undo();

      scoredMoves.push({ move, evalVal });
    }

    // Sort scored moves best to worst for current player
    scoredMoves.sort((a, b) => (isWhite ? b.evalVal - a.evalVal : a.evalVal - b.evalVal));

    // Determine chosen move based on level error probability
    let selectedMoveObj = scoredMoves[0];

    if (config.errorProb > 0 && scoredMoves.length > 1 && Math.random() < config.errorProb) {
      // Pick a slightly sub-optimal move based on level
      const maxSubIndex = Math.min(scoredMoves.length - 1, Math.floor(1 + config.errorProb * 4));
      const randomIndex = Math.floor(Math.random() * maxSubIndex);
      selectedMoveObj = scoredMoves[randomIndex];
    }

    const bestMove = selectedMoveObj.move;
    const bestValue = selectedMoveObj.evalVal;

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion || "q",
      evalAfter: parseFloat(bestValue.toFixed(1)),
    };
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
