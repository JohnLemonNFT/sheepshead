// ============================================
// ZUSTAND GAME STORE - Central state management
// ============================================

import { create } from 'zustand';
import {
  Card,
  Suit,
  GameState,
  GamePhase,
  Player,
  PlayerPosition,
  PlayerType,
  Trick,
  GameConfig,
  DEFAULT_CONFIG,
  HandScore,
  AIDecision,
  isTrump,
  getCardPoints,
} from '../game/types';
import { createDeck, shuffleDeck, dealCards, sortHand } from '../game/deck';
import {
  getLegalPlays,
  determineTrickWinner,
  getCallableSuits,
  getCallableTens,
  isValidBury,
  mustGoAlone,
} from '../game/rules';
import { calculateHandScore, getHandResultSummary } from '../game/scoring';
import {
  getAIDecision,
  createAIPlayerState,
  AIPlayerState,
  getDetailedExplanation,
  updateAIKnowledge,
} from '../game/ai';
import { useStatsStore, GameResult } from './statsStore';

// ============================================
// STORE TYPES
// ============================================

interface AIExplanation {
  playerPosition: PlayerPosition;
  action: string;
  reason: string;
  detailedExplanation: string;
}

interface LogEntry {
  id: number;
  player: string;
  action: string;
  reason: string;
  timestamp: number;
  isHuman: boolean;
  phase: string;
}

interface TrickResult {
  cards: { card: Card; playedBy: PlayerPosition }[];
  winner: PlayerPosition;
  points: number;
}

// ============================================
// GAME SETTINGS
// ============================================

export type GameSpeed = 'slow' | 'normal' | 'fast';
export type PartnerVariant = 'calledAce' | 'jackOfDiamonds' | 'none';
export type NoPickRule = 'leaster' | 'forcedPick';

export interface GameSettings {
  gameSpeed: GameSpeed;
  partnerVariant: PartnerVariant;
  noPickRule: NoPickRule;
  // Game Variants
  crackingEnabled: boolean; // Allow doubling stakes after pick
  blitzEnabled: boolean; // Black queens can blitz for double stakes
  callTenEnabled: boolean; // Picker with all 3 aces can call a 10
  // Learning & Coaching
  showStrategyTips: boolean;
  showAIExplanations: boolean;
  showBeginnerHelp: boolean;
  coachingEnabled: boolean; // Real-time coaching tips and warnings
  soundVolume: number; // 0-100
  soundMuted: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  gameSpeed: 'normal',
  partnerVariant: 'calledAce',
  noPickRule: 'leaster',
  // Game variants - off by default for standard play
  crackingEnabled: false,
  blitzEnabled: false,
  callTenEnabled: true, // On by default - standard rule
  // Learning
  showStrategyTips: true,
  showAIExplanations: true,
  showBeginnerHelp: true,
  coachingEnabled: true, // On by default for new players
  soundVolume: 70,
  soundMuted: false,
};

// Speed delays in ms
export const SPEED_DELAYS: Record<GameSpeed, number> = {
  slow: 1500,
  normal: 800,
  fast: 300,
};

// ============================================
// STATISTICS TRACKING
// ============================================

export interface GameStatistics {
  // Overall stats
  totalHandsPlayed: number;
  totalGamesStarted: number;

  // Role-based stats (for human player position 0)
  handsAsPicker: number;
  winsAsPicker: number;
  handsAsPartner: number;
  winsAsPartner: number;
  handsAsDefender: number;
  winsAsDefender: number;

  // Picking stats
  timesPassed: number;
  timesCouldPick: number; // Opportunities to pick (position came to you)

  // Trump distribution tracking (to prove fair dealing)
  trumpCountDistribution: number[]; // Index = trump count (0-14), value = times received

  // Leaster stats
  leastersPlayed: number;
  leastersWon: number;

  // Points tracking
  totalPointsWon: number;
  totalPointsLost: number;

  // Schneider/Schwarz
  schneiderWins: number;
  schneiderLosses: number;
  schwarzWins: number;
  schwarzLosses: number;

  // Current session
  sessionStartTime: number;
  lastUpdated: number;
}

export const DEFAULT_STATISTICS: GameStatistics = {
  totalHandsPlayed: 0,
  totalGamesStarted: 0,
  handsAsPicker: 0,
  winsAsPicker: 0,
  handsAsPartner: 0,
  winsAsPartner: 0,
  handsAsDefender: 0,
  winsAsDefender: 0,
  timesPassed: 0,
  timesCouldPick: 0,
  trumpCountDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0-14 trump
  leastersPlayed: 0,
  leastersWon: 0,
  totalPointsWon: 0,
  totalPointsLost: 0,
  schneiderWins: 0,
  schneiderLosses: 0,
  schwarzWins: 0,
  schwarzLosses: 0,
  sessionStartTime: Date.now(),
  lastUpdated: Date.now(),
};

// Default player configuration (1 human, 4 AI)
export const DEFAULT_PLAYER_TYPES: PlayerType[] = ['human', 'ai', 'ai', 'ai', 'ai'];

// ============================================
// STATISTICS PERSISTENCE
// ============================================

const STATS_STORAGE_KEY = 'sheepshead_statistics';

function loadStatistics(): GameStatistics {
  if (typeof window === 'undefined') return { ...DEFAULT_STATISTICS };
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_STATISTICS, ...parsed, sessionStartTime: Date.now() };
    }
  } catch (e) {
    console.warn('Failed to load statistics:', e);
  }
  return { ...DEFAULT_STATISTICS, sessionStartTime: Date.now() };
}

function saveStatistics(stats: GameStatistics): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify({ ...stats, lastUpdated: Date.now() }));
  } catch (e) {
    console.warn('Failed to save statistics:', e);
  }
}

