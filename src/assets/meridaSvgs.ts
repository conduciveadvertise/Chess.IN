// Official Lichess / Wikipedia standard Staunton & Merida SVG piece definitions

export const MERIDA_SVGS: Record<string, string> = {
  // WHITE PAWN
  wP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <path d="M 22.5,9 C 19.8,9 17.7,11.1 17.7,13.8 C 17.7,15.5 18.5,17 19.7,18 C 16,19 13,22 13,26 C 13,27.3 13.4,28.5 14.2,29.5 C 11.2,31.5 9,35 9,39 L 36,39 C 36,35 33.8,31.5 30.8,29.5 C 31.6,28.5 32,27.3 32,26 C 32,22 29,19 25.3,18 C 26.5,17 27.3,15.5 27.3,13.8 C 27.3,11.1 25.2,9 22.5,9 z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // WHITE KNIGHT
  wN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#ffffff"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,8.5 C 14.5,10 16.5,10 16.5,10 C 17,9 18.5,8.5 18.5,8.5 C 18.5,8.5 19,9.5 20,10 C 21,10.5 22,10 22,10 z" fill="#ffffff"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#000000"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#000000"/>
    </g>
  </svg>`,

  // WHITE BISHOP
  wB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#ffffff" stroke-linejoin="miter">
        <path d="M 9,36 C 12.39,35.03 19.11,36.46 22.5,34 C 25.89,36.46 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,36.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,30 27.5,26 27.5,21 C 27.5,16 22.5,10 22.5,10 C 22.5,10 17.5,16 17.5,21 C 17.5,26 15,30 15,30 C 15,30 14.5,30.5 15,32 z"/>
        <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z"/>
      </g>
      <path d="M 17.5,26 L 27.5,26"/>
      <path d="M 22.5,21 L 22.5,31"/>
      <path d="M 20,13 L 25,11.5"/>
    </g>
  </svg>`,

  // WHITE ROOK
  wR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="#ffffff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" stroke-linejoin="miter"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" stroke-linejoin="miter"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z"/>
      <path d="M 12,14 L 33,14 L 31,32 L 14,32 L 12,14 z"/>
    </g>
  </svg>`,

  // WHITE QUEEN
  wQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="#ffffff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(-1,-1)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(8.75,-4.5)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(18.5,-6)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(28.25,-4.5)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(38,-1)"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,10 L 14,25 L 7,14 L 9,26 z"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30"/>
      <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"/>
    </g>
  </svg>`,

  // WHITE KING
  wK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6"/>
      <path d="M 20,8 L 25,8"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" fill="#ffffff"/>
      <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,30 41.5,25.5 35.5,17.5 C 31,16.5 27.5,18.5 22.5,18.5 C 17.5,18.5 14,16.5 9.5,17.5 C 3.5,25.5 10.5,30 11.5,37 z" fill="#ffffff"/>
      <path d="M 11.5,30 C 17,29 28,29 33.5,30"/>
      <path d="M 11.5,33.5 C 17,32.5 28,32.5 33.5,33.5"/>
      <path d="M 11.5,37 C 17,36 28,36 33.5,37"/>
    </g>
  </svg>`,

  // BLACK PAWN
  bP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g transform="rotate(180 22.5 22.5)">
      <path d="M 22.5,9 C 19.8,9 17.7,11.1 17.7,13.8 C 17.7,15.5 18.5,17 19.7,18 C 16,19 13,22 13,26 C 13,27.3 13.4,28.5 14.2,29.5 C 11.2,31.5 9,35 9,39 L 36,39 C 36,35 33.8,31.5 30.8,29.5 C 31.6,28.5 32,27.3 32,26 C 32,22 29,19 25.3,18 C 26.5,17 27.3,15.5 27.3,13.8 C 27.3,11.1 25.2,9 22.5,9 z" fill="#000000" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,

  // BLACK KNIGHT
  bN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#000000"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,8.5 C 14.5,10 16.5,10 16.5,10 C 17,9 18.5,8.5 18.5,8.5 C 18.5,8.5 19,9.5 20,10 C 21,10.5 22,10 22,10 z" fill="#000000"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#ffffff" stroke="#ffffff"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#ffffff" stroke="#ffffff"/>
    </g>
  </svg>`,

  // BLACK BISHOP
  bB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#000000" stroke-linejoin="miter">
        <path d="M 9,36 C 12.39,35.03 19.11,36.46 22.5,34 C 25.89,36.46 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,36.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,30 27.5,26 27.5,21 C 27.5,16 22.5,10 22.5,10 C 22.5,10 17.5,16 17.5,21 C 17.5,26 15,30 15,30 C 15,30 14.5,30.5 15,32 z"/>
        <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z"/>
      </g>
      <path d="M 17.5,26 L 27.5,26"/>
      <path d="M 22.5,21 L 22.5,31"/>
      <path d="M 20,13 L 25,11.5"/>
    </g>
  </svg>`,

  // BLACK ROOK
  bR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="#000000" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" stroke-linejoin="miter"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" stroke-linejoin="miter"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 11,14 z"/>
      <path d="M 12,14 L 33,14 L 31,32 L 14,32 L 12,14 z"/>
    </g>
  </svg>`,

  // BLACK QUEEN
  bQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="#000000" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(-1,-1)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(8.75,-4.5)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(18.5,-6)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(28.25,-4.5)"/>
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" transform="translate(38,-1)"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,10 L 14,25 L 7,14 L 9,26 z"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30"/>
      <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5"/>
    </g>
  </svg>`,

  // BLACK KING
  bK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
    <g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6"/>
      <path d="M 20,8 L 25,8"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" fill="#000000"/>
      <path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 C 34.5,30 41.5,25.5 35.5,17.5 C 31,16.5 27.5,18.5 22.5,18.5 C 17.5,18.5 14,16.5 9.5,17.5 C 3.5,25.5 10.5,30 11.5,37 z" fill="#000000"/>
      <path d="M 11.5,30 C 17,29 28,29 33.5,30"/>
      <path d="M 11.5,33.5 C 17,32.5 28,32.5 33.5,33.5"/>
      <path d="M 11.5,37 C 17,36 28,36 33.5,37"/>
    </g>
  </svg>`,
};
