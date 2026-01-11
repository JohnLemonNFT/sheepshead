// ============================================
// SHEEPSHEAD GAME ENGINE
// Shared game logic for both client and server
// ============================================

// Type-only exports (interfaces and type aliases)
export type {
  Card,
  Suit,
  Rank,
  Player,
  PlayerPosition,
  PlayerType,
  AIDifficulty,
  Trick,
  GameState,
  GamePhase,
  GameConfig,
  GameAction,
  CalledAce,
  CrackState,
  HandScore,
  AIDecision,
  PartnerVariant,
  NoPickVariant,
} from './types';

// Runtime values from types (constants and functions)
export {
  DEFAULT_CONFIG,
  POINT_VALUES,
  TRUMP_ORDER,
  FAIL_ORDER,
  FAIL_SUITS,
  isTrump,
  getTrumpPower,
  getFailPower,
  getCardPoints,
  getCardId,
  getTotalPoints,
} from './types';

// Deck operations
export {
  createDeck,
  shuffleDeck,
  dealCards,
  sortHand,
  generateSeed,
} from './deck';

// Rules engine
export {
  getLegalPlays,
  getEffectiveSuit,
  isLegalPlay,
  determineTrickWinner,
  cardBeats,
  canPick,
  allPlayersPassed,
  getCallableSuits,
  getCallableTens,
  canGoAlone,
  mustGoAlone,
  getValidBuryCards,
  isValidBury,
  validateGameState,
} from './rules';

// Scoring
export {
  calculateHandScore,
  getHandResultSummary,
} from './scoring';
