const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');
const { Chess } = require('chess.js');

async function processLichessPuzzles() {
  console.log("Starting Lichess puzzle dataset extraction...");

  const tempZst = path.join(__dirname, 'puzzles_sample.csv.zst');
  const targetJson = path.join(__dirname, 'src', 'data', 'puzzles.json');

  if (!fs.existsSync(path.dirname(targetJson))) {
    fs.mkdirSync(path.dirname(targetJson), { recursive: true });
  }

  if (!fs.existsSync(tempZst) || fs.statSync(tempZst).size < 1000000) {
    console.log("Downloading 15MB sample of Lichess puzzle database...");
    const { execSync } = require('child_process');
    execSync(`curl -r 0-15728640 -s -o "${tempZst}" https://database.lichess.org/lichess_db_puzzle.csv.zst`);
  }

  console.log("Decompressing and parsing puzzles...");
  const zstdProc = spawn('zstd', ['-dc', tempZst]);

  const rl = readline.createInterface({
    input: zstdProc.stdout,
    crlfDelay: Infinity
  });

  const validPuzzles = [];
  let processedLines = 0;

  for await (const line of rl) {
    processedLines++;
    if (processedLines === 1 && line.startsWith('PuzzleId')) continue;

    const parts = line.split(',');
    if (parts.length < 8) continue;

    const [puzzleId, rawFen, movesStr, ratingStr, ratingDevStr, popularityStr, nbPlaysStr, themesStr] = parts;
    const rating = parseInt(ratingStr, 10);
    const popularity = parseInt(popularityStr, 10);

    if (isNaN(rating) || rating < 700 || rating > 2500) continue;
    if (!isNaN(popularity) && popularity < 60) continue;

    const rawMoves = movesStr.trim().split(' ');
    if (rawMoves.length < 2) continue; // Setup move + at least 1 solution move

    try {
      const chess = new Chess(rawFen);
      
      // Apply opponent setup move (rawMoves[0])
      const setup = rawMoves[0];
      const setupRes = chess.move({
        from: setup.substring(0, 2),
        to: setup.substring(2, 4),
        promotion: setup.length > 4 ? setup.substring(4, 5) : undefined
      });

      if (!setupRes) continue;

      const userStartFen = chess.fen();
      const solutionMoves = rawMoves.slice(1);
      let validSequence = true;

      // Verify solution moves
      for (const m of solutionMoves) {
        const res = chess.move({
          from: m.substring(0, 2),
          to: m.substring(2, 4),
          promotion: m.length > 4 ? m.substring(4, 5) : undefined
        });
        if (!res) {
          validSequence = false;
          break;
        }
      }

      if (validSequence && solutionMoves.length >= 1) {
        // Theme selection
        let theme = "tactics";
        if (themesStr) {
          const themes = themesStr.split(' ');
          const preferred = themes.find(t => 
            ['mate', 'fork', 'pin', 'skewer', 'advantage', 'endgame', 'deflection', 'discoveredAttack', 'backRankMate', 'hangingPiece'].includes(t)
          );
          if (preferred) theme = preferred;
          else if (themes[0]) theme = themes[0];
        }

        validPuzzles.push({
          id: puzzleId,
          fen: userStartFen,
          moves: solutionMoves,
          rating: rating,
          theme: theme,
          description: `${theme.charAt(0).toUpperCase() + theme.slice(1)} • Rating ${rating}`
        });

        if (validPuzzles.length >= 1000) {
          zstdProc.kill();
          break;
        }
      }
    } catch (e) {
      // Skip invalid
    }
  }

  console.log(`Successfully compiled ${validPuzzles.length} user-ready puzzles.`);
  fs.writeFileSync(targetJson, JSON.stringify(validPuzzles, null, 2));
  console.log(`Saved database to ${targetJson}`);

  if (fs.existsSync(tempZst)) {
    fs.unlinkSync(tempZst);
  }
}

processLichessPuzzles().catch(console.error);
