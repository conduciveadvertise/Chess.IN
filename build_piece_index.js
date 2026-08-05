const fs = require('fs');
const path = require('path');

const themes = [
  { id: "neo_staunton", name: "Neo Staunton" },
  { id: "merida", name: "Merida" },
  { id: "alpha", name: "Alpha" },
  { id: "california", name: "California" },
  { id: "leipzig", name: "Leipzig" },
  { id: "chessnut", name: "Chessnut" },
  { id: "maestro", name: "Maestro" },
  { id: "cburnett", name: "Cburnett" },
  { id: "pirouetti", name: "Pirouetti" },
  { id: "staunty", name: "Staunty" }
];

const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

let output = `// Auto-generated Piece Themes dictionary
import { PieceTheme } from "../types/chess";

export interface PieceThemeInfo {
  id: PieceTheme;
  name: string;
}

export const PIECE_THEME_OPTIONS: PieceThemeInfo[] = [
  { id: "neo_staunton", name: "Neo Staunton" },
  { id: "merida", name: "Merida" },
  { id: "alpha", name: "Alpha" },
  { id: "california", name: "California" },
  { id: "leipzig", name: "Leipzig" },
  { id: "chessnut", name: "Chessnut" },
  { id: "maestro", name: "Maestro" },
  { id: "cburnett", name: "Cburnett" },
  { id: "pirouetti", name: "Pirouetti" },
  { id: "staunty", name: "Staunty" },
];

export const PIECE_THEMES: Record<string, Record<string, string>> = {\n`;

for (const t of themes) {
  const themeDir = path.join(__dirname, 'src/assets/pieceThemes', t.id);
  output += `  "${t.id}": {\n`;
  for (const p of pieces) {
    const filePath = path.join(themeDir, `${p}.svg`);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      continue;
    }
    let svg = fs.readFileSync(filePath, 'utf8').trim();
    
    // Rotate Black Pawn (bP) 180 degrees
    if (p === "bP") {
      let viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
      let cx = 22.5, cy = 22.5;
      if (viewBoxMatch) {
        let parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4) {
          cx = parts[0] + parts[2] / 2;
          cy = parts[1] + parts[3] / 2;
        }
      }
      let svgOpenEnd = svg.indexOf('>');
      let svgCloseStart = svg.lastIndexOf('</svg>');
      if (svgOpenEnd !== -1 && svgCloseStart !== -1) {
        let openTag = svg.substring(0, svgOpenEnd + 1);
        let innerContent = svg.substring(svgOpenEnd + 1, svgCloseStart);
        svg = `${openTag}<g transform="rotate(180 ${cx} ${cy})">${innerContent}</g></svg>`;
      }
    }
    
    output += `    "${p}": ${JSON.stringify(svg)},\n`;
  }
  output += `  },\n`;
}

output += `};\n`;

fs.writeFileSync(path.join(__dirname, 'src/assets/pieceThemes.ts'), output, 'utf8');
console.log('Successfully generated src/assets/pieceThemes.ts!');
