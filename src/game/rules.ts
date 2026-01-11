// Re-export all rules from shared game engine
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
} from '@sheepshead/game-engine';
