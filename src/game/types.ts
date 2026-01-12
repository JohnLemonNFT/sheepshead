// Re-export all types from shared game engine
// This allows existing imports to work without changes

// Type-only re-exports
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
  JackOfDiamondsPartner,
  CrackState,
  HandScore,
  AIDecision,
  PartnerVariant,
  NoPickVariant,
} from '@sheepshead/game-engine';

// Runtime values
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
} from '@sheepshead/game-engine';
