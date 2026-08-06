const fs = require('fs');
const path = require('path');

// Generate a clean 16-bit Mono 44100Hz wooden chess move click sound
function generateChessMoveWav() {
  const sampleRate = 44100;
  const duration = 0.09; // 90 milliseconds
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // FMT subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // DATA subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate wooden tap waveform
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Wood impact frequencies: fundamental around 650Hz + 1100Hz harmonics
    const f1 = 650;
    const f2 = 1150;
    const f3 = 1800;

    // Fast exponential decay envelope
    const env = Math.exp(-t * 55);

    // Subtle noise burst at start for wood contact
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 120);

    const tone = Math.sin(2 * Math.PI * f1 * t) * 0.6 +
                 Math.sin(2 * Math.PI * f2 * t) * 0.3 +
                 Math.sin(2 * Math.PI * f3 * t) * 0.1;

    const sampleVal = Math.max(-1, Math.min(1, (tone + noise) * env));
    const intSample = Math.floor(sampleVal * 32767);

    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

const soundsDir = path.join(__dirname, 'assets', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const wavBuffer = generateChessMoveWav();
fs.writeFileSync(path.join(soundsDir, 'move.mp3'), wavBuffer);
fs.writeFileSync(path.join(soundsDir, 'move.wav'), wavBuffer);

console.log('Successfully generated chess move sound files in assets/sounds/');
