const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const themes = [
  { id: "neo_staunton", dir: "governor", name: "Neo Staunton" },
  { id: "merida", dir: "merida", name: "Merida" },
  { id: "alpha", dir: "alpha", name: "Alpha" },
  { id: "california", dir: "california", name: "California" },
  { id: "leipzig", dir: "leipzig", name: "Leipzig" },
  { id: "chessnut", dir: "chessnut", name: "Chessnut" },
  { id: "maestro", dir: "maestro", name: "Maestro" },
  { id: "cburnett", dir: "cburnett", name: "Cburnett" },
  { id: "pirouetti", dir: "pirouetti", name: "Pirouetti" },
  { id: "staunty", dir: "staunty", name: "Staunty" }
];

const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

async function main() {
  for (const t of themes) {
    const themeDir = path.join(__dirname, 'src/assets/pieceThemes', t.id);
    if (!fs.existsSync(themeDir)) {
      fs.mkdirSync(themeDir, { recursive: true });
    }

    console.log(`Downloading ${t.name} (${t.id})...`);
    for (const p of pieces) {
      const url = `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/${t.dir}/${p}.svg`;
      const filePath = path.join(themeDir, `${p}.svg`);
      
      let downloaded = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          execSync(`curl -s -f -o "${filePath}" "${url}"`, { stdio: 'pipe' });
          downloaded = true;
          break;
        } catch (err) {
          console.warn(`Retry ${attempt} for ${t.id}/${p}`);
          execSync('sleep 0.5');
        }
      }
      if (!downloaded) {
        console.error(`FAILED to download ${t.id}/${p}`);
      }
    }
  }
  console.log('All downloads completed!');
}

main();
