// ============================================
// CORE TYPES FOR SHEEPSHEAD GAME ENGINE
// ============================================

// Card suits - Diamonds is special (trump suit)
export type Suit = 'clubs' | 'spades' | 'hearts' | 'diamonds';

// Card ranks used in Sheepshead (7-A only, no 2-6)
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// A card in the game
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique identifier like "Q-clubs"
}

// Point values for each rank
export const POINT_VALUES: Record<Rank, number> = {
  'A': 11,
  '10': 10,
  'K': 4,
  'Q': 3,
  'J': 2,
  '9': 0,
  '8': 0,
  '7': 0,
};

// Trump cards in order of power (index 0 = highest)
// All Queens, all Jacks, then Diamonds A-10-K-9-8-7
export const TRUMP_ORDER: string[] = [
  'Q-clubs', 'Q-spades', 'Q-hearts', 'Q-diamonds',
  'J-clubs', 'J-spades', 'J-hearts', 'J-diamonds',
  'A-diamonds', '10-diamonds', 'K-diamonds', '9-diamonds', '8-diamonds', '7-diamonds',
];

// Fail suit card order (within each fail suit)
export const FAIL_ORDER: Rank[] = ['A', '10', 'K', '9', '8', '7'];

// Player positions (0-4 for 5-handed)
export type PlayerPosition = 0 | 1 | 2 | 3 | 4;

// Player types
export type PlayerType = 'human' | 'ai';

// AI difficulty levels
export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// A player in the game
export interface Player {
  position: PlayerPosition;
  type: PlayerType;
  difficulty?: AIDifficulty;
  hand: Card[];
  tricksWon: Card[][]; // Each trick is an array of cards
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean; // True once revealed
  partnerProbability?: number; // 0-1, AI's estimate
}

// Game phases
export type GamePhase =
  | 'dealing'
  | 'picking'      // Players decide to pick or pass
  | 'cracking'     // Defenders can crack (double stakes)
  | 'burying'      // Picker buries 2 cards
  | 'calling'      // Picker calls partner (called ace variant)
  | 'playing'      // Trick-taking phase
  | 'scoring'      // Hand complete, calculating scores
  | 'gameOver';    // Game finished

// Represents a single trick in progress or completed
export interface Trick {
  cards: { card: Card; playedBy: PlayerPosition }[];
  leadPlayer: PlayerPosition;
  winningPlayer?: PlayerPosition;
  leadSuit?: Suit | 'trump'; // The effective suit that was led
}

// Partner selection variants
export type PartnerVariant = 'calledAce' | 'jackOfDiamonds' | 'none';

// What happens when no one picks
export type NoPickVariant = 'leaster' | 'doubler' | 'forcedPick';

// Game configuration options
export interface GameConfig {
  playerCount: 3 | 4 | 5 | 6;
  partnerVariant: PartnerVariant;
  noPickVariant: NoPickVariant;
  doubleOnBump: boolean;
  cracking: boolean;
  blitzes: boolean;
  callTen: boolean; // Allow calling a 10 when picker has all 3 fail aces
}

// Default 5-handed config
export const DEFAULT_CONFIG: GameConfig = {
  playerCount: 5,
  partnerVariant: 'calledAce',
  noPickVariant: 'leaster',
  doubleOnBump: true,
  cracking: false,
  blitzes: false,
  callTen: true,
};

// Called ace/ten info (when using called ace partner variant)
export interface CalledAce {
  suit: Suit; // The fail suit that was called
  revealed: boolean; // Has the called card been played?
  isTen?: boolean; // True if calling a 10 (picker has all 3 aces)
}

// Cracking/Blitz state
export interface CrackState {
  cracked: boolean; // Has anyone cracked?
  crackedBy: PlayerPosition | null; // Who cracked
  recracked: boolean; // Did picker recrack?
  blitzed: boolean; // Did picker blitz with black queens?
  multiplier: number; // Total stake multiplier (1, 2, 4, etc.)
}

// Complete game state
export interface GameState {
  config: GameConfig;
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  blind: Card[];
  buried: Card[]; // Cards buried by picker
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number; // How many players have passed on picking
  trickNumber: number; // 1-6 for 5-handed
  lastAction?: GameAction;
  seed?: string; // For provably fair shuffling
  // Variant state
  crackState?: CrackState; // Cracking/recracking state
  isLeaster?: boolean; // True when playing leaster (no picker)
}

// Actions that can be taken
export type GameAction =
  | { type: 'deal' }
  | { type: 'pick' }
  | { type: 'pass' }
  | { type: 'crack' }       // Defender doubles stakes
  | { type: 'recrack' }     // Picker re-doubles
  | { type: 'noCrack' }     // Pass on cracking
  | { type: 'blitz' }       // Picker reveals black queens to double
  | { type: 'bury'; cards: [Card, Card] }
  | { type: 'callAce'; suit: Suit }
  | { type: 'callTen'; suit: Suit } // Call a 10 when picker has all 3 aces
  | { type: 'goAlone' }
  | { type: 'playCard'; card: Card }
  | { type: 'newGame' };

// Result of an AI decision
export interface AIDecision {
  action: GameAction;
  reason: string;
  alternatives?: { action: GameAction; reason: string }[];
}

// Scoring result for a hand
export interface HandScore {
  pickerTeamPoints: number;
  defenderTeamPoints: number;
  pickerWins: boolean;
  isSchneider: boolean; // Loser got < 31
  isSchwarz: boolean;   // Loser got 0 tricks
  multiplier: number;   // From doublers, cracking, etc.
  playerScores: { position: PlayerPosition; points: number }[];
}

// Helper to get card ID
export function getCardId(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

// Helper to check if a card is trump
export function isTrump(card: Card): boolean {
  return card.rank === 'Q' || card.rank === 'J' || card.suit === 'diamonds';
}

// Helper to get trump power (lower = more powerful, -1 if not trump)
export function getTrumpPower(card: Card): number {
  if (!isTrump(card)) return -1;
  return TRUMP_ORDER.indexOf(getCardId(card));
}

// Helper to get fail power within a suit (lower = more powerful)
export function getFailPower(card: Card): number {
  return FAIL_ORDER.indexOf(card.rank);
}

// Get point value of a card
export function getCardPoints(card: Card): number {
  return POINT_VALUES[card.rank];
}

// Get total points in a set of cards
export function getTotalPoints(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + getCardPoints(card), 0);
}

// Fail suits only (not diamonds, which is trump)
export const FAIL_SUITS: Suit[] = ['clubs', 'spades', 'hearts'];