// Generate a provably fair shuffle seed
function generateShuffleSeed(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

interface GameStore {
  // Game state
  gameState: GameState;
  aiStates: Map<PlayerPosition, AIPlayerState>;

  // Settings
  gameSettings: GameSettings;

  // Player configuration for multiplayer
  playerTypes: PlayerType[];

  // Hotseat state
  awaitingHandoff: boolean;
  activeHumanPosition: PlayerPosition | null;

  // Navigation
  currentView: 'home' | 'setup' | 'game' | 'online' | 'onlineWaiting' | 'onlineGame' | 'stats';

  // Modal state
  showSettingsModal: boolean;
  showRulesModal: boolean;
  showStrategyModal: boolean;
  showTutorial: boolean;

  // UI state
  selectedCards: Card[];
  lastAIExplanation: AIExplanation | null;
  showExplanation: boolean;
  animatingTrick: boolean;
  trickResult: TrickResult | null;

  // Score tracking across hands
  playerScores: number[];
  handsPlayed: number;
  handHistory: HandScore[];

  // Statistics tracking (persisted)
  statistics: GameStatistics;

  // Provably fair shuffle seed
  currentShuffleSeed: string | null;

  // Game log
  gameLog: LogEntry[];
  logIdCounter: number;

  // Navigation actions
  goToHome: () => void;
  goToSetup: () => void;
  goToOnline: () => void;
  goToOnlineWaiting: () => void;
  goToOnlineGame: () => void;
  goToStats: () => void;
  startGame: () => void;

  // Player configuration actions
  setPlayerTypes: (types: PlayerType[]) => void;
  confirmHandoff: () => void;

  // Hotseat helpers
  isHotseatMode: () => boolean;
  isCurrentPlayerHuman: () => boolean;
  getHumanCount: () => number;

  // Settings actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openRules: () => void;
  closeRules: () => void;
  openStrategy: () => void;
  closeStrategy: () => void;
  openTutorial: () => void;
  closeTutorial: () => void;

  // Game actions
  newGame: () => void;
  newHand: () => void;
  pick: () => void;
  pass: () => void;
  crack: () => void;
  recrack: () => void;
  noCrack: () => void;
  blitz: () => void;
  bury: (cards: [Card, Card]) => void;
  callAce: (suit: Suit) => void;
  callTen: (suit: Suit) => void;
  goAlone: () => void;
  playCard: (card: Card) => void;
  clearTrickResult: () => void;
  toggleCardSelection: (card: Card) => void;
  clearSelection: () => void;
  showWhyExplanation: (position: PlayerPosition) => void;
  hideExplanation: () => void;
  addLogEntry: (player: string, action: string, reason: string, isHuman: boolean, phase: string) => void;
  clearLog: () => void;

  // Statistics actions
  updateStatistics: (updates: Partial<GameStatistics>) => void;
  resetStatistics: () => void;

  // AI control
  executeAITurn: () => Promise<void>;
  isAITurn: () => boolean;

  // Helpers
  getLegalPlaysForHuman: () => Card[];
  getCallableSuitsForPicker: () => Suit[];
  getCallableTensForPicker: () => Suit[];
  canBurySelection: () => { valid: boolean; reason?: string };
  canBlitz: () => boolean;
  getMultiplier: () => number;
}

// ============================================
// INITIAL STATE
// ============================================

function createInitialGameState(): GameState {
  return {
    config: DEFAULT_CONFIG,
    phase: 'dealing',
    players: [],
    deck: [],
    blind: [],
    buried: [],
    currentTrick: { cards: [], leadPlayer: 0 },
    completedTricks: [],
    currentPlayer: 0,
    dealerPosition: 0,
    pickerPosition: null,
    calledAce: null,
    passCount: 0,
    trickNumber: 1,
  };
}

function createPlayers(): Player[] {
  return Array.from({ length: 5 }, (_, i) => ({
    position: i as PlayerPosition,
    type: i === 0 ? 'human' : 'ai',
    difficulty: 'intermediate',
    hand: [],
    tricksWon: [],
    isDealer: i === 0,
    isPicker: false,
    isPartner: false,
  }));
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

// Load settings from localStorage (client-side only)
function loadSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  try {
    const saved = localStorage.getItem('sheepshead-settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage (client-side only)
function saveSettings(settings: GameSettings) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('sheepshead-settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: createInitialGameState(),
  aiStates: new Map(),
  gameSettings: loadSettings(),
  playerTypes: [...DEFAULT_PLAYER_TYPES],
  awaitingHandoff: false,
  activeHumanPosition: null,
  currentView: 'home',
  showSettingsModal: false,
  showRulesModal: false,
  showTutorial: false,
  showStrategyModal: false,
  selectedCards: [],
  lastAIExplanation: null,
  showExplanation: false,
  animatingTrick: false,
  trickResult: null,
  playerScores: [0, 0, 0, 0, 0],
  handsPlayed: 0,
  handHistory: [],
  statistics: loadStatistics(), // Load from localStorage
  currentShuffleSeed: null,
  gameLog: [],
  logIdCounter: 0,

  // ============================================
  // NAVIGATION ACTIONS
  // ============================================

  goToHome: () => {
    set({ currentView: 'home' });
  },

  goToSetup: () => {
    set({ currentView: 'setup' });
  },

  goToOnline: () => {
    set({ currentView: 'online' });
  },

  goToOnlineWaiting: () => {
    set({ currentView: 'onlineWaiting' });
  },

  goToOnlineGame: () => {
    set({ currentView: 'onlineGame' });
  },

  goToStats: () => {
    set({ currentView: 'stats' });
  },

  startGame: () => {
    const { playerTypes, isHotseatMode } = get();

    // Find the first human position to start with
    const firstHumanPosition = playerTypes.findIndex(t => t === 'human') as PlayerPosition;

    set({
      currentView: 'game',
      // In hotseat mode, start with handoff. Otherwise, reveal first human's hand immediately.
      awaitingHandoff: isHotseatMode(),
      activeHumanPosition: isHotseatMode() ? null : firstHumanPosition,
    });
    get().newGame();
  },

  // ============================================
  // PLAYER CONFIGURATION ACTIONS
  // ============================================

  setPlayerTypes: (types: PlayerType[]) => {
    set({ playerTypes: types });
  },

  confirmHandoff: () => {
    const { gameState } = get();
    set({
      awaitingHandoff: false,
      activeHumanPosition: gameState.currentPlayer,
    });
  },

  // ============================================
  // HOTSEAT HELPERS
  // ============================================

  isHotseatMode: () => {
    const { playerTypes } = get();
    return playerTypes.filter(t => t === 'human').length >= 2;
  },

  isCurrentPlayerHuman: () => {
    const { gameState, playerTypes } = get();
    return playerTypes[gameState.currentPlayer] === 'human';
  },

  getHumanCount: () => {
    const { playerTypes } = get();
    return playerTypes.filter(t => t === 'human').length;
  },

  // ============================================
  // SETTINGS ACTIONS
  // ============================================

  updateSettings: (newSettings: Partial<GameSettings>) => {
    const { gameSettings } = get();
    const updated = { ...gameSettings, ...newSettings };
    set({ gameSettings: updated });
    saveSettings(updated);
  },

  openSettings: () => set({ showSettingsModal: true }),
  closeSettings: () => set({ showSettingsModal: false }),
  openRules: () => set({ showRulesModal: true }),
  closeRules: () => set({ showRulesModal: false }),
  openTutorial: () => set({ showTutorial: true }),
  closeTutorial: () => set({ showTutorial: false }),
  openStrategy: () => set({ showStrategyModal: true }),
  closeStrategy: () => set({ showStrategyModal: false }),

  // ============================================
  // GAME ACTIONS
  // ============================================

  newGame: () => {
    const { statistics } = get();
    const newStats = {
      ...statistics,
      totalGamesStarted: statistics.totalGamesStarted + 1,
    };
    saveStatistics(newStats);
    set({
      playerScores: [0, 0, 0, 0, 0],
      handsPlayed: 0,
      handHistory: [],
      statistics: newStats,
    });
    get().newHand();
  },

  newHand: () => {
    const { handsPlayed, playerTypes, isHotseatMode, gameSettings } = get();

    // Create fresh deck and shuffle
    const deck = createDeck();
    const { deck: shuffled, seed } = shuffleDeck([...deck]);

    // Deal cards
    const { hands, blind } = dealCards(shuffled, 5);

    // Create players using playerTypes configuration
    const dealerPosition = (handsPlayed % 5) as PlayerPosition;
    const players = Array.from({ length: 5 }, (_, i) => ({
      position: i as PlayerPosition,
      type: playerTypes[i],
      difficulty: 'intermediate', // AI plays like experienced player
      hand: sortHand(hands[i]),
      tricksWon: [] as Card[][],
      isDealer: i === dealerPosition,
      isPicker: false,
      isPartner: false,
    })) as Player[];

    // First player to pick is left of dealer
    const firstPicker = ((dealerPosition + 1) % 5) as PlayerPosition;

    // Create AI states only for AI players
    const aiStates = new Map<PlayerPosition, AIPlayerState>();
    for (let i = 0; i < 5; i++) {
      if (playerTypes[i] === 'ai') {
        aiStates.set(
          i as PlayerPosition,
          createAIPlayerState(i as PlayerPosition, 'intermediate', hands[i], null)
        );
      }
    }

    // Build game config from settings
    const gameConfig: GameConfig = {
      ...DEFAULT_CONFIG,
      partnerVariant: gameSettings.partnerVariant,
      noPickVariant: gameSettings.noPickRule,
      cracking: gameSettings.crackingEnabled,
      blitzes: gameSettings.blitzEnabled,
      callTen: gameSettings.callTenEnabled,
    };

    const gameState: GameState = {
      config: gameConfig,
      phase: 'picking',
      players,
      deck: [],
      blind,
      buried: [],
      currentTrick: { cards: [], leadPlayer: firstPicker },
      completedTricks: [],
      currentPlayer: firstPicker,
      dealerPosition,
      pickerPosition: null,
      calledAce: null,
      passCount: 0,
      trickNumber: 1,
      seed,
    };

    // Check if the first player is human in hotseat mode - need handoff
    const firstPlayerIsHuman = playerTypes[firstPicker] === 'human';
    const hotseat = isHotseatMode();

    // In single player mode, always show the human's hand (position 0)
    // In hotseat mode, need handoff before showing any hand
    const humanPosition = playerTypes.findIndex(t => t === 'human') as PlayerPosition;

    // Track trump distribution for statistics (human player's hand)
    const { statistics } = get();
    const humanHand = hands[humanPosition] || hands[0];
    const trumpCount = humanHand.filter(c => isTrump(c)).length;
    const newTrumpDist = [...statistics.trumpCountDistribution];
    newTrumpDist[trumpCount] = (newTrumpDist[trumpCount] || 0) + 1;

    // Generate provably fair shuffle seed for display
    const displaySeed = generateShuffleSeed();

    set({
      gameState,
      aiStates,
      selectedCards: [],
      lastAIExplanation: null,
      showExplanation: false,
      animatingTrick: false,
      gameLog: [],
      logIdCounter: 0,
      currentShuffleSeed: displaySeed,
      statistics: { ...statistics, trumpCountDistribution: newTrumpDist },
      // Trigger handoff if hotseat mode
      awaitingHandoff: hotseat && firstPlayerIsHuman,
      // In single player mode, always show human's hand. In hotseat, wait for handoff.
      activeHumanPosition: hotseat ? (firstPlayerIsHuman ? null : null) : humanPosition,
    });
  },

  pick: () => {
    const { gameState, gameSettings } = get();
    if (gameState.phase !== 'picking') return;

    const currentPlayer = gameState.currentPlayer;
    const player = gameState.players[currentPlayer];

    // Add blind to picker's hand
    const newHand = sortHand([...player.hand, ...gameState.blind]);

    // Update player
    const newPlayers = gameState.players.map((p, i) =>
      i === currentPlayer ? { ...p, hand: newHand, isPicker: true } : p
    );

    // Check if must go alone (has all fail aces after getting blind)
    const mustAlone = mustGoAlone(newHand);

    // Initialize crack state if cracking is enabled
    const crackState = gameSettings.crackingEnabled ? {
      cracked: false,
      crackedBy: null,
      recracked: false,
      blitzed: false,
      multiplier: 1,
    } : undefined;

    // Determine next phase:
    // 1. If must go alone -> playing
    // 2. If cracking enabled -> cracking phase
    // 3. Otherwise -> burying
    let nextPhase: GamePhase = 'burying';
    let nextPlayer = currentPlayer;

    if (mustAlone) {
      nextPhase = 'playing';
      nextPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
    } else if (gameSettings.crackingEnabled) {
      // Cracking phase - start with player after picker
      nextPhase = 'cracking';
      nextPlayer = ((currentPlayer + 1) % 5) as PlayerPosition;
    }

    set({
      gameState: {
        ...gameState,
        phase: nextPhase,
        players: newPlayers,
        blind: [],
        pickerPosition: currentPlayer,
        currentPlayer: nextPlayer,
        currentTrick: mustAlone
          ? {
              cards: [],
              leadPlayer: ((gameState.dealerPosition + 1) % 5) as PlayerPosition,
            }
          : gameState.currentTrick,
        crackState,
      },
      selectedCards: [],
    });
  },

  pass: () => {
    const { gameState, gameSettings, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'picking') return;

    const newPassCount = gameState.passCount + 1;
    const hotseat = isHotseatMode();

    // Check if all players passed (except dealer for forced pick)
    if (newPassCount >= 5) {
      if (gameSettings.noPickRule === 'forcedPick') {
        // Forced pick - dealer must pick
        // The dealer is at position dealerPosition, force them to pick
        const dealerPosition = gameState.dealerPosition;
        const dealer = gameState.players[dealerPosition];

        // Add blind to dealer's hand
        const newHand = sortHand([...dealer.hand, ...gameState.blind]);

        // Update dealer as picker
        const newPlayers = gameState.players.map((p, i) =>
          i === dealerPosition ? { ...p, hand: newHand, isPicker: true } : p
        );

        set({
          gameState: {
            ...gameState,
            phase: 'burying',
            players: newPlayers,
            blind: [],
            pickerPosition: dealerPosition,
            currentPlayer: dealerPosition,
            passCount: newPassCount,
          },
          selectedCards: [],
        });
      } else {
        // Leaster - play the hand with no picker, lowest points wins
        const firstPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
        const firstIsHuman = playerTypes[firstPlayer] === 'human';

        set({
          gameState: {
            ...gameState,
            phase: 'playing',
            passCount: newPassCount,
            currentPlayer: firstPlayer,
            currentTrick: { cards: [], leadPlayer: firstPlayer },
            // No picker in leaster
            pickerPosition: null,
          },
          // Trigger handoff if first player is human in hotseat mode
          ...(hotseat && firstIsHuman ? {
            awaitingHandoff: true,
            activeHumanPosition: null,
          } : {}),
        });
      }
      return;
    }

    // Next player's turn to pick
    const nextPlayer = ((gameState.currentPlayer + 1) % 5) as PlayerPosition;
    const nextIsHuman = playerTypes[nextPlayer] === 'human';

    set({
      gameState: {
        ...gameState,
        currentPlayer: nextPlayer,
        passCount: newPassCount,
      },
      // Trigger handoff if next player is human in hotseat mode
      // In single player mode, activeHumanPosition stays constant
      ...(hotseat && nextIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  bury: (cards: [Card, Card]) => {
    const { gameState, gameSettings, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'burying') return;
    if (gameState.pickerPosition === null) return;

    const picker = gameState.players[gameState.pickerPosition];

    // Remove buried cards from hand
    const newHand = picker.hand.filter(
      c => !cards.some(bc => bc.id === c.id)
    );

    // Handle different partner variants
    const partnerVariant = gameSettings.partnerVariant;
    const hotseat = isHotseatMode();
    const firstPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
    const firstIsHuman = playerTypes[firstPlayer] === 'human';

    if (partnerVariant === 'jackOfDiamonds') {
      // Jack of Diamonds variant - partner is whoever has J♦
      // Check if picker has J♦ (they go alone)
      const pickerHasJackDiamonds = newHand.some(c => c.id === 'J-diamonds');

      // Find partner (only if picker doesn't have J♦)
      let partnerPosition = -1;
      if (!pickerHasJackDiamonds) {
        partnerPosition = gameState.players.findIndex(
          p => p.hand.some(c => c.id === 'J-diamonds') && p.position !== gameState.pickerPosition
        );
      }

      const newPlayers = gameState.players.map((p, i) => ({
        ...p,
        hand: i === gameState.pickerPosition ? sortHand(newHand) : p.hand,
        isPartner: partnerPosition >= 0 && i === partnerPosition,
      }));

      set({
        gameState: {
          ...gameState,
          phase: 'playing',
          players: newPlayers,
          buried: cards,
          currentPlayer: firstPlayer,
          currentTrick: { cards: [], leadPlayer: firstPlayer },
        },
        selectedCards: [],
        ...(hotseat && firstIsHuman ? {
          awaitingHandoff: true,
          activeHumanPosition: null,
        } : {}),
      });
    } else if (partnerVariant === 'none') {
      // Solo variant - picker plays alone
      const newPlayers = gameState.players.map((p, i) => ({
        ...p,
        hand: i === gameState.pickerPosition ? sortHand(newHand) : p.hand,
        isPartner: false,
      }));

      set({
        gameState: {
          ...gameState,
          phase: 'playing',
          players: newPlayers,
          buried: cards,
          currentPlayer: firstPlayer,
          currentTrick: { cards: [], leadPlayer: firstPlayer },
        },
        selectedCards: [],
        ...(hotseat && firstIsHuman ? {
          awaitingHandoff: true,
          activeHumanPosition: null,
        } : {}),
      });
    } else {
      // Called Ace variant (default) - go to calling phase
      const newPlayers = gameState.players.map((p, i) =>
        i === gameState.pickerPosition ? { ...p, hand: sortHand(newHand) } : p
      );

      set({
        gameState: {
          ...gameState,
          phase: 'calling',
          players: newPlayers,
          buried: cards,
        },
        selectedCards: [],
      });
    }
  },

  // ============================================
  // CRACKING ACTIONS
  // ============================================

  crack: () => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'cracking') return;
    if (!gameState.crackState) return;

    const currentPlayer = gameState.currentPlayer;
    const hotseat = isHotseatMode();

    // Update crack state
    const newCrackState = {
      ...gameState.crackState,
      cracked: true,
      crackedBy: currentPlayer,
      multiplier: gameState.crackState.multiplier * 2,
    };

    // Move to picker for potential recrack
    const pickerPosition = gameState.pickerPosition!;
    const pickerIsHuman = playerTypes[pickerPosition] === 'human';

    set({
      gameState: {
        ...gameState,
        crackState: newCrackState,
        currentPlayer: pickerPosition,
        // Stay in cracking phase for recrack decision
      },
      ...(hotseat && pickerIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  recrack: () => {
    const { gameState } = get();
    if (gameState.phase !== 'cracking') return;
    if (!gameState.crackState || !gameState.crackState.cracked) return;

    // Only the picker can recrack
    if (gameState.currentPlayer !== gameState.pickerPosition) return;

    // Picker re-cracks (doubles again) and moves to burying
    const newCrackState = {
      ...gameState.crackState,
      recracked: true,
      multiplier: gameState.crackState.multiplier * 2,
    };

    set({
      gameState: {
        ...gameState,
        phase: 'burying',
        crackState: newCrackState,
        currentPlayer: gameState.pickerPosition!,
      },
    });
  },

  noCrack: () => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'cracking') return;
    if (!gameState.crackState) return;

    const currentPlayer = gameState.currentPlayer;
    const pickerPosition = gameState.pickerPosition!;
    const hotseat = isHotseatMode();

    // If current player is picker (deciding on recrack), move to burying
    if (currentPlayer === pickerPosition) {
      set({
        gameState: {
          ...gameState,
          phase: 'burying',
          currentPlayer: pickerPosition,
        },
      });
      return;
    }

    // Otherwise, check if all non-picker players have passed on cracking
    const nextPlayer = ((currentPlayer + 1) % 5) as PlayerPosition;

    // If we've gone around back to picker without anyone cracking, move to burying
    if (nextPlayer === pickerPosition) {
      set({
        gameState: {
          ...gameState,
          phase: 'burying',
          currentPlayer: pickerPosition,
        },
      });
      return;
    }

    // Continue to next player for crack decision
    const nextIsHuman = playerTypes[nextPlayer] === 'human';

    set({
      gameState: {
        ...gameState,
        currentPlayer: nextPlayer,
      },
      ...(hotseat && nextIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  blitz: () => {
    const { gameState } = get();
    if (gameState.phase !== 'burying') return;
    if (!gameState.crackState) return;
    if (gameState.pickerPosition === null) return;

    const picker = gameState.players[gameState.pickerPosition];

    // Verify picker has both black queens
    const hasQueenClubs = picker.hand.some(c => c.id === 'Q-clubs');
    const hasQueenSpades = picker.hand.some(c => c.id === 'Q-spades');

    if (!hasQueenClubs || !hasQueenSpades) {
      console.error('Cannot blitz without both black queens');
      return;
    }

    // Double the stakes via blitz
    const newCrackState = {
      ...gameState.crackState,
      blitzed: true,
      multiplier: gameState.crackState.multiplier * 2,
    };

    set({
      gameState: {
        ...gameState,
        crackState: newCrackState,
      },
    });
  },

  callAce: (suit: Suit) => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'calling') return;

    // Find partner (player with called ace)
    const partnerPosition = gameState.players.findIndex(
      p =>
        p.hand.some(c => c.suit === suit && c.rank === 'A') &&
        p.position !== gameState.pickerPosition
    );

    // Mark partner (but keep hidden until ace is played)
    const newPlayers = gameState.players.map((p, i) => ({
      ...p,
      isPartner: i === partnerPosition,
    }));

    const firstPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
    const firstIsHuman = playerTypes[firstPlayer] === 'human';
    const hotseat = isHotseatMode();

    set({
      gameState: {
        ...gameState,
        phase: 'playing',
        players: newPlayers,
        calledAce: { suit, revealed: false },
        currentPlayer: firstPlayer,
        currentTrick: { cards: [], leadPlayer: firstPlayer },
      },
      // Trigger handoff if first player is human in hotseat mode
      ...(hotseat && firstIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  callTen: (suit: Suit) => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'calling') return;

    // Find partner (player with the called 10)
    const partnerPosition = gameState.players.findIndex(
      p =>
        p.hand.some(c => c.suit === suit && c.rank === '10' && !isTrump(c)) &&
        p.position !== gameState.pickerPosition
    );

    // Mark partner (but keep hidden until 10 is played)
    const newPlayers = gameState.players.map((p, i) => ({
      ...p,
      isPartner: i === partnerPosition,
    }));

    const firstPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
    const firstIsHuman = playerTypes[firstPlayer] === 'human';
    const hotseat = isHotseatMode();

    set({
      gameState: {
        ...gameState,
        phase: 'playing',
        players: newPlayers,
        calledAce: { suit, revealed: false, isTen: true },
        currentPlayer: firstPlayer,
        currentTrick: { cards: [], leadPlayer: firstPlayer },
      },
      // Trigger handoff if first player is human in hotseat mode
      ...(hotseat && firstIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  goAlone: () => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'calling') return;

    const firstPlayer = ((gameState.dealerPosition + 1) % 5) as PlayerPosition;
    const firstIsHuman = playerTypes[firstPlayer] === 'human';
    const hotseat = isHotseatMode();

    set({
      gameState: {
        ...gameState,
        phase: 'playing',
        currentPlayer: firstPlayer,
        currentTrick: { cards: [], leadPlayer: firstPlayer },
      },
      // Trigger handoff if first player is human in hotseat mode
      ...(hotseat && firstIsHuman ? {
        awaitingHandoff: true,
        activeHumanPosition: null,
      } : {}),
    });
  },

  playCard: (card: Card) => {
    const { gameState, aiStates, playerScores, handsPlayed, handHistory } = get();
    if (gameState.phase !== 'playing') return;

    const currentPlayer = gameState.currentPlayer;
    const player = gameState.players[currentPlayer];

    // Verify legal play
    const legalPlays = getLegalPlays(
      player.hand,
      gameState.currentTrick,
      gameState.calledAce,
      player.isPicker,
      player.isPartner
    );

    if (!legalPlays.some(c => c.id === card.id)) {
      console.error('Illegal play attempted:', card);
      return;
    }

    // Remove card from hand
    const newHand = player.hand.filter(c => c.id !== card.id);

    // Add card to current trick
    const newTrickCards = [
      ...gameState.currentTrick.cards,
      { card, playedBy: currentPlayer },
    ];

    // Check if called card (ace or 10) was played
    let calledAce = gameState.calledAce;
    if (calledAce && !calledAce.revealed && card.suit === calledAce.suit) {
      const calledRank = calledAce.isTen ? '10' : 'A';
      if (card.rank === calledRank) {
        calledAce = { ...calledAce, revealed: true };
      }
    }

    // Update AI knowledge
    const newAIStates = new Map(aiStates);
    for (const [pos, aiState] of newAIStates) {
      newAIStates.set(
        pos,
        updateAIKnowledge(aiState, card, currentPlayer, {
          ...gameState,
          currentTrick: { ...gameState.currentTrick, cards: newTrickCards },
        })
      );
    }

    // Check if trick is complete
    if (newTrickCards.length === 5) {
      // Determine winner
      const trick: Trick = {
        cards: newTrickCards,
        leadPlayer: gameState.currentTrick.leadPlayer,
      };
      const winnerPosition = determineTrickWinner(trick) as PlayerPosition;

      // Calculate trick points
      const trickPoints = newTrickCards.reduce(
        (sum, tc) => sum + getCardPoints(tc.card),
        0
      );

      // Update player hands (remove the played card)
      const newPlayers = gameState.players.map((p, i) => ({
        ...p,
        hand: i === currentPlayer ? newHand : p.hand,
      }));

      // Set trick result for display - don't clear trick yet
      set({
        gameState: {
          ...gameState,
          players: newPlayers,
          currentTrick: {
            ...gameState.currentTrick,
            cards: newTrickCards,
          },
          calledAce,
        },
        aiStates: newAIStates,
        trickResult: {
          cards: newTrickCards,
          winner: winnerPosition,
          points: trickPoints,
        },
        animatingTrick: true,
      });
    } else {
      // Next player in trick
      const nextPlayer = ((currentPlayer + 1) % 5) as PlayerPosition;
      const { playerTypes, isHotseatMode } = get();
      const nextIsHuman = playerTypes[nextPlayer] === 'human';
      const hotseat = isHotseatMode();

      // Update players
      const newPlayers = gameState.players.map((p, i) => ({
        ...p,
        hand: i === currentPlayer ? newHand : p.hand,
      }));

      set({
        gameState: {
          ...gameState,
          players: newPlayers,
          currentTrick: {
            ...gameState.currentTrick,
            cards: newTrickCards,
          },
          currentPlayer: nextPlayer,
          calledAce,
        },
        aiStates: newAIStates,
        // Trigger handoff if next player is human in hotseat mode
        ...(hotseat && nextIsHuman ? {
          awaitingHandoff: true,
          activeHumanPosition: null,
        } : {}),
      });
    }
  },

  clearTrickResult: () => {
    const { gameState, trickResult, playerScores, handsPlayed, handHistory } = get();
    if (!trickResult) return;

    const { winner: winnerPosition, cards: trickCards } = trickResult;

    // Award trick to winner
    const cardArray = trickCards.map(tc => tc.card);
    const newPlayers = gameState.players.map((p, i) => ({
      ...p,
      tricksWon:
        i === winnerPosition ? [...p.tricksWon, cardArray] : p.tricksWon,
    }));

    const completedTricks = [
      ...gameState.completedTricks,
      {
        cards: trickCards,
        leadPlayer: gameState.currentTrick.leadPlayer,
        winningPlayer: winnerPosition,
      },
    ];

    // Check if hand is over
    if (gameState.trickNumber >= 6) {
      // Calculate scores
      const finalState: GameState = {
        ...gameState,
        players: newPlayers,
        completedTricks,
      };

      const handScore = calculateHandScore(finalState);

      // Update running scores
      const newPlayerScores = [...playerScores];
      for (const ps of handScore.playerScores) {
        newPlayerScores[ps.position] += ps.points;
      }

      // Update statistics for human player (position 0)
      const { statistics, playerTypes } = get();
      const humanPosition = playerTypes.findIndex(t => t === 'human');
      const humanPlayer = finalState.players[humanPosition];
      const humanScoreChange = handScore.playerScores.find(ps => ps.position === humanPosition)?.points || 0;
      const humanWon = humanScoreChange > 0;

      const statsUpdate: Partial<GameStatistics> = {
        totalHandsPlayed: statistics.totalHandsPlayed + 1,
        totalPointsWon: statistics.totalPointsWon + (humanWon ? Math.abs(humanScoreChange) : 0),
        totalPointsLost: statistics.totalPointsLost + (!humanWon ? Math.abs(humanScoreChange) : 0),
      };

      // Track role-based stats
      if (humanPlayer?.isPicker) {
        statsUpdate.handsAsPicker = statistics.handsAsPicker + 1;
        if (humanWon) statsUpdate.winsAsPicker = statistics.winsAsPicker + 1;
      } else if (humanPlayer?.isPartner) {
        statsUpdate.handsAsPartner = statistics.handsAsPartner + 1;
        if (humanWon) statsUpdate.winsAsPartner = statistics.winsAsPartner + 1;
      } else if (finalState.pickerPosition !== null) {
        // Defender (not picker, not partner, and there was a picker)
        statsUpdate.handsAsDefender = statistics.handsAsDefender + 1;
        if (humanWon) statsUpdate.winsAsDefender = statistics.winsAsDefender + 1;
      } else {
        // Leaster
        statsUpdate.leastersPlayed = statistics.leastersPlayed + 1;
        if (humanWon) statsUpdate.leastersWon = statistics.leastersWon + 1;
      }

      // Track schneider/schwarz
      if (handScore.isSchneider) {
        if (humanWon) statsUpdate.schneiderWins = statistics.schneiderWins + 1;
        else statsUpdate.schneiderLosses = statistics.schneiderLosses + 1;
      }
      if (handScore.isSchwarz) {
        if (humanWon) statsUpdate.schwarzWins = statistics.schwarzWins + 1;
        else statsUpdate.schwarzLosses = statistics.schwarzLosses + 1;
      }

      const newStats = { ...statistics, ...statsUpdate, lastUpdated: Date.now() };
      saveStatistics(newStats);

      // Record to achievements/stats store (only for single human player games)
      const humanCount = playerTypes.filter(t => t === 'human').length;
      if (humanCount === 1 && humanPosition >= 0) {
        const isLeaster = finalState.pickerPosition === null;
        const pickerTeamPoints = handScore.pickerTeamPoints;
        const defenderTeamPoints = handScore.defenderTeamPoints;
        const humanOnPickerTeam = humanPlayer?.isPicker || humanPlayer?.isPartner;
        const myTeamPoints = humanOnPickerTeam ? pickerTeamPoints : defenderTeamPoints;
        const theirTeamPoints = humanOnPickerTeam ? defenderTeamPoints : pickerTeamPoints;

        const gameResult: GameResult = {
          won: humanWon,
          wasPicker: humanPlayer?.isPicker || false,
          wasLeaster: isLeaster,
          playerPoints: myTeamPoints,
          opponentPoints: theirTeamPoints,
          isSchneider: handScore.isSchneider && humanWon,
          wasSchneidered: handScore.isSchneider && !humanWon,
        };
        useStatsStore.getState().recordGameResult(gameResult, 'local');
      }

      set({
        gameState: {
          ...finalState,
          phase: 'scoring',
          currentTrick: { cards: [], leadPlayer: winnerPosition },
        },
        playerScores: newPlayerScores,
        handsPlayed: handsPlayed + 1,
        handHistory: [...handHistory, handScore],
        statistics: newStats,
        trickResult: null,
        animatingTrick: false,
      });
    } else {
      // Next trick - winner leads
      const { playerTypes, isHotseatMode } = get();
      const winnerIsHuman = playerTypes[winnerPosition] === 'human';
      const hotseat = isHotseatMode();

      set({
        gameState: {
          ...gameState,
          players: newPlayers,
          currentTrick: { cards: [], leadPlayer: winnerPosition },
          completedTricks,
          currentPlayer: winnerPosition,
          trickNumber: gameState.trickNumber + 1,
        },
        trickResult: null,
        animatingTrick: false,
        // Trigger handoff if winner is human in hotseat mode
        ...(hotseat && winnerIsHuman ? {
          awaitingHandoff: true,
          activeHumanPosition: null,
        } : {}),
      });
    }
  },

  toggleCardSelection: (card: Card) => {
    const { selectedCards } = get();
    const isSelected = selectedCards.some(c => c.id === card.id);

    if (isSelected) {
      set({ selectedCards: selectedCards.filter(c => c.id !== card.id) });
    } else if (selectedCards.length < 2) {
      set({ selectedCards: [...selectedCards, card] });
    }
  },

  clearSelection: () => {
    set({ selectedCards: [] });
  },

  showWhyExplanation: (position: PlayerPosition) => {
    const { gameState, aiStates } = get();
    const aiState = aiStates.get(position);
    if (!aiState) return;

    const player = gameState.players[position];
    const decision = getAIDecision(gameState, player, aiState);
    const detailed = getDetailedExplanation(gameState, player, aiState, decision);

    set({
      lastAIExplanation: {
        playerPosition: position,
        action: decision.action.type,
        reason: decision.reason,
        detailedExplanation: detailed,
      },
      showExplanation: true,
    });
  },

  hideExplanation: () => {
    set({ showExplanation: false });
  },

  addLogEntry: (player: string, action: string, reason: string, isHuman: boolean, phase: string) => {
    const { gameLog, logIdCounter } = get();
    const newEntry: LogEntry = {
      id: logIdCounter,
      player,
      action,
      reason,
      timestamp: Date.now(),
      isHuman,
      phase,
    };
    set({
      gameLog: [...gameLog, newEntry],
      logIdCounter: logIdCounter + 1,
    });
  },

  clearLog: () => {
    set({ gameLog: [], logIdCounter: 0 });
  },

  // ============================================
  // STATISTICS ACTIONS
  // ============================================

  updateStatistics: (updates: Partial<GameStatistics>) => {
    const { statistics } = get();
    const newStats = { ...statistics, ...updates, lastUpdated: Date.now() };
    saveStatistics(newStats);
    set({ statistics: newStats });
  },

  resetStatistics: () => {
    const freshStats = { ...DEFAULT_STATISTICS, sessionStartTime: Date.now() };
    saveStatistics(freshStats);
    set({ statistics: freshStats });
  },

  // ============================================
  // AI CONTROL
  // ============================================

  executeAITurn: async () => {
    const { gameState, aiStates } = get();
    const currentPlayer = gameState.currentPlayer;

    // Verify it's an AI player
    if (gameState.players[currentPlayer].type !== 'ai') return;

    const player = gameState.players[currentPlayer];
    const aiState = aiStates.get(currentPlayer);
    if (!aiState) return;

    // Get AI decision
    const decision = getAIDecision(gameState, player, aiState);

    // Store explanation
    const detailed = getDetailedExplanation(gameState, player, aiState, decision);
    set({
      lastAIExplanation: {
        playerPosition: currentPlayer,
        action: decision.action.type,
        reason: decision.reason,
        detailedExplanation: detailed,
      },
    });

    // Build action description for log
    // Import getPlayerDisplayInfo dynamically to get actual player names
    const { getPlayerDisplayInfo } = await import('../game/ai/personalities');
    const displayInfo = getPlayerDisplayInfo(currentPlayer);
    const playerName = displayInfo.name;
    let actionDesc = '';
    switch (decision.action.type) {
      case 'pick': actionDesc = 'picked up the blind'; break;
      case 'pass': actionDesc = 'passed'; break;
      case 'crack': actionDesc = 'cracked! (doubled the stakes)'; break;
      case 'recrack': actionDesc = 're-cracked! (doubled again)'; break;
      case 'noCrack': actionDesc = 'declined to crack'; break;
      case 'blitz': actionDesc = 'declared blitz! (has both black Queens)'; break;
      case 'bury': actionDesc = 'buried 2 cards'; break;
      case 'callAce': actionDesc = `called ${(decision.action as any).suit} ace`; break;
      case 'callTen': actionDesc = `called ${(decision.action as any).suit} 10`; break;
      case 'goAlone': actionDesc = 'is going alone'; break;
      case 'playCard': {
        const c = (decision.action as any).card;
        actionDesc = `played ${c.rank} of ${c.suit}`;
        break;
      }
    }

    // Add to game log
    get().addLogEntry(playerName, actionDesc, decision.reason, false, gameState.phase);

    // Slower delay for better learning experience
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Execute action
    switch (decision.action.type) {
      case 'pick':
        get().pick();
        break;
      case 'pass':
        get().pass();
        break;
      case 'crack':
        get().crack();
        break;
      case 'recrack':
        get().recrack();
        break;
      case 'noCrack':
        get().noCrack();
        break;
      case 'blitz':
        get().blitz();
        break;
      case 'bury':
        get().bury(decision.action.cards);
        break;
      case 'callAce':
        get().callAce(decision.action.suit);
        break;
      case 'callTen':
        get().callTen(decision.action.suit);
        break;
      case 'goAlone':
        get().goAlone();
        break;
      case 'playCard':
        get().playCard(decision.action.card);
        break;
    }
  },

  isAITurn: () => {
    const { gameState } = get();
    const { phase, currentPlayer, players } = gameState;

    if (phase === 'dealing' || phase === 'scoring' || phase === 'gameOver') {
      return false;
    }

    return players[currentPlayer]?.type === 'ai';
  },

  // ============================================
  // HELPERS
  // ============================================

  getLegalPlaysForHuman: () => {
    const { gameState, playerTypes, activeHumanPosition } = get();
    const currentPlayer = gameState.currentPlayer;
    const player = gameState.players[currentPlayer];

    // Check if current player is human and it's their active turn
    if (gameState.phase !== 'playing') return [];
    if (playerTypes[currentPlayer] !== 'human') return [];
    if (activeHumanPosition !== currentPlayer) return [];

    return getLegalPlays(
      player.hand,
      gameState.currentTrick,
      gameState.calledAce,
      player.isPicker,
      player.isPartner
    );
  },

  getCallableSuitsForPicker: () => {
    const { gameState } = get();
    if (gameState.pickerPosition === null) return [];

    const picker = gameState.players[gameState.pickerPosition];
    return getCallableSuits(picker.hand);
  },

  getCallableTensForPicker: () => {
    const { gameState, gameSettings } = get();
    // Only available if callTen is enabled
    if (!gameSettings.callTenEnabled) return [];
    if (gameState.pickerPosition === null) return [];

    const picker = gameState.players[gameState.pickerPosition];
    return getCallableTens(picker.hand);
  },

  canBurySelection: () => {
    const { gameState, selectedCards } = get();
    if (gameState.pickerPosition === null) {
      return { valid: false, reason: 'No picker' };
    }

    const picker = gameState.players[gameState.pickerPosition];
    return isValidBury(selectedCards, picker.hand, null, 2);
  },

  canBlitz: () => {
    const { gameState, gameSettings } = get();

    // Must be in burying phase with blitz enabled
    if (gameState.phase !== 'burying') return false;
    if (!gameSettings.blitzEnabled) return false;
    if (gameState.pickerPosition === null) return false;

    // Cracking must be enabled (crackState exists) for blitz to work
    if (!gameState.crackState) return false;

    // Must not have already blitzed
    if (gameState.crackState.blitzed) return false;

    // Picker must have both black queens
    const picker = gameState.players[gameState.pickerPosition];
    const hasQueenClubs = picker.hand.some(c => c.id === 'Q-clubs');
    const hasQueenSpades = picker.hand.some(c => c.id === 'Q-spades');

    return hasQueenClubs && hasQueenSpades;
  },

  getMultiplier: () => {
    const { gameState } = get();
    return gameState.crackState?.multiplier ?? 1;
  },
}));
