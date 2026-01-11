// Re-export all deck functions from shared game engine
export {
  createDeck,
  shuffleDeck,
  dealCards,
  sortHand,
  generateSeed,
} from '@sheepshead/game-engine';

// Re-export as generateShuffleSeed for backwards compatibility
export { generateSeed as generateShuffleSeed } from '@sheepshead/game-engine';
