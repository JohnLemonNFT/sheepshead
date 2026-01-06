// ============================================
// SERVER TYPES FOR ONLINE MULTIPLAYER
// ============================================

// Core types (shared with client)
export type Suit = 'clubs' | 'spades' | 'hearts' | 'diamonds';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type PlayerPosition = 0 | 1 | 2 | 3 | 4;
export type PlayerType = 'human' | 'ai';

export interface Player {
  position: PlayerPosition;
  type: PlayerType;
  hand: Card[];
  tricksWon: Card[][];
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean;
}

export type GamePhase =
  | 'dealing'
  | 'picking'
  | 'burying'
  | 'calling'
  | 'playing'
  | 'scoring'
  | 'gameOver';

export interface Trick {
  cards: { card: Card; playedBy: PlayerPosition }[];
  leadPlayer: PlayerPosition;
  winningPlayer?: PlayerPosition;
  leadSuit?: Suit | 'trump';
}

export interface CalledAce {
  suit: Suit;
  revealed: boolean;
}

export interface GameConfig {
  playerCount: number;
  partnerVariant: 'calledAce' | 'jackOfDiamonds' | 'none';
  noPickVariant: 'leaster' | 'doubler' | 'forcedPick';
  doubleOnBump: boolean;
  cracking: boolean;
  blitzes: boolean;
}

export interface GameState {
  config: GameConfig;
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  blind: Card[];
  buried: Card[];
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number;
  trickNumber: number;
  seed?: string;
}

export type GameAction =
  | { type: 'pick' }
  | { type: 'pass' }
  | { type: 'bury'; cards: [Card, Card] }
  | { type: 'callAce'; suit: Suit }
  | { type: 'goAlone' }
  | { type: 'playCard'; card: Card };

// ============================================
// MULTIPLAYER TYPES
// ============================================

export interface PlayerInfo {
  position: PlayerPosition;
  name: string;
  connected: boolean;
}

// Client → Server messages
export type ClientMessage =
  | { type: 'create_room'; playerName: string }
  | { type: 'join_room'; roomCode: string; playerName: string }
  | { type: 'start_game' }
  | { type: 'action'; action: GameAction }
  | { type: 'leave_room' }
  | { type: 'set_ai'; position: PlayerPosition; enabled: boolean };

// Server → Client messages
export type ServerMessage =
  | { type: 'room_created'; roomCode: string; position: PlayerPosition }
  | { type: 'room_joined'; roomCode: string; position: PlayerPosition; players: PlayerInfo[] }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; position: PlayerPosition }
  | { type: 'room_update'; players: PlayerInfo[] }
  | { type: 'game_started' }
  | { type: 'game_state'; state: ClientGameState; yourPosition: PlayerPosition }
  | { type: 'error'; message: string };

// Game state sent to clients (with hidden cards)
export interface ClientGameState {
  phase: GamePhase;
  players: ClientPlayer[];
  blind: number; // Just count, not actual cards
  currentTrick: Trick;
  completedTricks: Trick[];
  currentPlayer: PlayerPosition;
  dealerPosition: PlayerPosition;
  pickerPosition: PlayerPosition | null;
  calledAce: CalledAce | null;
  passCount: number;
  trickNumber: number;
  // Score tracking
  playerScores: number[];
  handsPlayed: number;
}

// Player info sent to clients
export interface ClientPlayer {
  position: PlayerPosition;
  name: string;
  cardCount: number;
  hand: Card[] | null; // Only populated for the receiving player
  tricksWon: Card[][];
  isDealer: boolean;
  isPicker: boolean;
  isPartner: boolean;
  isAI: boolean;
  connected: boolean;
}
