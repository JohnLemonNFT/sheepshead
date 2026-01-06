// ============================================
// SOUND SYSTEM - Adds soul to the game
// ============================================
// Uses Web Audio API to generate satisfying sounds
// No external files needed - works immediately

type SoundName =
  | 'card_play'
  | 'card_play_trump'
  | 'trick_collect'
  | 'your_turn'
  | 'pick_blind'
  | 'reveal_partner'
  | 'win_hand'
  | 'lose_hand'
  | 'schneider'
  | 'schwarz'
  | 'button_click'
  | 'warning'
  | 'success';

interface SoundSettings {
  volume: number; // 0-100
  muted: boolean;
}

// Audio context (lazy initialized)
let audioContext: AudioContext | null = null;

// Settings
let settings: SoundSettings = {
  volume: 70,
  muted: false,
};

// Initialize audio context (must be called after user interaction)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Master gain for volume control
let masterGain: GainNode | null = null;

function getMasterGain(): GainNode {
  const ctx = getAudioContext();
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  masterGain.gain.value = settings.muted ? 0 : settings.volume / 100;
  return masterGain;
}

// ============================================
// SOUND GENERATORS
// ============================================
// Each sound is carefully crafted to feel satisfying

function playCardPlay(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // White noise burst (thwack)
  const bufferSize = ctx.sampleRate * 0.08; // 80ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    // Noise with quick decay
    const envelope = Math.exp(-i / (bufferSize * 0.15));
    data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Low-pass filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;

  const soundGain = ctx.createGain();
  soundGain.gain.value = 0.6;

  noise.connect(filter);
  filter.connect(soundGain);
  soundGain.connect(gain);
  noise.start();
}

function playCardPlayTrump(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Deeper thwack + subtle tone for trump
  const bufferSize = ctx.sampleRate * 0.1; // 100ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.exp(-i / (bufferSize * 0.2));
    const noise = (Math.random() * 2 - 1) * 0.25;
    const tone = Math.sin(i * 0.05) * 0.15; // Low tone
    data[i] = (noise + tone) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1500;

  const soundGain = ctx.createGain();
  soundGain.gain.value = 0.7;

  source.connect(filter);
  filter.connect(soundGain);
  soundGain.connect(gain);
  source.start();
}

function playTrickCollect(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Soft sweep/whoosh
  const duration = 0.25;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Envelope: fade in then out
    const envelope = Math.sin(t * Math.PI) * 0.3;
    // Filtered noise
    const noise = Math.random() * 2 - 1;
    data[i] = noise * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Sweeping filter
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 2;
  filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + duration);

  const soundGain = ctx.createGain();
  soundGain.gain.value = 0.4;

  source.connect(filter);
  filter.connect(soundGain);
  soundGain.connect(gain);
  source.start();
}

function playYourTurn(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Gentle two-note chime
  const playNote = (freq: number, delay: number, duration: number) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    oscGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  playNote(880, 0, 0.3);      // A5
  playNote(1108.73, 0.1, 0.4); // C#6
}

function playPickBlind(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Anticipation: rising tone with shimmer
  const duration = 0.5;

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);

  oscGain.gain.setValueAtTime(0, ctx.currentTime);
  oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
  oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + duration * 0.7);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(oscGain);
  oscGain.connect(gain);

  osc.start();
  osc.stop(ctx.currentTime + duration);

  // Add shimmer
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.value = 1200;
  shimmerGain.gain.setValueAtTime(0, ctx.currentTime);
  shimmerGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + duration * 0.5);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(gain);
  shimmer.start();
  shimmer.stop(ctx.currentTime + duration);
}

function playRevealPartner(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Dramatic reveal: chord stab
  const frequencies = [440, 554.37, 659.25]; // A major chord
  const duration = 0.6;

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = i === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.value = freq;

    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    oscGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(gain);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  });
}

function playWinHand(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Triumphant fanfare
  const notes = [
    { freq: 523.25, delay: 0, duration: 0.15 },    // C5
    { freq: 659.25, delay: 0.12, duration: 0.15 }, // E5
    { freq: 783.99, delay: 0.24, duration: 0.4 },  // G5
  ];

  notes.forEach(({ freq, delay, duration }) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    oscGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
    oscGain.gain.setValueAtTime(0.18, ctx.currentTime + delay + duration * 0.5);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  });
}

function playLoseHand(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Sympathetic descending tone
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);

  oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(oscGain);
  oscGain.connect(gain);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

function playSchneider(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Extra dramatic: win fanfare + flourish
  playWinHand();

  // Add high flourish after
  setTimeout(() => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.2);

    oscGain.gain.setValueAtTime(0.1, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, 350);
}

function playSchwarz(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Maximum drama: schneider + extra fanfare
  playSchneider();

  // Add triumphant chord
  setTimeout(() => {
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C major with octave

    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(oscGain);
      oscGain.connect(gain);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    });
  }, 500);
}

function playButtonClick(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Subtle click
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 1000;

  oscGain.gain.setValueAtTime(0.1, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(oscGain);
  oscGain.connect(gain);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

function playWarning(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Gentle alert: two-tone
  const playNote = (freq: number, delay: number) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    oscGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    oscGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.2);
  };

  playNote(600, 0);
  playNote(500, 0.12);
}

function playSuccess(): void {
  const ctx = getAudioContext();
  const gain = getMasterGain();

  // Happy ascending notes
  const notes = [
    { freq: 523.25, delay: 0 },    // C5
    { freq: 659.25, delay: 0.08 }, // E5
  ];

  notes.forEach(({ freq, delay }) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    oscGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);

    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.2);
  });
}

// ============================================
// PUBLIC API
// ============================================

const soundMap: Record<SoundName, () => void> = {
  card_play: playCardPlay,
  card_play_trump: playCardPlayTrump,
  trick_collect: playTrickCollect,
  your_turn: playYourTurn,
  pick_blind: playPickBlind,
  reveal_partner: playRevealPartner,
  win_hand: playWinHand,
  lose_hand: playLoseHand,
  schneider: playSchneider,
  schwarz: playSchwarz,
  button_click: playButtonClick,
  warning: playWarning,
  success: playSuccess,
};

export function playSound(name: SoundName): void {
  if (settings.muted) return;

  try {
    soundMap[name]();
  } catch (e) {
    // Audio not available, fail silently
    console.warn('Sound playback failed:', e);
  }
}

export function setVolume(volume: number): void {
  settings.volume = Math.max(0, Math.min(100, volume));
  if (masterGain) {
    masterGain.gain.value = settings.muted ? 0 : settings.volume / 100;
  }
}

export function setMuted(muted: boolean): void {
  settings.muted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : settings.volume / 100;
  }
}

export function getVolume(): number {
  return settings.volume;
}

export function isMuted(): boolean {
  return settings.muted;
}

// Initialize audio context on first user interaction
export function initAudio(): void {
  try {
    getAudioContext();
    getMasterGain();
  } catch (e) {
    console.warn('Audio initialization failed:', e);
  }
}

// Load settings from localStorage
export function loadSoundSettings(): void {
  try {
    const saved = localStorage.getItem('sheepshead_sound_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings = { ...settings, ...parsed };
    }
  } catch (e) {
    // Ignore parse errors
  }
}

// Save settings to localStorage
export function saveSoundSettings(): void {
  try {
    localStorage.setItem('sheepshead_sound_settings', JSON.stringify(settings));
  } catch (e) {
    // Ignore storage errors
  }
}
