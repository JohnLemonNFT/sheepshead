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
  showStrategyTips: boolean;
  showAIExplanations: boolean;
  soundVolume: number; // 0-100
  soundMuted: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  gameSpeed: 'normal',
  partnerVariant: 'calledAce',
  noPickRule: 'leaster',
  showStrategyTips: true,
  showAIExplanations: true,
  soundVolume: 70,
  soundMuted: false,
};

// Speed delays in ms
export const SPEED_DELAYS: Record<GameSpeed, number> = {
  slow: 1500,
  normal: 800,
  fast: 300,
};

// Default player configuration (1 human, 4 AI)
export const DEFAULT_PLAYER_TYPES: PlayerType[] = ['human', 'ai', 'ai', 'ai', 'ai'];

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
  currentView: 'home' | 'setup' | 'game' | 'online' | 'onlineWaiting' | 'onlineGame';

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

  // Game log
  gameLog: LogEntry[];
  logIdCounter: number;

  // Navigation actions
  goToHome: () => void;
  goToSetup: () => void;
  goToOnline: () => void;
  goToOnlineWaiting: () => void;
  goToOnlineGame: () => void;
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
  bury: (cards: [Card, Card]) => void;
  callAce: (suit: Suit) => void;
  goAlone: () => void;
  playCard: (card: Card) => void;
  clearTrickResult: () => void;
  toggleCardSelection: (card: Card) => void;
  clearSelection: () => void;
  showWhyExplanation: (position: PlayerPosition) => void;
  hideExplanation: () => void;
  addLogEntry: (player: string, action: string, reason: string, isHuman: boolean, phase: string) => void;
  clearLog: () => void;

  // AI control
  executeAITurn: () => Promise<void>;
  isAITurn: () => boolean;

  // Helpers
  getLegalPlaysForHuman: () => Card[];
  getCallableSuitsForPicker: () => Suit[];
  canBurySelection: () => { valid: boolean; reason?: string };
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

// Load settings from localStorage
function loadSettings(): GameSettings {
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

// Save settings to localStorage
function saveSettings(settings: GameSettings) {
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
    set({
      playerScores: [0, 0, 0, 0, 0],
      handsPlayed: 0,
      handHistory: [],
    });
    get().newHand();
  },

  newHand: () => {
    const { handsPlayed, playerTypes, isHotseatMode } = get();

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

    const gameState: GameState = {
      config: DEFAULT_CONFIG,
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

    set({
      gameState,
      aiStates,
      selectedCards: [],
      lastAIExplanation: null,
      showExplanation: false,
      animatingTrick: false,
      gameLog: [],
      logIdCounter: 0,
      // Trigger handoff if hotseat mode
      awaitingHandoff: hotseat && firstPlayerIsHuman,
      // In single player mode, always show human's hand. In hotseat, wait for handoff.
      activeHumanPosition: hotseat ? (firstPlayerIsHuman ? null : null) : humanPosition,
    });
  },

  pick: () => {
    const { gameState } = get();
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

    set({
      gameState: {
        ...gameState,
        phase: mustAlone ? 'playing' : 'burying',
        players: newPlayers,
        blind: [],
        pickerPosition: currentPlayer,
        // If must go alone, skip to playing
        currentPlayer: mustAlone
          ? (((gameState.dealerPosition + 1) % 5) as PlayerPosition)
          : currentPlayer,
        currentTrick: mustAlone
          ? {
              cards: [],
              leadPlayer: ((gameState.dealerPosition + 1) % 5) as PlayerPosition,
            }
          : gameState.currentTrick,
      },
      selectedCards: [],
    });
  },

  pass: () => {
    const { gameState, playerTypes, isHotseatMode } = get();
    if (gameState.phase !== 'picking') return;

    const newPassCount = gameState.passCount + 1;

    // Check if all players passed
    if (newPassCount >= 5) {
      // Leaster - deal new hand or play leaster
      // For MVP, just deal new hand
      set({
        gameState: {
          ...gameState,
          phase: 'scoring',
          passCount: newPassCount,
        },
      });
      return;
    }

    // Next player's turn to pick
    const nextPlayer = ((gameState.currentPlayer + 1) % 5) as PlayerPosition;
    const nextIsHuman = playerTypes[nextPlayer] === 'human';
    const hotseat = isHotseatMode();

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
    const { gameState } = get();
    if (gameState.phase !== 'burying') return;
    if (gameState.pickerPosition === null) return;

    const picker = gameState.players[gameState.pickerPosition];

    // Remove buried cards from hand
    const newHand = picker.hand.filter(
      c => !cards.some(bc => bc.id === c.id)
    );

    // Update picker's hand
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

    // Check if called ace was played
    let calledAce = gameState.calledAce;
    if (
      calledAce &&
      !calledAce.revealed &&
      card.suit === calledAce.suit &&
      card.rank === 'A'
    ) {
      calledAce = { ...calledAce, revealed: true };
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

      set({
        gameState: {
          ...finalState,
          phase: 'scoring',
          currentTrick: { cards: [], leadPlayer: winnerPosition },
        },
        playerScores: newPlayerScores,
        handsPlayed: handsPlayed + 1,
        handHistory: [...handHistory, handScore],
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
    const playerName = `Player ${currentPlayer + 1}`;
    let actionDesc = '';
    switch (decision.action.type) {
      case 'pick': actionDesc = 'picked up the blind'; break;
      case 'pass': actionDesc = 'passed'; break;
      case 'bury': actionDesc = 'buried 2 cards'; break;
      case 'callAce': actionDesc = `called ${(decision.action as any).suit} ace`; break;
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
      case 'bury':
        get().bury(decision.action.cards);
        break;
      case 'callAce':
        get().callAce(decision.action.suit);
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

  canBurySelection: () => {
    const { gameState, selectedCards } = get();
    if (gameState.pickerPosition === null) {
      return { valid: false, reason: 'No picker' };
    }

    const picker = gameState.players[gameState.pickerPosition];
    return isValidBury(selectedCards, picker.hand, null, 2);
  },
}));
